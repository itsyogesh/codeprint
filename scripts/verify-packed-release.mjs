import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { createHash } from "node:crypto"
import { lstat, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises"
import { createRequire } from "node:module"
import { tmpdir } from "node:os"
import { basename, join, resolve, sep } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

// The caller must build first. This script never builds, publishes, or calls a printer.
const repository = fileURLToPath(new URL("../", import.meta.url))
const argumentsList = process.argv.slice(2)
const verifyExisting = argumentsList.includes("--verify-existing")
const positional = argumentsList.filter((argument) => argument !== "--verify-existing")
assert.equal(
  positional.length,
  1,
  "Usage: node scripts/verify-packed-release.mjs <artifact-directory> [--verify-existing]",
)
const artifactDirectory = resolve(positional[0])
assert.notEqual(artifactDirectory, repository, "Use a dedicated artifact directory, not the repository root.")
const packages = ["core", "print", "cli", "mcp"]
const manifestName = "release-manifest.json"
const previewUri = "ui://codeprint/pdf-preview.html"
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm"

function run(command, args, { cwd = repository, input, timeout = 180_000, env = process.env } = {}) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, { cwd, env, stdio: ["pipe", "pipe", "pipe"], shell: false })
    const output = []
    const errors = []
    let killTimer
    const timer = setTimeout(() => {
      child.kill("SIGTERM")
      killTimer = setTimeout(() => child.kill("SIGKILL"), 1_000)
      killTimer.unref()
    }, timeout)
    child.stdout.on("data", (chunk) => output.push(chunk))
    child.stderr.on("data", (chunk) => errors.push(chunk))
    child.on("error", (error) => {
      clearTimeout(timer)
      clearTimeout(killTimer)
      reject(error)
    })
    child.on("close", (code, signal) => {
      clearTimeout(timer)
      clearTimeout(killTimer)
      const stdout = Buffer.concat(output).toString("utf8")
      const stderr = Buffer.concat(errors).toString("utf8")
      if (code !== 0) {
        reject(new Error(`${basename(command)} ${args[0]} failed (${signal ?? code}).\n${stdout}\n${stderr}`))
      } else resolveRun({ stdout, stderr })
    })
    child.stdin.on("error", () => {})
    child.stdin.end(input)
  })
}

function allowedFile(packageName, file) {
  if (["LICENSE", "README.md", "package.json"].includes(file)) return true
  if (packageName === "core") {
    return (
      file === "THIRD_PARTY_NOTICES.md" ||
      /^assets\/fonts\/(merriweather|mulish|source-code-pro)\/OFL\.(txt|md)$/.test(file) ||
      /^dist\/[^/]+\.(js|d\.ts)$/.test(file)
    )
  }
  if (/^dist\/index\.(js|d\.ts)$/.test(file)) return true
  if (packageName === "mcp") {
    return (
      file === "dist/pdf-preview.html" ||
      file === "dist/THIRD_PARTY_NOTICES.md" ||
      /^dist\/licenses\/(MCP-Apps-LICENSE|PDFjs-LICENSE|Merriweather-OFL|Mulish-OFL)\.txt$/.test(file)
    )
  }
  return false
}

