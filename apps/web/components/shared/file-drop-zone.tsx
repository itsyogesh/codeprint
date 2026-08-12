"use client"

import { Upload } from "lucide-react"
import { type DragEvent, type ReactNode, useCallback, useRef, useState } from "react"

interface FileDropResult {
  content: string
  filename: string
}

interface FileDropZoneProps {
  children: (controls: { openFilePicker: () => void }) => ReactNode
  onFileDrop: (result: FileDropResult) => void
  /** Accepted file extensions (e.g. [".py", ".js"]). If empty, accepts all text files. */
  accept?: string[]
  className?: string
}

export default function FileDropZone({ children, onFileDrop, accept, className = "" }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const readFile = useCallback(
    (file: File) => {
      if (accept && accept.length > 0) {
        const ext = `.${file.name.split(".").pop()?.toLowerCase()}`
        if (!accept.includes(ext)) return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        if (content != null) {
          onFileDrop({ content, filename: file.name })
        }
      }
      reader.readAsText(file)
    },
    [onFileDrop, accept],
  )

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.items?.length) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      dragCounter.current = 0

      const files = e.dataTransfer.files
      if (files.length > 0) {
        readFile(files[0])
      }
    },
    [readFile],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        readFile(files[0])
      }
      // Reset so the same file can be selected again
      e.target.value = ""
    },
    [readFile],
  )

  const acceptString = accept?.join(",") || undefined
  const openFilePicker = useCallback(() => fileInputRef.current?.click(), [])

  return (
    <fieldset
      className={`relative min-w-0 ${className}`}
      aria-label="File drop area"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children({ openFilePicker })}

      <input ref={fileInputRef} type="file" accept={acceptString} onChange={handleFileInput} className="hidden" />

      {/* Drag overlay */}
      {isDragging ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg border-2 border-dashed border-orange-400 bg-orange-50/90 backdrop-blur-sm dark:border-orange-500 dark:bg-orange-950/90">
          <div className="text-center">
            <Upload className="mx-auto mb-2 h-8 w-8 text-orange-500 dark:text-orange-400" />
            <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Drop your file here</p>
          </div>
        </div>
      ) : null}
    </fieldset>
  )
}
