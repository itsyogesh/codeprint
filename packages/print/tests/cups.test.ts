import { describe, expect, it } from "vitest"
import { parseCapabilities, parseJobs, parsePrinterList } from "../src"

describe("CUPS output parsing", () => {
  it("finds printers and marks the default", () => {
    const printers = parsePrinterList(
      [
        "printer Office is idle. enabled since Friday",
        "printer Label stopped since Thursday",
        "system default destination: Office",
      ].join("\n"),
    )

    expect(printers).toEqual([
      { id: "Office", name: "Office", isDefault: true, state: "is idle. enabled since Friday" },
      { id: "Label", name: "Label", isDefault: false, state: "stopped since Thursday" },
    ])
  })

  it("parses capability choices without CUPS default markers", () => {
    expect(
      parseCapabilities(
        ["PageSize/Media Size: *A4 Letter Legal", "Duplex/2-Sided Printing: *None DuplexNoTumble DuplexTumble"].join(
          "\n",
        ),
      ),
    ).toEqual({
      PageSize: ["A4", "Letter", "Legal"],
      Duplex: ["None", "DuplexNoTumble", "DuplexTumble"],
    })
  })

  it("parses incomplete print jobs", () => {
    expect(parseJobs("Office-42 alice 2048 Fri 08 Aug 2026 10:00:00 AM IST")).toEqual([
      {
        id: "Office-42",
        printerId: "Office",
        state: "pending",
        owner: "alice",
        sizeBytes: 2048,
        submittedAt: "Fri 08 Aug 2026 10:00:00 AM IST",
      },
    ])
  })
})
