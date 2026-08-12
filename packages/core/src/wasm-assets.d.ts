declare module "*.wasm" {
  const bytes: Uint8Array
  export default bytes
}

declare module "*.wasm?codeprint-binary" {
  const bytes: Uint8Array
  export default bytes
}
