"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface CodeEditorProps {
  code: string
  setCode: (code: string) => void
  language: string
  setLanguage?: (language: string) => void
}

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "sql", label: "SQL" },
  { value: "shell", label: "Shell/Bash" },
  { value: "json", label: "JSON" },
  { value: "r", label: "R" },
  { value: "dart", label: "Dart" },
  { value: "scala", label: "Scala" },
  { value: "markdown", label: "Markdown" },
  { value: "csv", label: "CSV" },
]

interface LanguageSelectProps {
  language: string
  setLanguage: (language: string) => void
  id?: string
}

function LanguageSelect({ language, setLanguage, id }: LanguageSelectProps) {
  return (
    <Select value={language} onValueChange={setLanguage}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default function CodeEditor({ code, setCode, language }: CodeEditorProps) {
  const [placeholder, setPlaceholder] = useState("// Paste your code here...")

  useEffect(() => {
    // Update placeholder based on selected language
    switch (language) {
      case "python":
        setPlaceholder("# Paste your Python code here...")
        break
      case "html":
        setPlaceholder("<!-- Paste your HTML code here -->")
        break
      case "css":
        setPlaceholder("/* Paste your CSS code here */")
        break
      case "sql":
        setPlaceholder("-- Paste your SQL code here")
        break
      case "json":
        setPlaceholder('{\n  "example": "Paste your JSON here"\n}')
        break
      case "markdown":
        setPlaceholder(`# Markdown Example
      
## Heading 2

- List item 1
- List item 2

**Bold text** and *italic text*`)
        break
      case "csv":
        setPlaceholder(`Name,Age,Email
John Doe,30,john@example.com
Jane Smith,25,jane@example.com
Bob Johnson,45,bob@example.com`)
        break
      default:
        setPlaceholder("// Paste your code here...")
    }
  }, [language])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={placeholder}
        className="min-h-[360px] resize-y rounded-xl border-slate-200 bg-slate-50/70 pt-10 font-mono text-sm leading-relaxed focus-visible:ring-orange-500 dark:border-slate-700 dark:bg-slate-950/70"
        spellCheck={false}
      />
    </motion.div>
  )
}

// Export the LanguageSelect component as a property of CodeEditor
CodeEditor.LanguageSelect = LanguageSelect
