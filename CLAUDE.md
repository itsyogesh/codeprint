# CLAUDE.md - Code Printer Project Context

This file provides context for AI assistants (like Claude) to understand and work with this codebase effectively.

## Project Overview

**Code Printer** is a Next.js 15 web application for transforming code into beautifully formatted, print-ready documents with syntax highlighting. The app allows users to paste code, customize print settings, preview the output, and print or export to PDF.

## Tech Stack

- **Framework**: Next.js 14.2.16 with App Router (React 19)
- **UI Library**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with tailwindcss-animate
- **Animations**: Framer Motion
- **Syntax Highlighting**: highlight.js (dynamically loaded)
- **Markdown Parsing**: marked library
- **Icons**: Lucide React
- **Language**: TypeScript

## Project Structure

\`\`\`
/
├── app/
│   ├── docs/page.tsx         # Documentation page
│   ├── globals.css           # Global styles, print styles, markdown/CSV styles
│   ├── layout.tsx            # Root layout with theme provider
│   └── page.tsx              # Main application (code editor + preview)
├── components/
│   ├── language-renderers/
│   │   ├── csv-renderer.tsx      # CSV to table rendering
│   │   └── markdown-renderer.tsx # Markdown to HTML rendering
│   ├── ui/                   # shadcn/ui components (do not modify)
│   ├── code-editor.tsx       # Code input + language selector
│   ├── pdf-generator.tsx     # PDF generation utilities
│   ├── print-preview.tsx     # Main preview with pagination
│   ├── print-settings.tsx    # Settings dropdown panel
│   └── theme-provider.tsx    # Dark mode support
├── hooks/
│   └── use-toast.ts          # Toast notification hook
├── lib/
│   ├── constants.ts          # Language lists, highlightable languages
│   └── utils.ts              # Utility functions (cn, debounce, escapeHtml, safeHighlight)
└── package.json              # Dependencies
\`\`\`

## Key Files to Understand

### `app/page.tsx`
Main application page containing:
- Hero section with branding
- Code editor section (collapsible)
- Preview section with settings, print, and PDF buttons
- Hidden print content div for generating print output
- State management for code, settings, filename, language

### `components/print-preview.tsx`
Core preview component that:
- Calculates page dimensions based on settings (page size, orientation)
- Splits code into pages based on available height
- Renders syntax-highlighted code with line numbers
- Handles special languages (CSV, Markdown) with dedicated renderers
- Provides pagination navigation

### `components/print-settings.tsx`
Settings panel with:
- Line numbers toggle
- Syntax highlighting toggle
- Header on all pages toggle
- Font size (6-24px) with increment/decrement
- Columns (1-3) with increment/decrement
- Page orientation (portrait/landscape) with icons
- Page size dropdown (A4, Letter, Legal)

### `components/language-renderers/markdown-renderer.tsx`
Renders markdown content using the `marked` library with:
- Custom renderer for code blocks with syntax highlighting
- Proper styling for headings, lists, tables, blockquotes
- Print-optimized styles

### `components/language-renderers/csv-renderer.tsx`
Parses and renders CSV as formatted HTML tables with:
- Header row detection
- Alternating row colors
- Proper handling of quoted fields with commas

### `lib/utils.ts`
Utility functions:
- `cn()`: Class name merging (Tailwind)
- `debounce()`: Input debouncing for performance
- `escapeHtml()`: HTML entity escaping
- `safeHighlight()`: Safe syntax highlighting with language validation

### `lib/constants.ts`
Constants:
- `HIGHLIGHTABLE_LANGUAGES`: Languages supported by highlight.js
- `SPECIAL_LANGUAGES`: Languages with custom renderers (csv, markdown)

## Important Patterns

### Language Detection
Languages are auto-detected from file extensions in `app/page.tsx`:
\`\`\`typescript
const extensionMap: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  // ... more mappings
}
\`\`\`

### Special Language Handling
CSV and Markdown bypass highlight.js and use dedicated renderers:
\`\`\`typescript
const isSpecialLanguage = SPECIAL_LANGUAGES.includes(language)
if (isSpecialLanguage) {
  // Use custom renderer
}
\`\`\`

### Print Architecture
Print functionality uses a hidden div (`#print-content`) that:
1. Is positioned off-screen with `visibility: hidden`
2. Contains all pages rendered with proper styling
3. Is made visible temporarily during print/PDF generation
4. Uses browser's native print functionality

### Debounced Code Processing
Code input is debounced to prevent excessive re-renders:
\`\`\`typescript
const debouncedSetCode = useMemo(() => debounce((value: string) => setDebouncedCode(value), 300), [])
\`\`\`

## Styling Conventions

### Theme Colors
- Primary: Violet/Indigo gradient (`from-violet-600 to-indigo-600`)
- Accent: Violet (`violet-600`)
- Background: Slate gradients
- Dark mode: Full support via `next-themes`

### Print Styles
Print-specific styles are in `app/globals.css`:
- `@media print` rules for hiding UI elements
- Page break handling
- Border and shadow removal for printed output

### Component Styling
- Uses Tailwind CSS utilities
- shadcn/ui components with customization via className
- Framer Motion for animations

## Common Tasks

### Adding a New Language
1. Add to `languages` array in `components/code-editor.tsx`
2. Add extension mapping in `app/page.tsx`
3. If highlight.js supports it, add to `HIGHLIGHTABLE_LANGUAGES` in `lib/constants.ts`
4. If special rendering needed, create renderer in `components/language-renderers/`

### Modifying Print Output
1. Edit styles in `#print-content` section of `app/page.tsx`
2. Update print styles in `app/globals.css`
3. Modify page calculation in `components/print-preview.tsx`

### Changing Settings Options
1. Update `settings` state type in `app/page.tsx`
2. Add UI controls in `components/print-settings.tsx`
3. Apply settings in `components/print-preview.tsx`

## Known Issues & Considerations

1. **Markdown code blocks**: The `marked` library needs careful configuration for proper code block rendering
2. **PDF generation**: Uses browser print dialog - results may vary by browser
3. **Large files**: Performance optimized with debouncing and memoization
4. **Line wrapping**: Long lines wrap but maintain correct line numbers

## Testing Notes

- Test print functionality with Chrome (recommended browser)
- Verify PDF output matches preview
- Test with various languages and file sizes
- Check pagination with different page sizes and orientations

## Dependencies to Note

Key dependencies and their purposes:
- `highlight.js`: Syntax highlighting (loaded dynamically)
- `marked`: Markdown parsing
- `framer-motion`: Animations
- `html2canvas` + `jspdf`: PDF generation (available but not primary method)

## Development Commands

\`\`\`bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
\`\`\`
