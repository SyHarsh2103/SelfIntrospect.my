import Card from "../common/Card";

export default function QuestionCard({ question, value, onSelect }) {
  const selected = value?.selectedOptionIds || [];
  const isMultiple = question?.type === "multiple-choice";

  const handleSelect = (optionId) => {
    if (isMultiple) {
      const next = selected.includes(optionId)
        ? selected.filter((id) => id !== optionId)
        : [...selected, optionId];

      onSelect({ selectedOptionIds: next });
      return;
    }

    onSelect({ selectedOptionIds: [optionId] });
  };

  return (
    <Card className="overflow-hidden">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
        {question?.category || "Question"}
      </p>

      <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-slate-900">
        {question?.questionText}
      </h2>

      {question?.helpText ? (
        <p className="mt-3 text-sm leading-7 text-slate-600">
          {question.helpText}
        </p>
      ) : null}

      <div className="mt-6 grid gap-3">
        {question?.options?.map((option) => {
          const active = selected.includes(option._id);

          return (
            <button
              key={option._id}
              type="button"
              onClick={() => handleSelect(option._id)}
              className={`rounded-2xl border px-5 py-4 text-left text-sm font-semibold leading-7 transition ${
                active
                  ? "border-orange-500 bg-orange-600 text-white shadow-sm"
                  : "border-[#eadfcb] bg-[#fbf7ef] text-slate-700 hover:border-orange-300 hover:bg-orange-50"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {isMultiple ? (
        <p className="mt-4 text-xs text-slate-500">
          You may select more than one option.
        </p>
      ) : null}
    </Card>
  );
}