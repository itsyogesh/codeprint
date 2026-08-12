# Open source and sustainability

Last updated: 2026-08-12

This document records how Codeprint will be licensed, what will remain free,
and which kinds of paid work may support the project later. It is a public
product decision, not a promise that any paid service already exists.

## Decision

Codeprint's original source code is released under
[GNU AGPL version 3 only](../LICENSE), identified in package metadata as
`AGPL-3.0-only`.

The initial browser app, PDF renderer, CLI, MCP server, and local printing
packages use the same license. Keeping one license across the workspace makes
the first release easier to understand and audit.

The AGPL permits personal and commercial use. It also permits modification and
redistribution. Its copyleft conditions require covered source to remain
available in circumstances described by the license, including when users
interact over a network with a modified covered program.

The AGPL does not require every company to pay Codeprint. A company that follows
the license may use the software commercially without buying another license.

## What the license covers

The repository license covers Codeprint's original source unless a file or
directory clearly says otherwise. Bundled dependencies, fonts, icons, and other
third-party material keep their own licenses. Those are recorded in
[THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) and in package-specific
notices where required.

PDFs and printouts created from a user's own material are not placed under the
AGPL merely because Codeprint generated them. The user remains responsible for
the rights to the material supplied to Codeprint.

The Codeprint name, logo, and visual identity identify the original project.
The software license does not grant permission to present a fork or service as
the official Codeprint product or imply endorsement. Truthful references to
Codeprint and compatibility are allowed, subject to applicable trademark law.

## Why this model fits the first release

Open-source products listed by directories such as OpenAlternative use several
repeatable sustainability models:

| Product | Public model | Paid value |
| --- | --- | --- |
| [Postiz](https://github.com/gitroomhq/postiz-app) | AGPL self-hosted product | Managed hosting and operational services |
| [Plausible](https://github.com/plausible/analytics) | AGPL community edition | Managed analytics hosting and support |
| [Documenso](https://docs.documenso.com/docs/policies/community-edition) | AGPL community edition | Hosted plans, platform use, support, and enterprise licensing |
| [Formbricks](https://formbricks.com/docs/self-hosting/advanced/license) | AGPL core with separate enterprise modules | Managed cloud and enterprise administration features |
| [Stirling PDF](https://github.com/Stirling-Tools/Stirling-PDF) | MIT open core with separate proprietary components | Automated processing, on-premise operation, and enterprise support |
| [Cal.diy](https://github.com/calcom/cal.diy) | MIT community product separated from Cal.com | Hosted collaboration, compliance, and enterprise support |

The common pattern is to keep the core product genuinely useful and charge for
ongoing operational value. Codeprint will follow that principle. Editorial PDF
quality, privacy, and readable local export are not artificial paywalls.

## Launch commitments

The first public release will provide:

- Free browser-based PDF creation for code, Markdown, JSON, and CSV
- The same canonical rendering engine in the browser, CLI, and MCP server
- No watermark on generated PDFs
- Local document handling without a Codeprint upload service
- Public source for the released version
- Community support without an uptime or support guarantee

The first release will not include a paid plan, advertising, hosted document
storage, remote printing, or a proprietary enterprise module.

## Possible paid work

Paid work should correspond to continuing infrastructure, organizational value,
or direct human effort. The likely sequence is:

1. Custom integrations, tailored deployments, and workflow consulting
2. A managed PDF processing API with batches, queues, and webhooks
3. A secure cloud print relay for browser, CLI, and MCP workflows
4. Shared organizational templates, fonts, presets, and document history
5. Enterprise administration, audit logs, access policy, SSO, SLAs, and on-premise support
6. A separate commercial agreement for proprietary embedding or private modifications, if real demand appears

None of these items should reduce the quality or privacy of the free local
product. A recurring price should be introduced only when Codeprint provides
recurring value or incurs recurring cost.

## Contributions and future licensing

Contributions are accepted under the repository's AGPL license. Codeprint does
not currently require a contributor license agreement and does not currently
offer a proprietary license.

Before accepting contributions that would need to be included in a future
commercially licensed edition, the project must choose and publish clear
contributor terms. Existing contributions cannot be relicensed without the
permissions required from their copyright holders.

## Decision triggers

The project should revisit this document only when evidence changes the product
shape. Useful triggers include:

- Repeated requests for a managed API or remote print service
- Organizations asking for private modifications, SSO, audit, or an SLA
- Material infrastructure cost that cannot be supported by donations
- A clear need for an embeddable package with different compatibility goals
- The first substantial external code contribution

Until one of those triggers appears, the release remains a free AGPL product
supported by community contributions, sponsorship, and optional custom work.
