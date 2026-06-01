// Phase 9 — Full marketing SPA built here
// Placeholder for Phase 1 scaffold

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-sage-surface">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-display font-semibold text-slate-900">Roomie</h1>
        <p className="text-xl text-slate-600">Connect and Cooonnectttt</p>
        <a
          href={process.env.NEXT_PUBLIC_APP_URL ?? "#"}
          className="inline-block mt-4 px-8 py-4 bg-peach-200 text-slate-900 font-semibold rounded-2xl hover:bg-peach-300 transition-colors"
        >
          Find my roommate
        </a>
      </div>
      <footer className="absolute bottom-6 text-xs text-slate-400">
        &copy; 2026 Roomie &bull; A{" "}
        <a
          href="https://gigsrentals.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-brand-500 transition-colors"
        >
          GIGSRentals
        </a>{" "}
        Product
      </footer>
    </main>
  );
}
