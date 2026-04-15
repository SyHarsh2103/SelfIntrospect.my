export default function ProgressBar({ value = 0, label = "" }) {
    const safeValue = Math.min(Math.max(value, 0), 100);
  
    return (
      <div className="rounded-2xl border border-[#eadfcb] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-slate-700">{label}</p>
          <p className="text-sm font-semibold text-orange-700">
            {Math.round(safeValue)}%
          </p>
        </div>
  
        <div className="h-3 overflow-hidden rounded-full bg-[#fbf7ef]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-600 to-amber-500 transition-all duration-300"
            style={{ width: `${safeValue}%` }}
          />
        </div>
      </div>
    );
  }