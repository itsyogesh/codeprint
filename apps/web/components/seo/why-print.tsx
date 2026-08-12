import { Reveal } from "@/components/motion/reveal"
import type { LanguageData } from "@/lib/languages"

export function WhyPrintSection({ language }: { language: LanguageData }) {
  const paragraphs =
    language.slug === "python"
      ? [
          "Python’s indentation is part of the program, not decoration. If a printout collapses leading spaces, wraps blocks carelessly, or separates a decorator from its function, the code becomes harder to reason about and can appear to mean something it does not. Codeprint preserves whitespace, decorators, type annotations, comprehensions, and f-strings exactly while adding syntax colors that remain useful on paper.",
          "Desk checking is a time-tested way to find problems that disappear into a familiar editor theme. With the whole function visible at once, you can trace state changes, circle an incorrect condition, compare branches, and write questions beside the precise line that prompted them. Line numbers make those notes easy to bring back into a pull request or classroom discussion.",
          "The result is designed as a document rather than a screenshot. Text remains selectable, the page size and orientation are explicit, and dense scripts can use a smaller type size or multiple columns. That makes a Python PDF useful for code reviews, teaching handouts, architecture records, and offline interview practice without uploading the script to a conversion service.",
        ]
      : [
          `${language.name} source is easier to review when its structure survives the move from editor to page. ${language.features[0]?.description ?? "Codeprint preserves syntax, spacing, and comments."} Codeprint keeps indentation and line breaks intact, then applies a restrained syntax palette so keywords, strings, comments, and identifiers remain distinguishable in print.`,
          `A paper review creates a different reading rhythm from an IDE. You can see more of the file at once, mark a questionable branch, compare related expressions, and refer back to a precise line without opening the same toolchain. ${language.features[3]?.description ?? "Optional line numbers make written feedback easy to reference."}`,
          `${language.features[1]?.description ?? "The finished document exports as a real PDF with selectable text."} Page size, orientation, columns, and type size remain under your control, which matters when the source contains long expressions or dense blocks. It is a practical fit for ${language.useCases[0]?.title.toLowerCase() ?? "code review"}, ${language.useCases[1]?.title.toLowerCase() ?? "teaching"}, and technical documentation. Your source stays in your browser throughout the process.`,
        ]

  return (
    <section className="mx-auto max-w-3xl py-14">
      <Reveal>
        <h2 className="font-serif text-3xl font-bold tracking-[-0.025em] text-slate-900 dark:text-white">
          Why print {language.name}?
        </h2>
      </Reveal>
      <div className="leading-editorial mt-6 space-y-5 text-pretty text-slate-600 dark:text-slate-400">
        {paragraphs.map((paragraph, index) => (
          <Reveal key={paragraph} delay={index * 0.06} distance={10}>
            <p>{paragraph}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
