import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"
import type { OgKind } from "@/lib/og"

export const runtime = "nodejs"

const IMAGE_SIZE = { width: 1200, height: 630 }
const bodyFontFile = readFile(
  join(process.cwd(), "..", "..", "packages", "core", "assets", "fonts", "mulish", "Mulish-Regular.ttf"),
)
const bodyBoldFontFile = readFile(
  join(process.cwd(), "..", "..", "packages", "core", "assets", "fonts", "mulish", "Mulish-Bold.ttf"),
)
const headingFontFile = readFile(
  join(process.cwd(), "..", "..", "packages", "core", "assets", "fonts", "merriweather", "Merriweather-Bold.ttf"),
)
const monoFontFile = readFile(
  join(
    process.cwd(),
    "..",
    "..",
    "packages",
    "core",
    "assets",
    "fonts",
    "source-code-pro",
    "SourceCodePro-Regular.ttf",
  ),
)

interface PreviewCopy {
  title: string
  subtitle: string
  accent: string
}

const COPY: Record<Exclude<OgKind, "language">, PreviewCopy> = {
  code: {
    title: "Code to PDF with\nsyntax highlighting.",
    subtitle: "20+ languages with Markdown, JSON and CSV support.\nFree, private, and entirely in your browser.",
    accent: "#f97316",
  },
  markdown: {
    title: "Printable Markdown.",
    subtitle: "Convert READMEs to beautifully formatted PDFs with table of contents.",
    accent: "#f97316",
  },
  csv: {
    title: "CSV Viewer & Exporter.",
    subtitle: "Render raw data as formatted landscape tables instantly.",
    accent: "#22c55e",
  },
  mcp: {
    title: "Codeprint MCP Server.",
    subtitle: "Give your AI backlog a physical ending with safe, local printing.",
    accent: "#2563eb",
  },
  cli: {
    title: "Codeprint CLI.",
    subtitle: "Pipe jq, cat, or scripts directly into print-ready PDFs.",
    accent: "#f97316",
  },
  docs: {
    title: "Documentation.",
    subtitle: "Guides and references for the Codeprint rendering engine.",
    accent: "#64748b",
  },
}

const line = (width: number | string, color = "#cbd5e1", height = 8) => (
  <span style={{ display: "flex", width, height, borderRadius: 999, background: color }} />
)

function CodeprintMark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 42,
          height: 42,
          borderRadius: 12,
          background: "#fff",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 2px rgba(15,23,42,.08)",
          transform: "rotate(-4deg)",
        }}
      >
        <svg aria-hidden="true" width="21" height="21" viewBox="0 0 96 95" fill="none">
          <path
            fill="#f97316"
            fillRule="evenodd"
            d="M70.09 53.46H24.918v26.614c0 3.73 3.059 6.785 6.79 6.785h31.597c3.73 0 6.79-3.055 6.79-6.785V53.46zM14.934 22.396h1.848V14.93C16.782 6.703 23.48 0 31.708 0h31.598C71.532 0 78.24 6.7 78.24 14.93v7.465h1.84c8.226 0 14.933 6.699 14.933 14.93v24.16c0 8.226-6.707 14.93-14.934 14.93h-1.84v3.66c0 8.227-6.706 14.93-14.933 14.93H31.708c-8.227 0-14.926-6.7-14.926-14.93v-3.66h-1.848C6.707 76.415 0 69.715 0 61.485v-24.16c0-8.227 6.707-14.93 14.934-14.93m9.984 0h45.176V14.93c0-3.73-3.058-6.785-6.789-6.785H31.707c-3.73 0-6.789 3.055-6.789 6.785zM74.16 42.567a4.08 4.08 0 0 0 4.079-4.074c0-2.25-1.829-4.07-4.079-4.07a4.073 4.073 0 0 0 0 8.145"
            clipRule="evenodd"
          />
          <path
            fill="#f97316"
            d="M37.707 63.242c-1.007-1.006-2.593-.98-3.55.052l-4.935 5.37a2.714 2.714 0 0 0 0 3.677l4.935 5.37a2.5 2.5 0 0 0 1.813.793c.655 0 1.259-.238 1.763-.74 1.007-1.006 1.032-2.699.05-3.73l-3.248-3.545 3.248-3.544c.957-1.058.931-2.725-.05-3.73zM59.258 63.312c-1.053-1.055-2.825-1.081-3.906-.053a2.517 2.517 0 0 0-.055 3.719l3.573 3.534-3.573 3.534c-1.052 1.056-1.025 2.717.055 3.72.527.5 1.22.738 1.94.738s1.44-.264 1.994-.791l5.429-5.354c1.052-1.03 1.052-2.638 0-3.667l-5.43-5.354zM49.57 59.577c-1.358-.336-2.717.517-3.044 1.914l-3.95 16.807c-.328 1.396.502 2.792 1.861 3.128q.303.078.604.078c1.133 0 2.164-.802 2.441-1.991l3.95-16.807c.328-1.396-.503-2.793-1.861-3.129"
          />
        </svg>
      </div>
      <span style={{ fontFamily: "Mulish", fontSize: 36, fontWeight: 700, letterSpacing: -1.1, color: "#0f172a" }}>
        Codeprint
      </span>
    </div>
  )
}

