export const CLI_PACKAGE_NAME = "@codeprint/cli"
export const MCP_PACKAGE_NAME = "@codeprint/mcp"
export const NODE_REQUIREMENT = "Node.js 22.12 or newer"

export const CLI_INSTALL_COMMAND = `npm install --global ${CLI_PACKAGE_NAME}`
export const CLI_RUN_COMMAND = `npx ${CLI_PACKAGE_NAME} render README.md`
export const MCP_RUN_COMMAND = `npx -y ${MCP_PACKAGE_NAME}`

export const MCP_CONFIG = `{
  "mcpServers": {
    "codeprint": {
      "command": "npx",
      "args": ["-y", "@codeprint/mcp"]
    }
  }
}`

export const CLI_COMMANDS = [
  {
    id: "render",
    label: "Render PDF",
    command: "codeprint render README.md",
    output: ["Parsing Markdown...", "Created 2-page PDF at /project/README.pdf"],
  },
  {
    id: "print",
    label: "Print locally",
    command: "codeprint print architecture.md --page-size a4 --duplex two-sided-long-edge",
    output: [
      "Prepared architecture.pdf: 1 copy, A4, two-sided-long-edge, auto, all pages, printer Office_Printer",
      "Print 1 copy, A4, two-sided-long-edge, auto, all pages, printer Office_Printer? [y/N] y",
      "Submitted print job 1042.",
    ],
  },
  {
    id: "printers",
    label: "List printers",
    command: "codeprint printers",
    output: ["* Office_Printer\tidle", "  Home_LaserJet\tidle", "  Design_Dept_Color\tprocessing"],
  },
  {
    id: "printer-info",
    label: "Inspect printer",
    command: "codeprint printer-info Office_Printer",
    output: [
      '{ "pageSizes": ["A4", "Letter", "Legal"],',
      '  "duplexModes": ["one-sided", "two-sided-long-edge"],',
      '  "colorModes": ["auto", "monochrome"] }',
    ],
  },
  {
    id: "jobs",
    label: "List jobs",
    command: "codeprint jobs",
    output: ["Office_Printer-1042\tprocessing", "Home_LaserJet-1043\tpending"],
  },
  {
    id: "cancel",
    label: "Cancel job",
    command: "codeprint cancel Office_Printer-1042",
    output: ["Cancelled print job Office_Printer-1042."],
  },
] as const

export const CLI_FORMATS = [
  { title: "Markdown", description: "Headings, tables, code blocks, and an optional table of contents." },
  { title: "Code", description: "Syntax colors, line numbers, and more than 20 language profiles." },
  { title: "JSON", description: "Pretty-printed as syntax-highlighted code with the JSON language profile." },
  { title: "CSV", description: "Landscape-ready tables with headers and alternating row colors." },
] as const

export const MCP_TOOL_GROUPS = [
  {
    title: "Create the reading copy",
    description:
      "The assistant passes Markdown, code, JSON, or CSV to the local renderer. The PDF is saved without overwriting an existing file.",
    tools: ["create_printable_pdf"],
  },
  {
    title: "Inspect the local printer",
    description:
      "Read the printers configured by the operating system, then check paper, duplex, and color support before preparing a job.",
    tools: ["list_printers", "get_printer_capabilities"],
  },
  {
    title: "Review, then print",
    description:
      "Prepare returns the exact file, printer, and settings with a five-minute, single-use token. Submit is a separate action after approval.",
    tools: ["prepare_print_job", "submit_print_job", "list_print_jobs", "cancel_print_job"],
  },
] as const
