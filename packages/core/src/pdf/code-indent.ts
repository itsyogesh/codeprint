/** Textkit ignores leading whitespace. Set this on nested runs too: textIndent is not inherited. */
export function codeLineIndent(segments: readonly { text: string }[], fontSize: number): number {
  let columns = 0
  for (const segment of segments) {
    for (const character of segment.text) {
      if (character === " ") columns += 1
      else if (character === "\t") columns += 4
      else return columns * fontSize * 0.6
    }
  }
  // Source Code Pro and Courier both advance one monospace column by 0.6 em.
  return columns * fontSize * 0.6
}