function LinkGlyph({ size = 18 }: { size?: number } = {}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15" />
      <path d="M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 12 20l1.15-1.15" />
    </svg>
  )
}

function WindowDots() {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <span style={{ display: "flex", width: 16, height: 16, borderRadius: 16, background: "#ef4444" }} />
      <span style={{ display: "flex", width: 16, height: 16, borderRadius: 16, background: "#eab308" }} />
      <span style={{ display: "flex", width: 16, height: 16, borderRadius: 16, background: "#22c55e" }} />
    </div>
  )
}

function PrinterGlyph() {
  return (
    <svg
      aria-hidden="true"
      width="38"
      height="38"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M7 8V3h10v5" />
      <path d="M7 17H5a2 2 0 0 1-2-2v-4a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v4a2 2 0 0 1-2 2h-2" />
      <path d="M7 14h10v7H7z" />
      <path d="M17 11h.01" />
    </svg>
  )
}

function CheckGlyph({ size = 42 }: { size?: number } = {}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  )
}

function CodeVisual() {
  return (
    <div style={{ display: "flex", position: "relative", width: 500, height: 470 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          left: 190,
          top: 50,
          width: 300,
          height: 390,
          borderRadius: 24,
          background: "#fff",
          border: "1px solid #e2e8f0",
          padding: 34,
          transform: "rotate(3deg)",
          boxShadow: "0 25px 50px rgba(15,23,42,.22)",
        }}
      >
        {line("75%", "#e2e8f0", 32)}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 32 }}>
          {line("100%", "#f1f5f9", 20)}
          {line("100%", "#f1f5f9", 20)}
          {line("83%", "#f1f5f9", 20)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: "auto" }}>
          <div
            style={{
              display: "flex",
              width: 80,
              height: 80,
              borderRadius: 16,
              background: "#ffedd5",
              border: "1px solid #fed7aa",
              color: "#f97316",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "inset 0 2px 4px rgba(249,115,22,.08)",
            }}
          >
            <PrinterGlyph />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, padding: "12px 0" }}>
            {line("100%", "#f1f5f9", 16)}
            {line("67%", "#f1f5f9", 16)}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          left: 0,
          top: 0,
          width: 315,
          height: 350,
          borderRadius: 16,
          background: "#0d1117",
          border: "1px solid #334155",
          padding: 32,
          transform: "rotate(-5deg)",
          boxShadow: "0 25px 50px rgba(2,6,23,.42)",
        }}
      >
        <WindowDots />
        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 38 }}>
          {line("100%", "#334155", 16)}
          <div style={{ display: "flex", marginLeft: 24 }}>{line("80%", "rgba(59,130,246,.55)", 16)}</div>
          <div style={{ display: "flex", marginLeft: 24 }}>{line("60%", "rgba(249,115,22,.55)", 16)}</div>
          {line("100%", "#334155", 16)}
          <div style={{ display: "flex", marginLeft: 24 }}>{line("50%", "rgba(34,197,94,.55)", 16)}</div>
        </div>
      </div>
    </div>
  )
}

