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

// Submit only after the user approves prepared.summary.
const job = await service.submit(prepared.confirmationToken)
```

Preparation tokens expire after five minutes and can be submitted only once. Windows direct printing is not implemented yet.

## License

GNU AGPL version 3 only. Commercial use is allowed subject to the AGPL. The
full license is included with the package.
