# @codeprint/mcp

Local MCP server for Codeprint PDF creation and confirmed physical printing.

## Client configuration

```json
{
  "mcpServers": {
    "codeprint": {
      "command": "npx",
      "args": ["-y", "@codeprint/mcp"],
      "env": {
        "CODEPRINT_OUTPUT_DIR": "/absolute/path/to/Codeprint"
      }
    }
  }
}
```

## PDF tools

`create_printable_pdf` supports Markdown, code, and CSV. For JSON, pass `format: "code"`, `language: "json"`, and a `.json` filename. Existing files are never overwritten.

## Print tools

1. Call `list_printers` and optionally `get_printer_capabilities`.
2. Call `prepare_print_job` with the local PDF path and requested settings.
3. Show the returned summary to the user.
4. Call `submit_print_job` only after explicit approval.

The confirmation token expires after five minutes and can be used only once. `list_print_jobs` and `cancel_print_job` expose the local spooler queue.

Document content is not sent to Codeprint or another cloud service.

## License

GNU AGPL version 3 only. Commercial use is allowed subject to the AGPL. The
full license is included with the package.
