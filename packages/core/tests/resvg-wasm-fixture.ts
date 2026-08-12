import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const wasmPath = fileURLToPath(new URL("../../../node_modules/@resvg/resvg-wasm/index_bg.wasm", import.meta.url))

export default new Uint8Array(readFileSync(wasmPath))
