# @codeprint/print

Local printer discovery and safe print submission for Codeprint.

The first adapter supports CUPS on macOS and Linux. It uses `lpstat`, `lpoptions`, `lp`, and `cancel` through `node:child_process.spawn` with `shell: false`.

```typescript
import { createPrintService } from "@codeprint/print"

const service = createPrintService()
const prepared = await service.prepare({
  pdfPath: "/absolute/path/review.pdf",
  options: {
    printerId: "Office_Printer",
    copies: 1,
    duplex: "two-sided-long-edge",
  },
})

console.log(prepared.summary)
console.log(prepared.contentSha256)

// Submit only after the user approves prepared.summary.
const job = await service.submit(prepared.confirmationToken)
service.dispose()
```

Preparation tokens expire after five minutes and can be submitted only once. Windows direct printing is not implemented yet.

## Approval and document safety

Preparation saves a private in-memory snapshot of the PDF and binds the token to
its SHA-256 digest, selected printer, and normalized settings. Returned receipts
cannot mutate the saved job. Submission rejects changed, replaced, deleted, or
symlinked source files, then streams the saved bytes directly to `lp` standard
input. CUPS never reopens the reviewed filename, preventing a final-check/file-open
race. The final path component must be a regular file, not a symbolic link;
ordinary symlinks in parent directories are resolved by the operating system.
Concurrent writes detected while reading are rejected.

Each PDF is limited to 32 MiB, all retained snapshots (including submissions) to
64 MiB, and pending/in-flight preparations and submissions to eight. Capacity is
reserved before reading. Submission verification uses a wiped 64 KiB streaming
hash buffer per active job, not another complete PDF copy; this adds at most
512 KiB of bounded working memory beyond the retained snapshot limit. Call
`service.discard(token)` when approval is cancelled, and `service.dispose()` in a
`finally` block when closing a service. Snapshots are zero-filled on submission
(including errors), cancellation, expiry, and disposal. No temporary PDF copies
are written by this package. CUPS itself may retain spool files under its own
configured retention policy. JavaScript/OS copies, swap, crash dumps, and a
compromised process or print daemon are outside this memory-cleanup guarantee.

Tokens express the caller's confirmation, not independent proof that a human
approved. Hosts must ask for approval of the PDF identity and exact settings.
Custom backends are trusted and must consume the supplied bytes before their
`submit` promise resolves; the buffer is wiped immediately afterward. This package
checks PDF identification and byte identity, not PDF semantic safety or driver
security. A timeout/failure may be ambiguous if CUPS already accepted a job: check
the queue before preparing and approving a retry; never automatically retry it.

## License

GNU AGPL version 3 only. Commercial use is allowed subject to the AGPL. The
full license is included with the package.
