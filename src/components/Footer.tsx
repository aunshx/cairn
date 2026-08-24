export function Footer() {
  return (
    <footer className="mt-4 border-t border-rule/60">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-6 sm:px-6">
        <span className="font-mono text-[10px] tracking-[0.12em] text-dim uppercase">
          Developed at the Rock Bottom
        </span>
        <span aria-hidden="true" className="text-dim/60">
          ·
        </span>
        <span className="font-mono text-[10px] tracking-[0.12em] text-muted uppercase">
          &copy; 8W Research
        </span>
      </div>
    </footer>
  )
}
