export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4">
        <p>© {new Date().getFullYear()} Leegality Store — Frontend Engineer Assessment.</p>
      </div>
    </footer>
  )
}
