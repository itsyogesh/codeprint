"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, Braces, FileText, Hash, Lock, Zap } from "lucide-react"

const EASE_OUT = [0.23, 1, 0.32, 1] as const
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const
const GENTLE_SPRING = { type: "spring" as const, duration: 0.5, bounce: 0.2 }

interface DocumentTransformIllustrationProps {
  source: "code" | "markdown"
}

export function DocumentTransformIllustration({ source }: DocumentTransformIllustrationProps) {
  const SourceIcon = source === "code" ? Braces : Hash

  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <motion.div
        className="relative flex h-20 w-16 flex-col gap-1.5 rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        variants={{
          rest: { transform: "translateY(0px) rotate(0deg)" },
          hover: { transform: "translateY(-4px) rotate(-4deg)" },
        }}
        transition={GENTLE_SPRING}
      >
        <span className="h-1.5 w-6 rounded-sm bg-orange-200 dark:bg-orange-500/40" />
        <span className="h-1 w-full rounded-sm bg-slate-100 dark:bg-slate-700" />
        <span className="ml-2 h-1 w-4/5 rounded-sm bg-slate-100 dark:bg-slate-700" />
        <span className="ml-2 h-1 w-3/4 rounded-sm bg-slate-100 dark:bg-slate-700" />
        <span className="absolute -bottom-2 -right-2 rounded-md border border-orange-200 bg-orange-100 p-1 text-orange-500 shadow-sm dark:border-orange-500/30 dark:bg-orange-500/20">
          <SourceIcon className="h-3 w-3" />
        </span>
      </motion.div>
      <motion.div
        className="text-slate-300 dark:text-slate-600"
        variants={{
          rest: { color: "#cbd5e1", transform: "translateX(0px) scale(1)" },
          hover: { color: "#f97316", transform: "translateX(2px) scale(1.1)" },
        }}
        transition={GENTLE_SPRING}
      >
        <ArrowRight className="h-4 w-4" />
      </motion.div>
      <motion.div
        className="relative flex h-20 w-16 flex-col gap-1.5 rounded-lg border border-slate-200 bg-white p-2 shadow-md dark:border-slate-700 dark:bg-slate-800"
        variants={{
          rest: { transform: "translateY(0px) rotate(0deg)" },
          hover: { transform: "translateY(-4px) rotate(4deg)" },
        }}
        transition={GENTLE_SPRING}
      >
        <span className="h-2 w-8 rounded-sm bg-slate-800 dark:bg-slate-200" />
        <span className="h-1 w-full rounded-sm bg-slate-200 dark:bg-slate-600" />
        <span className="h-1 w-full rounded-sm bg-slate-200 dark:bg-slate-600" />
        <span className="h-1 w-3/4 rounded-sm bg-slate-200 dark:bg-slate-600" />
        <span className="absolute -bottom-2 -right-2 rounded-md border border-red-200 bg-red-100 p-1 text-red-500 shadow-sm dark:border-red-500/30 dark:bg-red-500/20">
          <FileText className="h-3 w-3" />
        </span>
      </motion.div>
    </div>
  )
}

