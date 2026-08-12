import { cn } from "@/lib/utils"

const DEVICON_NAMES: Record<string, string> = {
  Python: "python",
  JavaScript: "javascript",
  TypeScript: "typescript",
  HTML: "html5",
  CSS: "css3",
  Java: "java",
  C: "c",
  "C++": "cplusplus",
  "C#": "csharp",
  Go: "go",
  Rust: "rust",
  PHP: "php",
  Ruby: "ruby",
  Swift: "swift",
  Kotlin: "kotlin",
  SQL: "mysql",
  "Shell/Bash": "bash",
  Shell: "bash",
  JSON: "json",
  R: "r",
  Dart: "dart",
  Scala: "scala",
}

interface LanguageIconProps {
  className?: string
  language: string
  priority?: boolean
}

export function LanguageIcon({ className, language, priority = false }: LanguageIconProps) {
  const iconName = DEVICON_NAMES[language] ?? language.toLowerCase()

  return (
    // The exact Devicon CDN URLs are part of the approved visual source; these tiny SVGs do not benefit from image optimization.
    // biome-ignore lint/performance/noImgElement: preserve the source design's direct Devicon assets
    <img
      src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${iconName}/${iconName}-original.svg`}
      alt=""
      aria-hidden="true"
      width={20}
      height={20}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("h-5 w-5 object-contain", className)}
    />
  )
}
