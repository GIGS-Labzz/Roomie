// Implemented in Phase 8 — provider login

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-3xl p-8 shadow-lg text-center space-y-4 max-w-sm w-full mx-4">
        <h1 className="text-2xl font-display font-semibold text-slate-900">Roomie Admin</h1>
        <p className="text-slate-500 text-sm">Provider login — wired in Phase 8</p>
        <footer className="pt-4 text-xs text-slate-400">
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
      </div>
    </div>
  );
}
