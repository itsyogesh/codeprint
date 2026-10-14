import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises"
import { build } from "esbuild"

const root = new URL("../", import.meta.url)
const bundle = await build({
  entryPoints: [new URL("ui/app.ts", root).pathname],
  bundle: true,
  write: false,
  format: "esm",
  platform: "browser",
  target: "es2022",
  minify: true,
})
const template = await readFile(new URL("ui/index.html", root), "utf8")
const [sans, serif] = await Promise.all([
  readFile(new URL("../core/assets/fonts/mulish/Mulish-Regular.ttf", root)),
  readFile(new URL("../core/assets/fonts/merriweather/Merriweather-Bold.ttf", root)),
])
const fonts = `<style>@font-face{font-family:Mulish;src:url(data:font/ttf;base64,${sans.toString("base64")})}@font-face{font-family:Merriweather;src:url(data:font/ttf;base64,${serif.toString("base64")});font-weight:700}</style>`
const html = template
  .replace("</head>", () => `${fonts}</head>`)
  .replace("/* CODEPRINT_APP_SCRIPT */", () => bundle.outputFiles[0].text.replaceAll("</script", "<\\/script"))
await mkdir(new URL("dist/licenses/", root), { recursive: true })
await writeFile(new URL("dist/pdf-preview.html", root), html)
await Promise.all(
  [
    ["../core/assets/fonts/mulish/OFL.txt", "Mulish-OFL.txt"],
    ["../core/assets/fonts/merriweather/OFL.txt", "Merriweather-OFL.txt"],
    ["../../node_modules/pdfjs-dist/LICENSE", "PDFjs-LICENSE.txt"],
    ["../../node_modules/@modelcontextprotocol/ext-apps/LICENSE", "MCP-Apps-LICENSE.txt"],
  ].map(([source, name]) => copyFile(new URL(source, root), new URL(`dist/licenses/${name}`, root))),
)
await copyFile(new URL("../../THIRD_PARTY_NOTICES.md", root), new URL("dist/THIRD_PARTY_NOTICES.md", root))
