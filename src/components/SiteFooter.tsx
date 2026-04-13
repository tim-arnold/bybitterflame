export function SiteFooter() {
  return (
    <footer className="relative z-10 flex flex-col items-center gap-3 py-10">
      <p className="text-xs text-stone-400 text-center">
        © 2025–{new Date().getFullYear()} Tim Arnold
      </p>
    </footer>
  );
}