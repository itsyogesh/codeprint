// Do not constrain connect-src: public file imports fetch arbitrary HTTPS hosts
// directly in the browser. Only isolated marketing documents can execute Clarity.
const scriptPolicy = (replay) =>
  `${[
    "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
    process.env.NODE_ENV !== "production" ? "'unsafe-eval'" : "",
    "https://www.googletagmanager.com https://va.vercel-scripts.com https://vercel.live",
    replay ? "https://*.clarity.ms" : "",
  ]
    .filter(Boolean)
    .join(" ")}; worker-src 'self' blob:`

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Content-Security-Policy", value: scriptPolicy(false) },
        ],
      },
      {
        source: "/:page(mcp|cli|about|docs|privacy|terms|changelog|blog)",
        headers: [{ key: "Content-Security-Policy", value: scriptPolicy(true) }],
      },
    ]
  },
}

export default nextConfig
