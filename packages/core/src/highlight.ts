import hljs from "highlight.js/lib/core"

export { hljs }

const LANGUAGE_IMPORTS: Record<string, () => Promise<{ default: any }>> = {
  javascript: () => import("highlight.js/lib/languages/javascript"),
  typescript: () => import("highlight.js/lib/languages/typescript"),
  python: () => import("highlight.js/lib/languages/python"),
  java: () => import("highlight.js/lib/languages/java"),
  csharp: () => import("highlight.js/lib/languages/csharp"),
  c: () => import("highlight.js/lib/languages/c"),
  cpp: () => import("highlight.js/lib/languages/cpp"),
  go: () => import("highlight.js/lib/languages/go"),
  rust: () => import("highlight.js/lib/languages/rust"),
  php: () => import("highlight.js/lib/languages/php"),
  ruby: () => import("highlight.js/lib/languages/ruby"),
  swift: () => import("highlight.js/lib/languages/swift"),
  kotlin: () => import("highlight.js/lib/languages/kotlin"),
  xml: () => import("highlight.js/lib/languages/xml"),
  css: () => import("highlight.js/lib/languages/css"),
  sql: () => import("highlight.js/lib/languages/sql"),
  bash: () => import("highlight.js/lib/languages/bash"),
  json: () => import("highlight.js/lib/languages/json"),
  r: () => import("highlight.js/lib/languages/r"),
  dart: () => import("highlight.js/lib/languages/dart"),
  scala: () => import("highlight.js/lib/languages/scala"),
  markdown: () => import("highlight.js/lib/languages/markdown"),
}

// Map language aliases to hljs registration names
const LANGUAGE_ALIAS: Record<string, string> = {
  shell: "bash",
  html: "xml",
}

const loadingPromises = new Map<string, Promise<void>>()

export async function loadLanguage(language: string): Promise<void> {
  const registrationName = LANGUAGE_ALIAS[language] ?? language
  const importKey = LANGUAGE_ALIAS[language] ?? language

  if (hljs.getLanguage(registrationName)) {
    return
  }

  if (loadingPromises.has(importKey)) {
    return loadingPromises.get(importKey)
  }

  const importFn = LANGUAGE_IMPORTS[importKey]
  if (!importFn) return

  const promise = importFn()
    .then((mod) => {
      if (mod?.default) {
        hljs.registerLanguage(registrationName, mod.default)
      }
    })
    .catch((error) => {
      console.error(`Failed to load language: ${language}`, error)
    })
    .finally(() => {
      loadingPromises.delete(importKey)
    })

  loadingPromises.set(importKey, promise)
  return promise
}
