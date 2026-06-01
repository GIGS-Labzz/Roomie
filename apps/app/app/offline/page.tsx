// Served by service worker when network is unavailable

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-sage-surface text-center px-4">
      <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center mb-6">
        {/* offline.json Lottie wired in Phase 9 */}
        <svg className="w-10 h-10 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 0a5.002 5.002 0 001.414 2.83M8.464 8.464A5 5 0 006.343 13M3 3l18 18" />
        </svg>
      </div>
      <h1 className="text-2xl font-display font-semibold text-slate-900 mb-2">You're offline</h1>
      <p className="text-slate-500 text-sm max-w-xs">
        Check your internet connection. Your cached profiles are still available below.
      </p>
      <a href="/discover" className="mt-6 px-6 py-3 bg-brand-500 text-white font-semibold rounded-2xl">
        View cached feed
      </a>
    </div>
  );
}
