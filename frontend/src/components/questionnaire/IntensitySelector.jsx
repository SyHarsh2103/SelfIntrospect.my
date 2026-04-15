import Card from "../common/Card";

const levels = [
  { value: 1, label: "Very mild" },
  { value: 2, label: "Mild" },
  { value: 3, label: "Moderate" },
  { value: 4, label: "Strong" },
  { value: 5, label: "Very strong" },
];

export default function IntensitySelector({ question, value, onSelect }) {
  const selected = value?.intensityLevel;

  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
        Intensity
      </p>

      <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-slate-900">
        {question?.questionText}
      </h2>

      {question?.helpText ? (
        <p className="mt-3 text-sm leading-7 text-slate-600">
          {question.helpText}
        </p>
      ) : null}

      <div className="mt-7 grid gap-3 sm:grid-cols-5">
        {levels.map((level) => {
          const active = selected === level.value;

          return (
            <button
              key={level.value}
              type="button"
              onClick={() => onSelect({ intensityLevel: level.value })}
              className={`rounded-2xl border px-4 py-5 text-center transition ${
                active
                  ? "border-orange-500 bg-orange-600 text-white shadow-sm"
                  : "border-[#eadfcb] bg-[#fbf7ef] text-slate-700 hover:bg-orange-50"
              }`}
            >
              <span className="block font-serif text-3xl font-bold">
                {level.value}
              </span>
              <span className="mt-2 block text-xs font-semibold">
                {level.label}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}