# Security policy

Codeprint processes untrusted documents and can interact with local files and
physical printers. Security reports are taken seriously and should be shared
privately until a fix is available.

## Supported versions

Codeprint has not reached a stable public release. Security fixes are made on the
current default branch and, after releases begin, on the latest published
version. Older commits, prerelease builds, forks, and unofficial deployments may
not receive fixes.

## Report a vulnerability privately

Use the repository's
[private vulnerability reporting form](https://github.com/itsyogesh/codeprint/security/advisories/new).
Do not include vulnerability details in a public issue, discussion, pull request,
or social post before coordinated disclosure.

Include as much of the following as you can:

- The affected package, route, command, or MCP tool
- The tested commit or package version and operating system
- A concise description of the impact and security boundary crossed
- Reproduction steps or a minimal proof of concept
- Whether document contents, local files, printer access, or remote requests are
  involved
- Any mitigation or fix you have already identified

Use synthetic test data. Do not send credentials, personal documents, private
printer details, or data belonging to another person.

## What to expect

A maintainer will review the report, reproduce it when possible, assess its
severity, and coordinate remediation and disclosure. Response time depends on
availability and the complexity of the report. Please allow a reasonable period
for investigation before publishing details.

If the report is accepted, the intended process is to:

1. Confirm the affected versions and practical impact.
2. Prepare tests and the smallest complete fix.
3. Review any required dependency, release, or deployment changes.
4. Publish updated packages or a deployment when applicable.
5. Credit the reporter if requested and safe to do so.

## In-scope security boundaries

Examples include:

- Script, markup, SVG, or URL injection through document or Mermaid input
- Reading, overwriting, or writing files outside the caller-authorized path
- Shell or argument injection through filenames, paths, printer names, or options
- Bypassing the prepare and confirm boundary for a physical print job
- Reusing, extending, or guessing print confirmation tokens
- MCP tool behavior that exceeds the user's approved operation
- Unsafe remote fetching, server-side request forgery, or document data leakage
- Denial of service through oversized or adversarial parsing, layout, SVG, image,
  or PDF input
- Dependency or bundled-asset vulnerabilities that affect a distributed surface

General product bugs, feature requests, and unsupported printer reports can use a
public issue when they do not reveal a vulnerability.

## Current operational boundaries

- The web document pipeline is designed to render locally in the browser.
- The CLI and MCP server operate on the local machine and can write only to paths
  authorized by the caller and application policy.
- Browser printing is handed to the browser and operating system.
- CLI and MCP physical printing requires a separate confirmed submission after
  preparation.
- Marketing language icons are requested from jsDelivr's Devicon distribution.
  Document contents and filenames must never be included in those requests.

These boundaries describe the intended design, not a guarantee that the software
is free of defects.

## Good-faith research

Research must avoid privacy violations, service disruption, destructive printer
actions, and access to data that is not yours. Stop testing and report privately
if you encounter sensitive data or gain unintended access. This policy does not
authorize testing of third-party services, printers, networks, or accounts.