export function CsvTransformIllustration() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <motion.div
        className="relative flex h-20 w-16 flex-col gap-1.5 rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        variants={{
          rest: { transform: "translateY(0px) rotate(0deg)" },
          hover: { transform: "translateY(-4px) rotate(-4deg)" },
        }}
        transition={GENTLE_SPRING}
      >
        {[0, 1, 2, 3].map((line) => (
          <span key={line} className="h-1 w-full rounded-sm bg-slate-200 dark:bg-slate-600" />
        ))}
        <span className="absolute -bottom-2 -right-2 rounded-md border border-emerald-200 bg-emerald-100 p-1 text-emerald-600 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400">
          <FileText className="h-3 w-3" />
        </span>
      </motion.div>
      <motion.div
        className="text-slate-300 dark:text-slate-600"
        variants={{
          rest: { color: "#cbd5e1", transform: "translateX(0px) scale(1)" },
          hover: { color: "#f97316", transform: "translateX(2px) scale(1.1)" },
        }}
        transition={GENTLE_SPRING}
      >
        <ArrowRight className="h-4 w-4" />
      </motion.div>
      <motion.div
        className="h-20 w-20 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
        variants={{
          rest: { transform: "translateY(0px) rotate(0deg)" },
          hover: { transform: "translateY(-4px) rotate(4deg)" },
        }}
        transition={GENTLE_SPRING}
      >
        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80">
          <span className="border-r border-slate-200 p-2 dark:border-slate-700">
            <span className="block h-1 rounded bg-slate-300 dark:bg-slate-500" />
          </span>
          <span className="p-2">
            <span className="block h-1 w-3/4 rounded bg-slate-300 dark:bg-slate-500" />
          </span>
        </div>
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            className={`grid grid-cols-2 border-b border-slate-100 dark:border-slate-700/50 ${row % 2 ? "bg-slate-50/70 dark:bg-slate-700/20" : ""}`}
          >
            <span className="border-r border-slate-100 p-2 dark:border-slate-700/50">
              <span className="block h-1 rounded bg-slate-200 dark:bg-slate-600" />
            </span>
            <span className="p-2">
              <span className="block h-1 w-4/5 rounded bg-slate-200 dark:bg-slate-600" />
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export function MarkdownCardIllustration() {
  return (
    <div className="relative flex items-center gap-4" aria-hidden="true">
      <motion.div
        className="flex h-36 w-32 flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        variants={{
          rest: { transform: "translateY(0px) rotate(0deg)" },
          hover: { transform: "translateY(-4px) rotate(-2deg)" },
        }}
        transition={GENTLE_SPRING}
      >
        <span className="mb-1 h-2 w-12 rounded-sm bg-slate-300 dark:bg-slate-500" />
        <span className="h-1.5 w-full rounded-sm bg-slate-200 dark:bg-slate-600" />
        <span className="h-1.5 w-4/5 rounded-sm bg-slate-200 dark:bg-slate-600" />
        <span className="mt-1 flex h-10 w-full flex-col gap-1 rounded border border-slate-100 bg-slate-50 p-1 dark:border-slate-700/50 dark:bg-slate-900">
          <span className="h-1 w-2/3 rounded-sm bg-slate-200 dark:bg-slate-600" />
          <span className="h-1 w-1/2 rounded-sm bg-slate-200 dark:bg-slate-600" />
        </span>
      </motion.div>
      <motion.div
        className="absolute -bottom-6 -right-6 z-10 rounded-xl border border-orange-200 bg-orange-100 p-3 text-orange-500 shadow-md dark:border-orange-500/30 dark:bg-orange-500/20"
        variants={{
          rest: { transform: "rotate(0deg) scale(1)" },
          hover: { transform: "rotate(6deg) scale(1.1)" },
        }}
        transition={GENTLE_SPRING}
      >
        <Hash className="h-6 w-6" />
      </motion.div>
    </div>
  )
}

export function CsvCardIllustration() {
  return (
    <div className="relative" aria-hidden="true">
      <motion.div
        className="h-32 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
        variants={{
          rest: { transform: "translateY(0px) scale(1)" },
          hover: { transform: "translateY(-4px) scale(1.02)" },
        }}
        transition={GENTLE_SPRING}
      >
        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80">
          {[0, 1, 2].map((cell) => (
            <span key={cell} className="border-r border-slate-200 p-2 last:border-r-0 dark:border-slate-700">
              <span className="block h-1.5 rounded bg-slate-300 dark:bg-slate-500" />
            </span>
          ))}
        </div>
        {[0, 1, 2, 3].map((row) => (
          <motion.div
            key={row}
            className={`grid grid-cols-3 border-b border-slate-100 dark:border-slate-700/50 ${row % 2 ? "bg-slate-50/70 dark:bg-slate-700/20" : ""}`}
            variants={
              row === 1
                ? {
                    rest: { backgroundColor: "rgba(255,255,255,0)" },
                    hover: { backgroundColor: "rgba(249,115,22,0.1)" },
                  }
                : undefined
            }
            transition={{ duration: 0.18, ease: EASE_OUT }}
          >
            {[0, 1, 2].map((cell) => (
              <span key={cell} className="border-r border-slate-100 p-2 last:border-r-0 dark:border-slate-700/50">
                <span
                  className={`block h-1 rounded bg-slate-200 dark:bg-slate-600 ${cell === 2 ? "w-2/3" : cell === 0 ? "w-5/6" : "w-full"}`}
                />
              </span>
            ))}
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        className="absolute -bottom-4 -right-4 z-10 rounded-lg border border-emerald-200 bg-emerald-100 p-2 text-emerald-600 shadow-md dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400"
        variants={{
          rest: { transform: "translate(0px, 0px) rotate(0deg) scale(1)" },
          hover: { transform: "translate(-4px, -4px) rotate(-8deg) scale(1.1)" },
        }}
        transition={GENTLE_SPRING}
      >
        <FileText className="h-5 w-5" />
      </motion.div>
    </div>
  )
}

export function PasteIllustration() {
  const reduceMotion = useReducedMotion()
  const initial = reduceMotion ? false : { pathLength: 0, opacity: 0 }

  return (
    <div className="flex h-[120px] items-center justify-center" aria-hidden="true">
      <svg aria-hidden="true" width="80" height="100" viewBox="0 0 80 100" fill="none">
        <motion.rect
          x="10"
          y="10"
          width="60"
          height="80"
          rx="4"
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-600"
          strokeWidth="2"
          initial={initial}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: reduceMotion ? 0 : 1, ease: EASE_IN_OUT }}
        />
        {[30, 45, 60, 75].map((y, index) => (
          <motion.line
            key={y}
            x1="20"
            y1={y}
            x2={[60, 45, 55, 35][index]}
            y2={y}
            stroke="#f97316"
            strokeWidth="4"
            strokeLinecap="round"
            strokeOpacity="0.6"
            initial={initial}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: reduceMotion ? 0 : 0.5,
              delay: reduceMotion ? 0 : 0.5 + index * 0.2,
              ease: EASE_OUT,
            }}
          />
        ))}
      </svg>
    </div>
  )
}