function MarkdownVisual() {
  return (
    <div style={{ display: "flex", position: "relative", width: 500, height: 480 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          left: 0,
          top: 115,
          width: 235,
          height: 255,
          borderRadius: 16,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          padding: 32,
          transform: "rotate(-3deg)",
          boxShadow: "0 20px 35px rgba(15,23,42,.18)",
        }}
      >
        <span
          style={{
            display: "flex",
            color: "#0f172a",
            fontFamily: "Mulish",
            fontSize: 58,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          #
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
          {line("100%", "#cbd5e1", 12)}
          {line("83%", "#cbd5e1", 12)}
          {line("80%", "#cbd5e1", 12)}
          <div style={{ display: "flex", marginLeft: 24 }}>{line("75%", "#cbd5e1", 12)}</div>
          <div style={{ display: "flex", marginLeft: 24 }}>{line("58%", "#cbd5e1", 12)}</div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          left: 190,
          top: 10,
          width: 300,
          height: 450,
          borderRadius: 24,
          background: "#fff",
          border: "1px solid #e2e8f0",
          padding: 34,
          transform: "rotate(2deg)",
          boxShadow: "0 25px 50px rgba(15,23,42,.22)",
        }}
      >
        {line("75%", "#0f172a", 40)}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 40 }}>
          {line("100%", "#e2e8f0", 16)}
          {line("100%", "#e2e8f0", 16)}
          {line("83%", "#e2e8f0", 16)}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            marginTop: 40,
            borderRadius: 16,
            background: "#0d1117",
            border: "1px solid #1e293b",
            padding: 32,
            boxShadow: "inset 0 2px 6px rgba(2,6,23,.35)",
          }}
        >
          {line("50%", "#60a5fa", 16)}
          {line("75%", "#fb923c", 16)}
          {line("67%", "#4ade80", 16)}
        </div>
      </div>
    </div>
  )
}

