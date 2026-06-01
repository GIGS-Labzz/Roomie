export function ProfileCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-5 flex flex-col gap-4 animate-pulse">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-20 h-20 rounded-full bg-slate-200 flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 bg-slate-200 rounded-full w-3/4" />
          <div className="h-3 bg-slate-100 rounded-full w-2/3" />
          <div className="h-3 bg-slate-100 rounded-full w-1/2" />
        </div>
      </div>

      {/* Budget row */}
      <div className="flex items-center justify-between">
        <div className="h-4 bg-slate-200 rounded-full w-2/5" />
        <div className="h-5 bg-slate-100 rounded-full w-1/4" />
      </div>

      {/* Tags */}
      <div className="flex gap-1.5">
        <div className="h-5 bg-slate-100 rounded-full w-16" />
        <div className="h-5 bg-slate-100 rounded-full w-14" />
        <div className="h-5 bg-slate-100 rounded-full w-18" />
      </div>

      {/* Button */}
      <div className="h-9 bg-slate-100 rounded-2xl mt-auto" />
    </div>
  );
}