export function LayoutIllustration() {
  const reduceMotion = useReducedMotion()

  const loops = [
    { y: 20, x: 30, travel: 20, duration: 3 },
    { y: 40, x: 50, travel: -30, duration: 3.5 },
    { y: 60, x: 40, travel: 20, duration: 2.5 },
  ] as const

  return (
    <div className="flex h-[120px] items-center justify-center" aria-hidden="true">
      <svg aria-hidden="true" width="80" height="80" viewBox="0 0 80 80" fill="none">
        {loops.map((loop) => (
          <g key={loop.y}>
            <line
              x1="10"
              y1={loop.y}
              x2="70"
              y2={loop.y}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-700"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <motion.g
              animate={
                reduceMotion
                  ? undefined
                  : {
                      transform: ["translateX(0px)", `translateX(${loop.travel}px)`, "translateX(0px)"],
                    }
              }
              transition={{ duration: loop.duration, repeat: Number.POSITIVE_INFINITY, ease: EASE_IN_OUT }}
            >
              <circle cx={loop.x} cy={loop.y} r="8" fill="#f97316" />
            </motion.g>
          </g>
        ))}
      </svg>
    </div>
  )
}

export function ExportIllustration() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="flex h-[120px] items-center justify-center" aria-hidden="true">
      <svg aria-hidden="true" width="80" height="100" viewBox="0 0 80 100" fill="none">
        <rect
          x="15"
          y="15"
          width="50"
          height="70"
          rx="4"
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-600"
          strokeWidth="2"
        />
        <motion.g
          initial={reduceMotion ? false : { opacity: 0, transform: "translateY(10px) scale(0.9)" }}
          whileInView={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.3, ease: EASE_OUT }}
          style={{ transformOrigin: "40px 50px" }}
        >
          <rect x="25" y="40" width="30" height="20" rx="2" fill="#f97316" />
          <text
            x="40"
            y="54"
            fontSize="12"
            fontWeight="700"
            fill="currentColor"
            className="text-slate-950 dark:text-[#030712]"
            textAnchor="middle"
          >
            PDF
          </text>
        </motion.g>
      </svg>
    </div>
  )
}

export function PrivacyIllustration() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="relative flex h-28 w-40 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/50 dark:bg-slate-800/50"
      initial={false}
      animate={{ transform: "scale(1)" }}
      whileHover={reduceMotion ? undefined : { transform: "scale(1.05)" }}
      transition={GENTLE_SPRING}
      aria-hidden="true"
    >
      <div className="absolute left-3 top-3 flex gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-slate-600" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-slate-600" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-slate-600" />
      </div>
      <motion.div
        className="rounded-full bg-orange-50 p-3 text-orange-500 dark:bg-orange-500/10"
        initial={false}
        animate={{ transform: "translateY(0px)" }}
        whileHover={reduceMotion ? undefined : { transform: "translateY(-4px)" }}
        transition={GENTLE_SPRING}
      >
        <Lock className="h-7 w-7" />
      </motion.div>
    </motion.div>
  )
}

const PDF_LINES = [1, 0.75, 5 / 6, 1] as const
const PDF_LINE_TARGETS = [0.8, 1, 0.6, 0.9] as const

export function PdfIllustration() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="relative flex h-32 w-24 flex-col gap-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/50"
      initial="rest"
      whileHover={reduceMotion ? "rest" : "hover"}
      aria-hidden="true"
    >
      {PDF_LINES.map((width, index) => (
        <motion.span
          key={`${width}-${index}`}
          className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700"
          style={{ width: `${width * 100}%`, transformOrigin: "left center" }}
          variants={{
            rest: {
              transform: "scaleX(1)",
              transition: { duration: 0.18, delay: 0, ease: EASE_OUT },
            },
            hover: {
              transform: `scaleX(${PDF_LINE_TARGETS[index] / width})`,
              transition: { duration: 0.22, delay: index * 0.04, ease: EASE_OUT },
            },
          }}
        />
      ))}
      <motion.div
        className="absolute -bottom-4 -right-4 rounded-full border border-slate-100 bg-white p-2.5 text-orange-500 shadow-xl dark:border-slate-700 dark:bg-slate-800"
        variants={{
          rest: { transform: "translate(0px, 0px) scale(1)" },
          hover: { transform: "translate(-8px, -8px) scale(1.15)" },
        }}
        transition={GENTLE_SPRING}
      >
        <FileText className="h-6 w-6" />
      </motion.div>
    </motion.div>
  )
}

