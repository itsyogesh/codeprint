import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { defineConfig, type Plugin } from "vitest/config"

function inlineLocalFonts(): Plugin {
  const wasmMarker = "?codeprint-inline-wasm"
  const wasmRequest = "?codeprint-binary"
  return {
    name: "codeprint-inline-local-fonts",
    enforce: "pre",
    async resolveId(source, importer) {
      if (!source.endsWith(wasmRequest)) return null
      const resolved = await this.resolve(source.slice(0, -wasmRequest.length), importer, { skipSelf: true })
      return resolved ? `${resolved.id}${wasmMarker}` : null
    },
    async load(id) {
      const isWasm = id.endsWith(wasmMarker)
      if (!id.endsWith(".ttf") && !isWasm) return null
      const bytes = await readFile(isWasm ? id.slice(0, -wasmMarker.length) : id)
      if (id.endsWith(".ttf")) {
        return `export default ${JSON.stringify(`data:font/ttf;base64,${bytes.toString("base64")}`)}`
      }
      return `export default Uint8Array.from(atob(${JSON.stringify(bytes.toString("base64"))}), character => character.charCodeAt(0))`
    },
  }
}

export default defineConfig({
  plugins: [inlineLocalFonts()],
  resolve: {
    alias: {
      "@resvg/resvg-wasm/index_bg.wasm?codeprint-binary": fileURLToPath(
        new URL("./tests/resvg-wasm-fixture.ts", import.meta.url),
      ),
    },
  },
  server: {
    deps: {
      inline: ["@resvg/resvg-wasm"],
    },
  },
  test: {
    environment: "node",
  },
})
