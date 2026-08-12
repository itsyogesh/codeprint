import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Codeprint",
    short_name: "Codeprint",
    description: "Turn code, Markdown, and CSV into print-ready PDFs in your browser.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#f97316",
    icons: [
      {
        src: "/apple-icon.png?v=2026-08-12-2",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/icon.svg?v=2026-08-12-2",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  }
}
