export function EditorWindowBar({ filename, mode }: { filename: string; mode: string }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-white/[0.06] dark:bg-white/[0.01]">
      <div className="flex shrink-0 gap-2" aria-hidden="true">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <span className="h-3 w-3 rounded-full bg-green-500/80" />
      </div>
      <span
        className="min-w-0 truncate text-center font-mono text-xs text-slate-500 dark:text-slate-400"
        title={filename}
      >
        {filename}
      </span>
      <span className="whitespace-nowrap rounded border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-orange-500/80">
        {mode}
      </span>
    </div>
  )
}
