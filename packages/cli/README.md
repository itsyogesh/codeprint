# @codeprint/cli

Render and print code, Markdown, JSON, and CSV from a terminal.

## Installation

```bash
npm install --global @codeprint/cli
```

Or run one command without installing:

```bash
npx @codeprint/cli render README.md
```

## Commands

```text
codeprint render [input]          Render a source file or stdin to PDF
codeprint print [input]           Prepare, confirm, and submit a local print job
codeprint printers                List configured printers
codeprint printer-info <printer>  Show printer capabilities
codeprint jobs                    List incomplete jobs
codeprint cancel <job-id>         Cancel an incomplete job
```

Run `codeprint <command> --help` for every option.

Physical printing currently requires CUPS on macOS or Linux. The CLI prompts before submitting unless `--yes` is supplied. Use `--yes` only after the resolved settings have been reviewed.

## License

GNU AGPL version 3 only. Commercial use is allowed subject to the AGPL. The
full license is included with the package.
