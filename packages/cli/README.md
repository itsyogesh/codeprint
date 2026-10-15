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

Import a public GitHub file or direct HTTPS UTF-8 text file and render locally:

```bash
codeprint render --url 'https://github.com/itsyogesh/codeprint/blob/main/README.md' -o reading-copy.pdf
```

`--url` also works with `print`; the normal print confirmation still applies.
Choose either a local input or `--url`, not both. Imports are limited to 2 MiB
and 15 seconds. Redirects, credentials, custom ports, private-network addresses,
binary responses, and private repositories are not supported. Codeprint does not
execute imported code or forward authentication. Your computer contacts the
source host directly; document rendering and printer handling stay local.

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
