# Codeprint roadmap

Last updated: 2026-10-15

This file tracks the public product and launch pipeline. Private design prompts,
research notes, and working plans are intentionally kept outside the repository.

## Launch shape

Codeprint's combined release includes the free, open-source browser product,
CLI, and local MCP server for code, Markdown, JSON, and CSV. The browser product
is already live. Keep developer-tool discovery hidden until the npm packages
are usable and release validation passes, then reveal all three together.

The original Codeprint source uses `AGPL-3.0-only`. The first release has no
paid tier. The public licensing and sustainability decision is recorded in
`docs/OPEN_SOURCE_AND_SUSTAINABILITY.md`.

Markdown includes print-safe rendering for flowchart, state, sequence, class,
and ER Mermaid fences at 300 PPI. Unsupported Mermaid families fall back to
their readable source. A dedicated Mermaid route is not part of the first launch.

The first launch does not include advertising, a paid tier, cloud printing,
remote printer access, or Windows direct printing.

## Completed foundation

- [x] Monorepo with web, core, print, CLI, and MCP workspaces
- [x] One shared PDF document engine for browser, CLI, and MCP
- [x] CUPS printer discovery, capability checks, confirmation, submission, and cancellation
- [x] Code, Markdown, CSV, 21 language pages, documentation, and company pages
- [x] Visual system, illustrations, motion, navigation, and responsive structure
- [x] Route-specific Open Graph previews, favicon, manifest, metadata, sitemap, robots, and structured data
- [x] CLI and MCP landing pages behind one web release flag
- [x] npm package metadata and a trusted-publishing GitHub Actions workflow
- [x] Type checks, unit tests, production builds, package dry runs, and fake-printer smoke coverage
- [x] AGPL-3.0-only declarations and canonical license text across the repository and packages
- [x] Public open-source and sustainability decision
- [x] Bundled local Mulish, Merriweather, and Source Code Pro faces with exact Latin and Cyrillic text extraction
- [x] Print-safe Markdown Mermaid rendering for flowchart, state, sequence, class, and ER diagrams
- [x] Unsupported Mermaid families preserve source instead of failing document generation
- [x] Byte-bound print approvals, immutable settings, single-use tokens, expiry, and bounded private snapshots
- [x] Dependency remediation with a clean full audit, preserving established design tokens
- [x] Isolated consumer tests for exact package tarballs, installed CLI shortcuts, and real-stdio MCP resources

## Gate 1: public repository

- [ ] Reconcile this branch with `main` and make it the reviewed default branch
- [ ] Review agent-helper guidance such as `CLAUDE.md` for current accuracy
- [x] Move private prompts, research, and working plans into the sibling private workbench
- [x] Add contributor guidelines and a security reporting policy
- [x] Add third-party notices for bundled fonts, rendering libraries, and externally served icons
- [x] Replace the current private history with a reviewed public history that excludes private prompts and research
- [x] Remove remote refs that expose private workbench artifacts before changing repository visibility
- [x] Run a full history-aware secret scan and review generated or personal files
- [x] Make `itsyogesh/codeprint` public only after the checks above pass
- [ ] Enable issues, discussions if desired, private vulnerability reporting, and branch protection

## Gate 2: editorial rendering and output parity

- [x] Use the actual generated PDF as the preview source for code, CSV, and Markdown
- [x] Add editorial regressions for long Markdown, code, CSV, tables, links, and difficult page breaks
- [x] Embed exact fonts and weights used by the renderer
- [x] Keep manually paginated multi-column code on the selected physical paper size
- [x] Protect paragraph widows and orphans and keep headings with following content
- [x] Repeat supported Markdown table headers and keep individual table rows from splitting
- [x] Keep source code, CSV values, and identifiers free from automatic hyphenation
- [ ] Add conservative locale-aware hyphenation for prose without changing source behavior
- [ ] Add vetted multilingual prose hyphenation packs; these remain unsupported
- [ ] Add intentional code-block continuation treatment
- [ ] Render PDFs to page images in CI and detect overflow, page-count changes, and visual regressions
- [x] Evaluate Pretext against the browser and React PDF architectures and defer adoption
- [ ] Revisit Pretext only if a large browser-only virtualized preview needs pre-layout measurement

## Gate 3: web production launch

- [x] Deploy the monorepo web app to Vercel
- [ ] Attach `codeprint.app`, configure HTTPS, and redirect `www` to the canonical non-www domain
- [ ] Verify every production route, redirect, canonical, sitemap entry, and Open Graph image
- [ ] Test download and browser printing in current Chrome, Safari, and Firefox
- [ ] Test responsive layout, keyboard operation, reduced motion, and light/dark themes
- [ ] Run Lighthouse and fix launch-blocking accessibility or Core Web Vitals issues
- [ ] Reveal CLI and MCP navigation, sitemap discovery, and indexing for the combined release after npm verification
- [ ] Set up privacy-safe product events without collecting document contents or filenames
- [x] Verify personal Google Search Console ownership and submit the valid sitemap
- [ ] Verify Bing Webmaster Tools
- [ ] Publish at least two useful guides before exposing the blog in primary navigation

## Gate 4: npm, CLI, and MCP release

- [x] Validate PDF rendering on Node 22 and Node 24
- [ ] Perform a real CUPS print test on macOS and one Linux environment
- [x] Confirm all four package tarballs contain only the intended runtime files and notices
- [ ] Publish in order: `@codeprint/core`, `@codeprint/print`, `@codeprint/cli`, `@codeprint/mcp`
- [ ] Configure npm trusted publishers and verify the manual release workflow
- [ ] Test clean `npx` installs and MCP configuration outside the repository
- [ ] Tag the release and publish a changelog entry
- [ ] Reveal and index the CLI and MCP web surfaces after the packages are usable

## After launch

- [ ] Review real search queries before adding new format-specific routes
- [ ] Decide whether JSON needs a dedicated workflow based on usage and search data
- [ ] Decide whether Mermaid needs a dedicated route based on Markdown usage and search data
- [ ] Add Windows direct-print support
- [ ] Expand editorial presets while keeping React PDF as the canonical document layout engine
- [ ] Consider one privacy-friendly ad on content pages after 50,000 monetizable monthly pageviews
- [ ] Consider direct sponsorship before subscriptions or a paid tier

## Release order

1. Public-repository preparation
2. Editorial parity and launch QA
3. Verify exact package artifacts and complete the first npm publications
4. Verify clean registry installs, actual MCP-host previews, and printer behavior
5. Deploy the combined web, CLI, and MCP reveal on `codeprint.app`
6. Search-led iteration and editorial improvements
