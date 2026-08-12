// Page size dimensions in pixels (approximate for screen display)
export const PAGE_SIZES = {
  a4: { width: 794, height: 1123 }, // A4 at 96 DPI
  letter: { width: 816, height: 1056 }, // Letter at 96 DPI
  legal: { width: 816, height: 1344 }, // Legal at 96 DPI
}

// Lines per page estimates (will be adjusted based on font size)
export const BASE_LINES_PER_PAGE = {
  a4: 50,
  letter: 48,
  legal: 62,
}

// Supported languages for syntax highlighting
export const HIGHLIGHTABLE_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "csharp",
  "c",
  "cpp",
  "go",
  "rust",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "html",
  "xml",
  "css",
  "sql",
  "bash",
  "shell",
  "json",
  "r",
  "dart",
  "scala",
  "markdown",
]

// Languages that need special rendering
export const SPECIAL_RENDER_LANGUAGES = ["csv"]
