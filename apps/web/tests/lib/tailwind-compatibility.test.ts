import { readFile } from "node:fs/promises"
import path from "node:path"
import tailwind from "@tailwindcss/postcss"
import postcss, { type Root } from "postcss"
import { beforeAll, describe, expect, it } from "vitest"

let css: Root

beforeAll(async () => {
  const from = path.resolve(import.meta.dirname, "../../app/globals.css")
  const source = await readFile(from, "utf8")
  const result = await postcss([tailwind()]).process(
    `${source}\n@source inline("bg-orange-500 bg-slate-950 border-slate-200 text-sm shadow-sm rounded-sm ring outline-none -translate-x-1/2 active:translate-y-[2px] rotate-180 scale-105 motion-reduce:transform-none");`,
    { from },
  )
  css = result.root
}, 15_000)

function rulesFor(selector: string) {
  const rules: string[] = []
  css.walkRules((rule) => {
    if (rule.selector === selector || rule.selector === `${selector}${selector}`) rules.push(rule.toString())
  })
  return rules.join("\n")
}

describe("Tailwind compiler upgrade visual compatibility", () => {
  it.each([
    [".bg-orange-500", "background-color: #f97316"],
    [".bg-slate-950", "background-color: #020617"],
    [".border-slate-200", "border-color: #e2e8f0"],
    [".text-sm", "font-size: 0.875rem"],
    [".text-sm", "line-height: var(--tw-leading, 1.25rem)"],
    [".rounded-sm", "border-radius: calc(var(--radius) - 4px)"],
    [".shadow-sm", "0 1px 2px 0"],
  ])("retains the existing token for %s (%s)", (selector, declaration) => {
    expect(rulesFor(selector)).toContain(declaration)
  })

  it("retains the three-pixel default focus ring", () => {
    expect(css.toString()).toContain("--default-ring-width: 3px")
  })

  it("keeps a transparent outline for forced-colors focus support", () => {
    expect(rulesFor(".outline-none")).toContain("outline: 2px solid transparent")
    expect(rulesFor(".outline-none")).toContain("outline-offset: 2px")
  })

  it.each([
    [".-translate-x-1\\/2", "translate: none"],
    [".active\\:translate-y-\\[2px\\]:active", "translate: none"],
    [".rotate-180", "rotate: none"],
    [".scale-105", "scale: none"],
  ])("keeps %s on the transform property used by Framer and hover motion", (selector, reset) => {
    const rules = rulesFor(selector)
    expect(rules).toContain(reset)
    expect(rules).toContain("transform: translate(")
  })

  it("retains entry and exit animation definitions", () => {
    const output = css.toString()
    expect(output).toContain("@keyframes enter")
    expect(output).toContain("@keyframes exit")
    expect(output).toContain("animation-name: enter")
    expect(output).toContain("animation-name: exit")
  })

  it("preserves explicit editorial line-height utilities", () => {
    expect(rulesFor(".leading-display")).toContain("line-height: 1.08")
    expect(rulesFor(".leading-copy")).toContain("line-height: 1.5")
    expect(rulesFor(".leading-editorial")).toContain("line-height: 1.55")
  })
})