async function walk(directory, relative = "") {
  const entries = await readdir(join(directory, relative), { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const name = relative ? `${relative}/${entry.name}` : entry.name
    assert(!entry.isSymbolicLink(), `Package contains a symbolic link: ${name}`)
    if (entry.isDirectory()) files.push(...(await walk(directory, name)))
    else {
      assert(entry.isFile(), `Package contains a non-regular file: ${name}`)
      files.push(name)
    }
  }
  return files.sort()
}

async function inspectTarball(packageName, tarball, temporary) {
  assert((await lstat(tarball)).isFile(), `Artifact must be a regular file: ${tarball}`)
  const listing = await run("tar", ["-tzf", tarball])
  const entries = listing.stdout.trim().split("\n")
  assert.equal(new Set(entries).size, entries.length, "Archive contains duplicate paths")
  for (const entry of entries) {
    assert(entry.startsWith("package/"), `Unexpected archive root: ${entry}`)
    assert(!entry.includes("\\") && !entry.split("/").includes(".."), `Unsafe archive path: ${entry}`)
  }
  const detailed = await run("tar", ["-tvzf", tarball])
  assert(
    detailed.stdout
      .trim()
      .split("\n")
      .every((line) => line.startsWith("-") || line.startsWith("d")),
    `Archive contains a link or special file: ${basename(tarball)}`,
  )
  const extracted = join(temporary, `inspect-${packageName}`)
  await mkdir(extracted)
  await run("tar", ["-xzf", tarball, "-C", extracted])
  const packageRoot = join(extracted, "package")
  const files = await walk(packageRoot)
  for (const file of files) assert(allowedFile(packageName, file), `Unexpected ${packageName} package file: ${file}`)
  for (const required of ["LICENSE", "README.md", "package.json", "dist/index.js", "dist/index.d.ts"]) {
    assert(files.includes(required), `${packageName} is missing ${required}`)
  }
  const metadata = JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8"))
  assert.equal(metadata.name, `@codeprint/${packageName}`)
  assert.equal(metadata.license, "AGPL-3.0-only")
  assert.equal(metadata.private, undefined, `${metadata.name} must not be private`)
  assert.equal(metadata.repository.url, "git+https://github.com/itsyogesh/codeprint.git")
  assert.equal(basename(tarball), `codeprint-${packageName}-${metadata.version}.tgz`)
  if (packageName === "cli" || packageName === "mcp") {
    assert.deepEqual(metadata.bin, { [packageName === "cli" ? "codeprint" : "codeprint-mcp"]: "dist/index.js" })
    for (const dependency of ["@codeprint/core", "@codeprint/print"]) {
      assert.equal(metadata.dependencies?.[dependency], metadata.version, "Internal dependency versions must match")
    }
  }
  function verifyExport(value) {
    if (typeof value === "string") {
      assert(value.startsWith("./") && files.includes(value.slice(2)), `Missing package export: ${value}`)
    } else for (const nested of Object.values(value)) verifyExport(nested)
  }
  verifyExport(metadata.exports)
  for (const [name, target] of Object.entries(metadata.bin ?? {})) {
    assert(files.includes(target), `Executable ${name} is missing ${target}`)
    assert((await readFile(join(packageRoot, target), "utf8")).startsWith("#!/usr/bin/env node"))
  }
  if (packageName === "core") {
    for (const required of [
      "THIRD_PARTY_NOTICES.md",
      "assets/fonts/merriweather/OFL.txt",
      "assets/fonts/mulish/OFL.txt",
      "assets/fonts/source-code-pro/OFL.md",
    ])
      assert(files.includes(required), `Core is missing bundled-asset notice ${required}`)
  }
  if (packageName === "mcp") {
    for (const required of [
      "dist/pdf-preview.html",
      "dist/THIRD_PARTY_NOTICES.md",
      "dist/licenses/MCP-Apps-LICENSE.txt",
      "dist/licenses/PDFjs-LICENSE.txt",
      "dist/licenses/Merriweather-OFL.txt",
      "dist/licenses/Mulish-OFL.txt",
    ])
      assert(files.includes(required), `MCP is missing viewer asset ${required}`)
    const viewer = await readFile(join(packageRoot, "dist/pdf-preview.html"), "utf8")
    assert(viewer.includes("Codeprint preview") && !viewer.includes("CODEPRINT_APP_SCRIPT"), "Viewer was not built")
  }
  const bytes = await readFile(tarball)
  return {
    name: metadata.name,
    version: metadata.version,
    filename: basename(tarball),
    sha256: createHash("sha256").update(bytes).digest("hex"),
    sizeBytes: bytes.length,
  }
}

async function verifyPdf(path, PDFDocument) {
  const bytes = await readFile(path)
  assert.equal(bytes.subarray(0, 5).toString("ascii"), "%PDF-")
  const pdf = await PDFDocument.load(bytes)
  assert(pdf.getPageCount() > 0, `No paper pages in ${path}`)
  return bytes
}

async function consumerTests(consumer, tarballs) {
  console.log("Installing the four exact tarballs into an isolated consumer (dependency scripts disabled).")
  await writeFile(
    join(consumer, "package.json"),
    JSON.stringify({ name: "codeprint-release-consumer", private: true, type: "module" }),
  )
  await writeFile(join(consumer, "npmrc"), "")
  await run(
    npmCommand,
    [
      "install",
      "--ignore-scripts",
      "--no-package-lock",
      "--no-audit",
      "--no-fund",
      "--registry=https://registry.npmjs.org",
      "--userconfig",
      join(consumer, "npmrc"),
      "--cache",
      join(consumer, ".npm-cache"),
      ...tarballs,
    ],
    { cwd: consumer, timeout: 300_000 },
  )
  const consumerRequire = createRequire(join(consumer, "package.json"))
  console.log("Testing installed CLI executable, document formats, embedded assets, and stdin.")
  const { PDFDocument } = await import(pathToFileURL(consumerRequire.resolve("pdf-lib")).href)
  // On Unix, npm/npx launch the installed .bin symlink. Testing the real dist path
  // alone misses entrypoint guards that incorrectly reject symlink invocation.
  const cli = join(
    consumer,
    process.platform === "win32" ? "node_modules/@codeprint/cli/dist/index.js" : "node_modules/.bin/codeprint",
  )
  const cases = [
    {
      filename: "notes.md",
      content:
        "# Release check\n\nReadable **Markdown** from a clean package install.\n\n```mermaid\nflowchart TD\nA[Source] --> B[Reading copy]\n```\n",
    },
    { filename: "sample.ts", content: "const releaseReady: boolean = true\n" },
    { filename: "sample.json", content: '{"release":"test","private":false}\n' },
    { filename: "sample.csv", content: "Document,Status\nSynthetic,Ready\n" },
  ]
  for (const sample of cases) {
    const source = join(consumer, sample.filename)
    const output = join(consumer, `${sample.filename}.pdf`)
    await writeFile(source, sample.content)
    const result = await run(process.execPath, [cli, "--json", "render", source, "--output", output], { cwd: consumer })
    assert(result.stdout.trim(), "Installed CLI produced no output; verify its npm-bin entrypoint guard.")
    const metadata = JSON.parse(result.stdout)
    assert.equal(metadata.path, output)
    assert.equal(
      metadata.format,
      sample.filename.endsWith(".md") ? "markdown" : sample.filename.endsWith(".csv") ? "csv" : "code",
    )
    await verifyPdf(output, PDFDocument)
  }
  const stdinOutput = join(consumer, "stdin.pdf")
  await run(process.execPath, [cli, "render", "-", "--format", "markdown", "--output", stdinOutput], {
    cwd: consumer,
    input: "# Standard input\n\nA synthetic reading copy.\n",
  })
  await verifyPdf(stdinOutput, PDFDocument)
  const { Client } = await import(
    pathToFileURL(consumerRequire.resolve("@modelcontextprotocol/sdk/client/index.js")).href
  )
  const { StdioClientTransport } = await import(
    pathToFileURL(consumerRequire.resolve("@modelcontextprotocol/sdk/client/stdio.js")).href
  )
  const mcp = join(
    consumer,
    process.platform === "win32" ? "node_modules/@codeprint/mcp/dist/index.js" : "node_modules/.bin/codeprint-mcp",
  )
  console.log("Testing installed MCP executable over real stdio, exact PDF resources, and Apps negotiation.")
  for (const apps of [false, true]) {
    const outputDirectory = join(consumer, apps ? "mcp-apps-output" : "mcp-plain-output")
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [mcp],
      cwd: consumer,
      env: { ...process.env, CODEPRINT_OUTPUT_DIR: outputDirectory },
      stderr: "pipe",
    })
    const client = new Client(
      { name: "codeprint-packed-consumer", version: "1.0.0" },
      {
        capabilities: apps
          ? { extensions: { "io.modelcontextprotocol/ui": { mimeTypes: ["text/html;profile=mcp-app"] } } }
          : {},
      },
    )
    let stderr = ""
    transport.stderr?.on("data", (chunk) => {
      stderr += chunk.toString()
    })
    const deadline = setTimeout(() => {
      void transport.close()
    }, 120_000)
    try {
      await client.connect(transport)
      const tools = (await client.listTools()).tools
      const create = tools.find((tool) => tool.name === "create_printable_pdf")
      const preview = tools.find((tool) => tool.name === "preview_pdf")
      assert(create && preview, "Required PDF tools were not registered")
      const result = await client.callTool({
        name: "create_printable_pdf",
        arguments: {
          content: "# Packed MCP\n\nSynthetic local PDF resource.\n",
          format: "markdown",
          filename: "packed.md",
        },
      })
      assert(!result.isError, `MCP rendering failed: ${JSON.stringify(result)} ${stderr}`)
      const metadata = result.structuredContent
      assert(metadata && typeof metadata.path === "string" && typeof metadata.resourceUri === "string")
      assert(resolve(metadata.path).startsWith(`${resolve(outputDirectory)}${sep}`), "MCP wrote outside test output")
      const saved = await verifyPdf(metadata.path, PDFDocument)
      const resource = await client.readResource({ uri: metadata.resourceUri })
      assert.equal(resource.contents[0].mimeType, "application/pdf")
      assert.deepEqual(Buffer.from(resource.contents[0].blob, "base64"), saved)
      assert(!(await client.callTool({ name: "preview_pdf", arguments: { documentId: metadata.documentId } })).isError)
      await assert.rejects(client.readResource({ uri: "file:///etc/passwd" }))
      const resources = (await client.listResources()).resources
      if (apps) {
        assert.equal(preview._meta?.ui?.resourceUri, previewUri)
        assert.equal(create._meta?.ui?.resourceUri, previewUri)
        assert(resources.some((resourceItem) => resourceItem.uri === previewUri))
        const viewer = (await client.readResource({ uri: previewUri })).contents[0]
        assert.equal(viewer.mimeType, "text/html;profile=mcp-app")
        assert(viewer.text.includes("Codeprint preview") && !viewer.text.includes("CODEPRINT_APP_SCRIPT"))
        assert.deepEqual(viewer._meta?.ui?.csp, { connectDomains: [], resourceDomains: [] })
      } else {
        assert.equal(create._meta, undefined)
        assert.equal(preview._meta, undefined)
        assert(!resources.some((resourceItem) => resourceItem.uri === previewUri))
      }
    } finally {
      clearTimeout(deadline)
      await client.close()
      await transport.close()
    }
  }
}

