import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to escape HTML
export function escapeHtml(text: string) {
  if (!text) return ""
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

// Helper function to safely highlight code with highlight.js
export function safeHighlight(code: string, language: string, hljs: any) {
  // Don't try to highlight CSV with highlight.js
  if (language === "csv") {
    return escapeHtml(code)
  }

  // Map language values to highlight.js expected format
  const hljsLanguage =
    language === "csharp" ? "csharp" : language === "shell" ? "bash" : language === "html" ? "xml" : language

  try {
    return hljs.highlight(code, {
      language: hljsLanguage,
      ignoreIllegals: true,
    }).value
  } catch (error) {
    console.error(`Error highlighting ${language} code:`, error)
    return escapeHtml(code)
  }
}

// Add a debounce utility function
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
