"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Lock } from "lucide-react"

const PAPER_LINES = ["w-3/4", "w-full", "w-full", "w-5/6"] as const
const EASE_OUT = [0.23, 1, 0.32, 1] as const

export function CliHeroIllustration() {
  const reduceMotion = useReducedMotion()

  return (
    <div
      className="relative flex h-[390px] items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 px-5 dark:border-slate-800 dark:bg-[#030712] sm:px-8"
      role="img"
      aria-label="A terminal command preparing a document and sending it to a local printer"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, transform: "translateX(-20px)" }}
        animate={{ opacity: 1, transform: "translateX(0px)" }}
        transition={{ duration: reduceMotion ? 0 : 0.8, ease: EASE_OUT }}
        className="relative z-10 w-[62%] max-w-80 overflow-hidden rounded-xl border border-slate-700 bg-[#1e1e1e] shadow-[0_8px_0_#020617]"
      >
        <div className="flex gap-2 border-b border-slate-700 bg-[#2d2d2d] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
        </div>
        <div className="min-h-48 p-5 font-mono text-[11px] leading-relaxed text-slate-300 sm:text-xs">
          <p>
            <span className="text-green-400">~</span>$ codeprint print docs/arch.md
          </p>
          <motion.p
            className="mt-4 text-slate-400"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.24, delay: reduceMotion ? 0 : 1, ease: EASE_OUT }}
          >
            Prepared arch.pdf for Office_Printer
          </motion.p>
          <motion.p
            className="mt-4 text-orange-400"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.24, delay: reduceMotion ? 0 : 2, ease: EASE_OUT }}
          >
            Print 1 copy, A4, one-sided, auto, all pages? [y/N]
          </motion.p>
          <motion.p
            className="mt-2 text-white"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, delay: reduceMotion ? 0 : 3, ease: EASE_OUT }}
          >
            y
          </motion.p>
        </div>
      </motion.div>

      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full text-slate-300 dark:text-slate-700"
        viewBox="0 0 560 390"
      >
        <motion.path
          d="M292 172 C365 172 360 230 428 230"
          fill="none"
          stroke="currentColor"
          strokeDasharray="5 7"
          strokeWidth="2"
          initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 1.5, delay: reduceMotion ? 0 : 1, ease: EASE_OUT }}
        />
      </svg>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, transform: "translateX(20px) translateY(-50%)" }}
        animate={{ opacity: 1, transform: "translateX(0px) translateY(-50%)" }}
        transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.5, ease: EASE_OUT }}
        className="absolute right-4 top-1/2 z-20 flex h-28 w-[34%] max-w-44 flex-col items-center justify-end rounded-xl border border-slate-200 bg-white pb-4 shadow-[0_7px_0_#cbd5e1] dark:border-slate-700 dark:bg-slate-800 dark:shadow-[0_7px_0_#0f172a] sm:right-8"
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, transform: "translateY(0px) scaleY(0.04)" }}
          animate={{ opacity: 1, transform: "translateY(-48px) scaleY(1)" }}
          transition={{ duration: reduceMotion ? 0 : 1.2, delay: reduceMotion ? 0 : 3.8, ease: EASE_OUT }}
          className="absolute top-0 -z-10 flex h-24 w-20 origin-bottom flex-col border border-slate-200 bg-white p-3 shadow-sm"
        >
          {PAPER_LINES.map((width, index) => (
            <span key={`${width}-${index}`} className={`${width} mb-2 h-1 rounded-full bg-slate-200`} />
          ))}
        </motion.div>
        <div className="mb-4 h-3 w-3/4 rounded-full bg-slate-100 dark:bg-slate-950" />
        <div className="flex gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500 motion-reduce:animate-none" />
          <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>
      </motion.div>
    </div>
  )
}

export function McpHeroIllustration() {
  const reduceMotion = useReducedMotion()

  return (
    <div
      className="relative mx-auto h-[360px] w-full max-w-xl"
      role="img"
      aria-label="A stack of AI documents becoming one print-ready page"
      style={{ perspective: "1000px" }}
    >
      {[0, 1, 2, 3, 4].map((index) => {
        const offset = index - 2
        const targetScale = 1 - (4 - index) * 0.05
        const targetOpacity = 1 - (4 - index) * 0.15

        return (
          <motion.div
            key={index}
            className="absolute left-1/2 top-1/2 flex h-64 w-48 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:h-72 sm:w-56"
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    transform: `translate(-50%, -50%) translateY(-20px) rotateX(60deg) rotateZ(${offset * 5}deg) scale(${targetScale})`,
                  }
            }
            animate={{
              opacity: targetOpacity,
              transform: `translate(-50%, -50%) translateY(${offset * 6}px) rotateX(10deg) rotateZ(${offset * 4}deg) scale(${targetScale})`,
            }}
            transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : index * 0.1, ease: EASE_OUT }}
            style={{ zIndex: index, transformStyle: "preserve-3d" }}
          >
            <span className="mb-4 h-3 w-3/4 rounded-full bg-slate-200 dark:bg-slate-600" />
            {PAPER_LINES.map((width, line) => (
              <span
                key={`${width}-${line}`}
                className={`${width} mb-2 h-2 rounded-full bg-slate-100 dark:bg-slate-700`}
              />
            ))}
            <span className="mb-3 mt-4 h-2.5 w-1/2 rounded-full bg-slate-200 dark:bg-slate-600" />
            {PAPER_LINES.slice(0, 3).map((width, line) => (
              <span
                key={`second-${width}-${line}`}
                className={`${width} mb-2 h-2 rounded-full bg-slate-100 dark:bg-slate-700`}
              />
            ))}
          </motion.div>
        )
      })}

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, transform: "translate(-50%, -50%) translateY(100px)" }}
        animate={{ opacity: 1, transform: "translate(-50%, -50%) translateY(-40px)" }}
        transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.8, ease: EASE_OUT }}
        className="absolute left-1/2 top-1/2 z-20 flex h-64 w-48 flex-col overflow-hidden rounded-xl border-2 border-orange-500 bg-white p-5 shadow-[0_8px_0_#c2410c] dark:bg-slate-900 sm:h-72 sm:w-56"
      >
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={reduceMotion ? undefined : { transform: ["translateY(-100%)", "translateY(550%)"] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-orange-400/20 to-transparent"
        />
        <span className="mb-4 h-3 w-3/4 rounded-full bg-slate-800 dark:bg-slate-200" />
        {PAPER_LINES.map((width, index) => (
          <span key={`${width}-${index}`} className={`${width} mb-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600`} />
        ))}
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-[9px] leading-relaxed text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <span className="text-orange-500">create_printable_pdf</span>
          <br />
          saved locally
        </div>
      </motion.div>
    </div>
  )
}

export function PrivacyOrbit() {
  const reduceMotion = useReducedMotion()

  return (
    <div
      className="relative flex h-48 w-48 shrink-0 items-center justify-center rounded-full border-4 border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
      role="img"
      aria-label="Local-only processing protected by a privacy boundary"
    >
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent"
        animate={reduceMotion ? undefined : { transform: "rotate(360deg)" }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />
      <Lock className="h-12 w-12 text-slate-500 dark:text-slate-400" />
    </div>
  )
}