function CsvVisual() {
  return (
    <div style={{ display: "flex", position: "relative", width: 560, height: 384 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 560,
          height: 384,
          borderRadius: 24,
          background: "#fff",
          border: "1px solid #e2e8f0",
          padding: 40,
          transform: "rotate(-2deg)",
          boxShadow: "0 25px 50px rgba(15,23,42,.22)",
        }}
      >
        {[0, 1, 2, 3, 4].map((row) => (
          <div
            key={row}
            style={{
              display: "flex",
              height: row === 0 ? 68 : 62,
              gap: 24,
              alignItems: "center",
              borderBottom: row === 0 ? "1px solid #e2e8f0" : "none",
              paddingBottom: row === 0 ? 28 : 0,
              marginBottom: row === 4 ? 0 : 20,
            }}
          >
            {[0, 1, 2, 3].map((column) => (
              <div key={column} style={{ display: "flex", alignItems: "center", width: 100 }}>
                {line(
                  column === 0 ? "75%" : column === 1 ? "100%" : column === 2 ? "84%" : "67%",
                  row === 0 ? "#0f172a" : column === 3 ? "rgba(34,197,94,.55)" : "#e2e8f0",
                  row === 0 ? 20 : 16,
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          position: "absolute",
          left: -44,
          top: -48,
          alignItems: "center",
          justifyContent: "center",
          width: 92,
          height: 92,
          borderRadius: 18,
          background: "#fff",
          border: "1px solid #dcfce7",
          boxShadow: "0 16px 30px rgba(15,23,42,.18)",
          transform: "rotate(-7deg)",
          color: "#16a34a",
        }}
      >
        <svg
          aria-hidden="true"
          width="46"
          height="46"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 10h18M9 4v16M15 4v16" />
        </svg>
      </div>
    </div>
  )
}

function LanguageVisual({ language }: { language: string }) {
  const extension =
    ({ Python: "py", JavaScript: "js", TypeScript: "ts", Ruby: "rb", Rust: "rs", Go: "go" } as Record<string, string>)[
      language
    ] ??
    language
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 4)

  return (
    <div style={{ display: "flex", position: "relative", width: 400, height: 500 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 400,
          height: 500,
          borderRadius: 24,
          background: "#0d1117",
          border: "1px solid #334155",
          overflow: "hidden",
          transform: "rotate(3deg)",
          boxShadow: "0 25px 50px rgba(2,6,23,.42)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 32px",
            background: "#161b22",
            borderBottom: "1px solid #1e293b",
          }}
        >
          <WindowDots />
          <span style={{ fontFamily: "Source Code Pro", color: "#94a3b8", fontSize: 16 }}>
            script.{extension || "txt"}
          </span>
        </div>
        <div style={{ display: "flex", padding: 40, gap: 32, fontFamily: "Source Code Pro", fontSize: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, color: "#475569" }}>
            {[1, 2, 3, 4, 5, 6].map((number) => (
              <span key={number}>{number}</span>
            ))}
          </div>
          <div style={{ display: "flex", flex: 1, flexDirection: "column", gap: 24, paddingTop: 4 }}>
            {line("33%", "#c084fc", 20)}
            {line("67%", "#60a5fa", 20)}
            {line("100%", "#475569", 20)}
            <div style={{ display: "flex", marginLeft: 40 }}>{line("80%", "#fb923c", 20)}</div>
            <div style={{ display: "flex", marginLeft: 40 }}>{line("60%", "#4ade80", 20)}</div>
            <div style={{ display: "flex", marginLeft: 40 }}>{line("50%", "#475569", 20)}</div>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          position: "absolute",
          right: -10,
          bottom: 10,
          borderRadius: 16,
          background: "#3b82f6",
          color: "#fff",
          padding: "12px 32px",
          fontFamily: "Mulish",
          fontSize: 30,
          fontWeight: 700,
          transform: "rotate(-5deg)",
          boxShadow: "0 6px 0 #1d4ed8",
        }}
      >
        {language}
      </div>
    </div>
  )
}

function McpVisual() {
  return (
    <div style={{ display: "flex", position: "relative", width: 500, height: 520 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          left: 144,
          top: 64,
          width: 360,
          height: 520,
          borderRadius: 24,
          background: "#fff",
          border: "1px solid #e2e8f0",
          padding: 40,
          transform: "rotate(6deg)",
          boxShadow: "0 25px 50px rgba(15,23,42,.22)",
        }}
      >
        {line("50%", "#0f172a", 40)}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 40 }}>
          {line("100%", "#e2e8f0", 16)}
          {line("100%", "#e2e8f0", 16)}
          {line("80%", "#e2e8f0", 16)}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 16,
            background: "#ffedd5",
            color: "#f97316",
            fontSize: 40,
            marginLeft: "auto",
            marginTop: "auto",
          }}
        >
          <CheckGlyph />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          left: 0,
          top: 160,
          width: 320,
          borderRadius: 24,
          background: "#0d1117",
          border: "1px solid #334155",
          padding: 32,
          transform: "rotate(-3deg)",
          boxShadow: "0 25px 50px rgba(2,6,23,.42)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "rgba(59,130,246,.2)",
              border: "1px solid rgba(59,130,246,.3)",
              color: "#60a5fa",
            }}
          >
            <svg
              aria-hidden="true"
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="7" width="18" height="13" rx="2" />
              <path d="M12 3v4M8 12h.01M16 12h.01M8 16h8" />
            </svg>
          </span>
          {line(128, "#475569", 20)}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginTop: 24,
            borderRadius: 12,
            background: "#161b22",
            border: "1px solid #1e293b",
            padding: 24,
          }}
        >
          {line("100%", "#334155", 12)}
          {line("84%", "#334155", 12)}
          {line("80%", "#334155", 12)}
        </div>
      </div>
    </div>
  )
}