const temporary = await mkdtemp(join(tmpdir(), "codeprint-packed-release-"))
try {
  await mkdir(artifactDirectory, { recursive: true })
  let previousManifest
  if (verifyExisting) previousManifest = JSON.parse(await readFile(join(artifactDirectory, manifestName), "utf8"))
  else {
    const existing = await readdir(artifactDirectory)
    assert(existing.length === 0, "Packing requires an empty artifact directory to avoid stale release artifacts.")
    console.log("Packing the existing builds; the caller is responsible for a fresh verified build first.")
    await run(npmCommand, [
      "pack",
      "--json",
      "--ignore-scripts",
      "--pack-destination",
      artifactDirectory,
      ...packages.flatMap((name) => ["--workspace", `@codeprint/${name}`]),
    ])
  }
  const tarballs = (await readdir(artifactDirectory)).filter((file) => file.endsWith(".tgz")).sort()
  assert(
    (await readdir(artifactDirectory)).every((file) => file.endsWith(".tgz") || file === manifestName),
    "Unexpected files in release artifact directory",
  )
  assert.equal(tarballs.length, packages.length, "Expected exactly four Codeprint tarballs")
  const records = []
  console.log("Validating archive contents, bundled notices, entrypoints, and SHA-256 hashes.")
  for (const name of packages) {
    const matching = tarballs.filter((file) => file.startsWith(`codeprint-${name}-`))
    assert.equal(matching.length, 1, `Expected exactly one ${name} tarball`)
    records.push(await inspectTarball(name, join(artifactDirectory, matching[0]), temporary))
  }
  assert.equal(new Set(records.map((record) => record.version)).size, 1, "Release package versions must match")
  let sourceCommit
  if (verifyExisting) {
    assert.equal(previousManifest.schemaVersion, 1)
    assert.deepEqual(records, previousManifest.packages, "Existing artifact hashes or metadata changed")
    sourceCommit = previousManifest.sourceCommit
  } else sourceCommit = (await run("git", ["rev-parse", "HEAD"])).stdout.trim()
  assert(/^[a-f0-9]{40}$/.test(sourceCommit), "Manifest must identify the exact source commit")
  const consumer = join(temporary, "consumer")
  await mkdir(consumer)
  await consumerTests(
    consumer,
    records.map((record) => join(artifactDirectory, record.filename)),
  )
  if (!verifyExisting)
    await writeFile(
      join(artifactDirectory, manifestName),
      `${JSON.stringify({ schemaVersion: 1, sourceCommit, packages: records }, null, 2)}\n`,
    )
  console.log(
    `Verified four exact release tarballs, five CLI render flows, and plain/Apps MCP stdio resources. Artifacts: ${artifactDirectory}`,
  )
} finally {
  // This exact directory was allocated by mkdtemp above; artifacts intentionally remain available.
  await rm(temporary, { recursive: true, force: true })
}
