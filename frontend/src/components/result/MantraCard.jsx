import Card from "../common/Card";

export default function MantraCard({ mantra }) {
  const chakraName =
    mantra?.chakraId?.displayName ||
    mantra?.chakraId?.name ||
    mantra?.associatedChakra ||
    "Associated chakra";

  return (
    <Card className="h-full border-amber-200 bg-gradient-to-b from-white to-[#fffaf0]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
            Mantra support
          </p>
          <h3 className="mt-2 font-serif text-2xl font-bold text-slate-900">
            {mantra?.title || "Suggested mantra"}
          </h3>
        </div>

        <div className="rounded-2xl bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
          {chakraName}
        </div>
      </div>

      {mantra?.mantraText ? (
        <div className="mt-5 rounded-2xl border border-amber-100 bg-white px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            Mantra text
          </p>
          <p className="mt-3 font-serif text-lg leading-8 text-slate-900">
            {mantra.mantraText}
          </p>
        </div>
      ) : null}

      {mantra?.phoneticText ? (
        <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            Pronunciation
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            {mantra.phoneticText}
          </p>
        </div>
      ) : null}

      <div className="mt-4 grid gap-4">
        {mantra?.usageNotes ? (
          <div className="rounded-2xl bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              When to use
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              {mantra.usageNotes}
            </p>
          </div>
        ) : null}

        {mantra?.repetitions ? (
          <div className="rounded-2xl bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Repetition guidance
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              {mantra.repetitions}
            </p>
          </div>
        ) : null}
      </div>
    </Card>
  );
}