function CliVisual() {
  return (
    <div style={{ display: "flex", position: "relative", width: 500, height: 420, fontFamily: "Source Code Pro" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          right: -16,
          bottom: -80,
          width: 224,
          height: 256,
          borderRadius: 24,
          background: "#fff",
          border: "1px solid #e2e8f0",
          padding: 32,
          transform: "rotate(6deg)",
          boxShadow: "0 20px 35px rgba(15,23,42,.16)",
        }}
      >
        {line("75%", "#0f172a", 16)}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
          {line("100%", "#f1f5f9", 12)}
          {line("100%", "#f1f5f9", 12)}
          {line("80%", "#f1f5f9", 12)}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          left: 0,
          top: 25,
          width: 500,
          borderRadius: 24,
          background: "#161b22",
          border: "1px solid #334155",
          overflow: "hidden",
          transform: "rotate(-2deg)",
          boxShadow: "0 25px 50px rgba(2,6,23,.42)",
        }}
      >
        <div
          style={{
            display: "flex",
            padding: "16px 24px",
            background: "#0d1117",
            borderBottom: "1px solid #1e293b",
          }}
        >
          <WindowDots />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 32, padding: 40, fontSize: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ color: "#4ade80" }}>~</span>
            <span style={{ color: "#fff" }}>$ codeprint print</span>
            <span style={{ color: "#60a5fa" }}>spec.md</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, color: "#94a3b8", fontSize: 20 }}>
            <span>Generated 2 pages (A4)</span>
            <span>Destination: Office_Printer</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#fb923c", fontSize: 20 }}>
            <span>? Send to printer? (Y/n)</span>
            <span
              style={{ display: "flex", color: "#fff", background: "#1e293b", padding: "4px 8px", borderRadius: 4 }}
            >
              Y
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#4ade80", fontSize: 20 }}>
            <CheckGlyph size={24} />
            <span>Job submitted</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function DocsVisual() {
  return (
    <div
      style={{
        display: "flex",
        width: 384,
        height: 500,
        boxShadow: "0 25px 50px rgba(2,6,23,.42)",
        borderRadius: 24,
        transform: "rotate(3deg)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 64,
          borderRadius: "24px 0 0 24px",
          background: "#1e293b",
          border: "1px solid #334155",
        }}
      >
        <span style={{ display: "flex", width: 12, height: 160, borderRadius: 999, background: "#334155" }} />
      </div>
      <div
        style={{
          display: "flex",
          position: "relative",
          flex: 1,
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: "0 24px 24px 0",
          background: "#0d1117",
          border: "1px solid #334155",
          padding: 48,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 16,
            background: "#1e293b",
            color: "#f97316",
          }}
        >
          <svg
            aria-hidden="true"
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M6 2h9l4 4v16H6z" />
            <path d="M14 2v5h5M9 12h7M9 16h7" />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28, marginTop: 48 }}>
          {line("75%", "#fff", 32)}
          {line("50%", "#fff", 32)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 64 }}>
          {line("100%", "#334155", 12)}
          {line("80%", "#334155", 12)}
          {line("84%", "#334155", 12)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: "auto" }}>
          <span
            style={{
              display: "flex",
              width: 40,
              height: 40,
              borderRadius: 999,
              background: "#f97316",
              boxShadow: "0 0 22px rgba(249,115,22,.5)",
            }}
          />
          {line(128, "#334155", 20)}
        </div>
      </div>
    </div>
  )
}