const CODE_LINE_WIDTHS = [
  ["w-8 bg-orange-500/40", "w-16 bg-slate-300 dark:bg-slate-600"],
  ["w-12 bg-sky-500/40", "w-24 bg-slate-300 dark:bg-slate-600"],
  ["w-16 bg-emerald-500/40"],
  ["w-8 bg-slate-300 dark:bg-slate-600"],
] as const

export function LineNumbersIllustration() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="flex gap-4 font-mono text-sm"
      initial="rest"
      whileHover={reduceMotion ? "rest" : "hover"}
      aria-hidden="true"
    >
      <div className="flex select-none flex-col text-right text-slate-400 opacity-50 dark:text-slate-500">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
      </div>
      <div className="flex flex-col">
        {CODE_LINE_WIDTHS.map((segments, index) => (
          <motion.div
            key={segments.join("-")}
            className="flex gap-2"
            variants={{
              rest: {
                transform: "translateX(0px)",
                transition: { duration: 0.16, delay: 0, ease: EASE_OUT },
              },
              hover: {
                transform: "translateX(4px)",
                transition: { duration: 0.2, delay: index * 0.05, ease: EASE_OUT },
              },
            }}
          >
            {segments.map((segment) => (
              <span key={segment} className={`mt-1.5 h-2 rounded-sm ${segment}`} />
            ))}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

const FEATURED_LANGUAGES = ["Python", "TypeScript", "Rust", "Go", "React", "SQL"] as const

export function LanguagesIllustration() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="flex max-w-[260px] flex-wrap items-center justify-center gap-3" aria-hidden="true">
      {FEATURED_LANGUAGES.map((language) => (
        <motion.span
          key={language}
          className="language-motion-chip rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-700/50 dark:bg-slate-800 dark:text-slate-300"
          initial={false}
          animate={{ transform: "translateY(0px) scale(1)" }}
          whileHover={
            reduceMotion
              ? undefined
              : {
                  transform: "translateY(-4px) scale(1.05)",
                }
          }
          transition={GENTLE_SPRING}
        >
          {language}
        </motion.span>
      ))}
      <span className="rounded-full border border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-slate-500 dark:border-slate-600 dark:text-slate-400">
        + more
      </span>
    </div>
  )
}

export function SpeedIllustration() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="w-fit rounded-2xl bg-orange-50 p-3 text-orange-500 dark:bg-orange-500/10"
      initial={false}
      animate={{ transform: "rotate(0deg) scale(1)" }}
      whileHover={reduceMotion ? undefined : { transform: "rotate(10deg) scale(1.08)" }}
      transition={GENTLE_SPRING}
      aria-hidden="true"
    >
      <Zap className="h-8 w-8" />
    </motion.div>
  )
}

export function ControlsIllustration() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="flex w-full max-w-[220px] flex-col gap-6"
      initial="rest"
      whileHover={reduceMotion ? "rest" : "hover"}
      aria-hidden="true"
    >
      <div className="relative h-2 rounded-full bg-slate-200 dark:bg-slate-700/50">
        <motion.span
          className="absolute -top-1.5 left-[20%] h-5 w-5 rounded-full border-2 border-orange-500 bg-white shadow"
          variants={{
            rest: { transform: "translateX(0%)" },
            hover: { transform: "translateX(640%)" },
          }}
          transition={{ duration: 0.28, ease: EASE_IN_OUT }}
        />
      </div>
      <div className="relative h-2 rounded-full bg-slate-200 dark:bg-slate-700/50">
        <motion.span
          className="absolute -top-1.5 left-[70%] h-5 w-5 rounded-full border-2 border-orange-500 bg-white shadow"
          variants={{
            rest: { transform: "translateX(0%)" },
            hover: { transform: "translateX(-440%)" },
          }}
          transition={{ duration: 0.28, ease: EASE_IN_OUT }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="h-2.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700/50" />
        <motion.span
          className="flex h-7 w-12 items-center rounded-full p-1"
          variants={{ rest: { backgroundColor: "#cbd5e1" }, hover: { backgroundColor: "#f97316" } }}
          transition={{ duration: 0.18, ease: EASE_OUT }}
        >
          <motion.span
            className="h-5 w-5 rounded-full bg-white shadow"
            variants={{ rest: { transform: "translateX(0px)" }, hover: { transform: "translateX(20px)" } }}
            transition={{ duration: 0.24, ease: EASE_IN_OUT }}
          />
        </motion.span>
      </div>
    </motion.div>
  )
}
