import Card from "../common/Card";

export default function RemedyCard({ remedy }) {
  const steps = Array.isArray(remedy?.steps) ? remedy.steps : [];

  return (
    <Card className="h-full border-[#dfeadf] bg-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Remedy
          </p>
          <h3 className="mt-2 font-serif text-2xl font-bold text-slate-900">
            {remedy?.title || "Supportive remedy"}
          </h3>
        </div>

        {remedy?.duration ? (
          <div className="rounded-2xl bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800">
            {remedy.duration}
          </div>
        ) : null}
      </div>

      {steps.length ? (
        <div className="mt-5 space-y-3">
          {steps.map((step, index) => (
            <div
              key={`${remedy?._id || remedy?.title}-${index}`}
              className="flex items-start gap-3 rounded-2xl bg-[#f7fcf8] px-4 py-4"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                {index + 1}
              </span>
              <p className="text-sm leading-7 text-slate-700">{step}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm leading-7 text-slate-600">
          No detailed steps were added for this remedy yet.
        </p>
      )}

      {remedy?.notes ? (
        <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Notes
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-700">{remedy.notes}</p>
        </div>
      ) : null}
    </Card>
  );
}