function Visual({ kind, language }: { kind: OgKind; language: string }) {
  if (kind === "markdown") return <MarkdownVisual />
  if (kind === "csv") return <CsvVisual />
  if (kind === "language") return <LanguageVisual language={language} />
  if (kind === "mcp") return <McpVisual />
  if (kind === "cli") return <CliVisual />
  if (kind === "docs") return <DocsVisual />
  return <CodeVisual />
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const requestedKind = searchParams.get("kind")
  const kind: OgKind = ["code", "markdown", "csv", "language", "mcp", "cli", "docs"].includes(requestedKind ?? "")
    ? (requestedKind as OgKind)
    : "code"
  const rawLanguage = searchParams.get("language")?.trim() || "Python"
  const language = rawLanguage.replace(/[^\p{L}\p{N}+#. -]/gu, "").slice(0, 24) || "Python"
  const copy: PreviewCopy =
    kind === "language"
      ? {
          title: `Print ${language} Code.`,
          subtitle: `Perfect syntax highlighting and line numbers for ${language} files.`,
          accent: "#3b82f6",
        }
      : COPY[kind]
  const [mulish, mulishBold, merriweather, sourceCodePro] = await Promise.all([
    bodyFontFile,
    bodyBoldFontFile,
    headingFontFile,
    monoFontFile,
  ])

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#f8fafc",
        color: "#0f172a",
        fontFamily: "Mulish",
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          display: "flex",
          position: "absolute",
          width: 720,
          height: 504,
          right: -120,
          top: -190,
          borderRadius: 999,
          background: copy.accent,
          opacity: 0.04,
          filter: "blur(120px)",
        }}
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          width: 480,
          height: 252,
          left: 240,
          bottom: 63,
          borderRadius: 999,
          background: copy.accent,
          opacity: 0.02,
          filter: "blur(100px)",
        }}
      />
      <div
        style={{
          display: "flex",
          width: 660,
          height: "100%",
          flexDirection: "column",
          justifyContent: "center",
          padding: "48px 16px 48px 80px",
        }}
      >
        <CodeprintMark />
        <h1
          style={{
            margin: "40px 0 0",
            maxWidth: 565,
            fontSize: kind === "code" ? 54 : 64,
            lineHeight: kind === "code" ? 1.15 : 1.1,
            letterSpacing: kind === "code" ? -1.35 : -1.6,
            fontFamily: "Merriweather",
            fontWeight: 700,
            whiteSpace: kind === "code" ? "pre-wrap" : "normal",
          }}
        >
          {copy.title}
        </h1>
        <p
          style={{
            margin: "32px 0 0",
            maxWidth: kind === "code" ? 560 : 530,
            color: "#475569",
            fontSize: kind === "code" ? 20 : 28,
            lineHeight: 1.4,
            whiteSpace: kind === "code" ? "pre-wrap" : "normal",
          }}
        >
          {copy.subtitle}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            alignSelf: "flex-start",
            marginTop: 48,
            gap: 12,
            padding: "14px 30px 18px 14px",
            borderRadius: 999,
            background: "linear-gradient(180deg, #f97316 0%, #ea580c 100%)",
            color: "#fff",
            fontFamily: "Mulish",
            fontSize: 24,
            fontWeight: 700,
            boxShadow: "0 16px 24px rgba(249,115,22,.3), inset 0 1px 0 #fb923c, inset 0 -4px 0 #c2410c",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: 999,
              background: "rgba(255,255,255,.16)",
              border: "1px solid rgba(255,255,255,.18)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,.2)",
            }}
          >
            <LinkGlyph size={19} />
          </span>
          <span>codeprint.app</span>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          width: 540,
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        <Visual kind={kind} language={language} />
      </div>
    </div>,
    {
      ...IMAGE_SIZE,
      fonts: [
        { name: "Mulish", data: mulish, weight: 400, style: "normal" },
        { name: "Mulish", data: mulishBold, weight: 700, style: "normal" },
        { name: "Merriweather", data: merriweather, weight: 700, style: "normal" },
        { name: "Source Code Pro", data: sourceCodePro, weight: 400, style: "normal" },
      ],
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
    },
  )
}
