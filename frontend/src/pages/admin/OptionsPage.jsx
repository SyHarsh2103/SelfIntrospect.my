import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  ListChecks,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { adminApi } from "../../services/api";

const chakraTemplate = {
  mooladhara: 0,
  swadhisthana: 0,
  nabhi: 0,
  void: 0,
  heart: 0,
  vishuddhi: 0,
  agnya: 0,
  sahasrara: 0,
};

const nadiTemplate = {
  leftNadi: 0,
  rightNadi: 0,
  centerNadi: 0,
};

const chakraScoreFields = [
  { key: "mooladhara", label: "Mooladhara" },
  { key: "swadhisthana", label: "Swadhisthana" },
  { key: "nabhi", label: "Nabhi" },
  { key: "void", label: "Void" },
  { key: "heart", label: "Heart" },
  { key: "vishuddhi", label: "Vishuddhi" },
  { key: "agnya", label: "Agnya" },
  { key: "sahasrara", label: "Sahasrara" },
];

const nadiScoreFields = [
  { key: "leftNadi", label: "Left Nadi" },
  { key: "rightNadi", label: "Right Nadi" },
  { key: "centerNadi", label: "Center Nadi" },
];

const defaultOptionForm = {
  questionId: "",
  label: "",
  value: "",
  sortOrder: 0,
  description: "",
  explanation: "",
  reflection: "",
  isNeutral: false,
  multiplierValue: 1,
  chakraScores: { ...chakraTemplate },
  nadiScores: { ...nadiTemplate },
};

const normalizeScores = (value, fallback) => ({
  ...fallback,
  ...(value && typeof value === "object" ? value : {}),
});

function ScoreFields({ title, fields, scores, onChange }) {
  const presets = [
    { label: "No", value: 0 },
    { label: "Mild", value: 1 },
    { label: "Moderate", value: 2 },
    { label: "Strong", value: 3 },
  ];

  const getHint = (value) => {
    const score = Number(value || 0);

    if (score === 0) return "No effect";
    if (score > 0 && score <= 1) return "Mild signal";
    if (score > 1 && score <= 2) return "Moderate signal";
    if (score > 2) return "Strong signal";

    return "No effect";
  };

  const getHintClass = (value) => {
    const score = Number(value || 0);

    if (score === 0) return "bg-slate-100 text-slate-500";
    if (score > 0 && score <= 1) return "bg-emerald-50 text-emerald-700";
    if (score > 1 && score <= 2) return "bg-amber-50 text-amber-700";
    if (score > 2) return "bg-orange-50 text-orange-700";

    return "bg-slate-100 text-slate-500";
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {title}
      </label>

      <div className="mb-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-6 text-blue-800">
        <strong>Scoring guide:</strong> 0 = no effect, 1 = mild, 2 = moderate,
        3+ = strong. Use higher values only when this option clearly points to
        that chakra or nadi.
      </div>

      <div className="grid gap-3 rounded-2xl border border-[#eadfcb] bg-[#fbf7ef] p-4 sm:grid-cols-2">
        {fields.map((field) => {
          const value = scores?.[field.key] ?? 0;

          return (
            <div key={field.key} className="rounded-xl bg-white p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <label className="block text-xs font-semibold text-slate-600">
                  {field.label}
                </label>

                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getHintClass(
                    value
                  )}`}
                >
                  {getHint(value)}
                </span>
              </div>

              <div className="mb-2 flex flex-wrap gap-1.5">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => onChange(field.key, preset.value)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                      Number(value) === preset.value
                        ? "bg-orange-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-700"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <input
                type="number"
                min="0"
                step="0.5"
                value={value}
                onChange={(event) =>
                  onChange(field.key, Number(event.target.value || 0))
                }
                className="w-full rounded-xl border border-[#eadfcb] bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OptionForm({
  optionForm,
  setOptionForm,
  questions,
  onSubmit,
  saving,
  editingOption,
  onCancel,
}) {
  return (
    <Card>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
            Option Editor
          </p>
          <h3 className="mt-2 font-serif text-2xl font-bold text-slate-900">
            {editingOption ? "Edit Option" : "Create Option"}
          </h3>
        </div>

        {editingOption ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Select Question
            </label>
            <select
              value={optionForm.questionId}
              onChange={(event) =>
                setOptionForm((prev) => ({
                  ...prev,
                  questionId: event.target.value,
                }))
              }
              required
              className="w-full rounded-2xl border border-[#eadfcb] bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            >
              <option value="">Select question for this option</option>
              {questions.map((question) => (
                <option key={question._id} value={question._id}>
                  {question.sortOrder ? `${question.sortOrder}. ` : ""}
                  {question.questionText}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Select the question where this answer option should appear.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Label
            </label>
            <input
              value={optionForm.label}
              onChange={(event) =>
                setOptionForm((prev) => ({
                  ...prev,
                  label: event.target.value,
                }))
              }
              required
              className="w-full rounded-2xl border border-[#eadfcb] bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              placeholder="Visible option text"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Internal Value
            </label>
            <input
              value={optionForm.value}
              onChange={(event) =>
                setOptionForm((prev) => ({
                  ...prev,
                  value: event.target.value,
                }))
              }
              required
              className="w-full rounded-2xl border border-[#eadfcb] bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              placeholder="internal_value"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Sort Order
            </label>
            <input
              type="number"
              value={optionForm.sortOrder}
              onChange={(event) =>
                setOptionForm((prev) => ({
                  ...prev,
                  sortOrder: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-[#eadfcb] bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Multiplier Value
            </label>
            <input
              type="number"
              min="0"
              step="0.25"
              value={optionForm.multiplierValue}
              onChange={(event) =>
                setOptionForm((prev) => ({
                  ...prev,
                  multiplierValue: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-[#eadfcb] bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <div className="flex items-end">
            <label className="flex w-full items-center gap-3 rounded-2xl border border-[#eadfcb] bg-[#fbf7ef] px-4 py-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={optionForm.isNeutral}
                onChange={(event) =>
                  setOptionForm((prev) => ({
                    ...prev,
                    isNeutral: event.target.checked,
                  }))
                }
                className="h-4 w-4 accent-orange-600"
              />
              Neutral Option
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Admin Description / Fallback Text
            </label>
            <textarea
              rows={3}
              value={optionForm.description}
              onChange={(event) =>
                setOptionForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-[#eadfcb] bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              placeholder="Optional admin note or fallback result text"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Result Page Explanation
            </label>
            <textarea
              rows={5}
              value={optionForm.explanation}
              onChange={(event) =>
                setOptionForm((prev) => ({
                  ...prev,
                  explanation: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-[#eadfcb] bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              placeholder="Main user-facing explanation shown under this selected answer on the Result Page."
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Gentle Reflection Text
            </label>
            <textarea
              rows={5}
              value={optionForm.reflection}
              onChange={(event) =>
                setOptionForm((prev) => ({
                  ...prev,
                  reflection: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-[#eadfcb] bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              placeholder="Optional softer spiritual wording. Used if explanation is empty."
            />
          </div>

          <div className="md:col-span-2">
            <ScoreFields
              title="Chakra Scores"
              fields={chakraScoreFields}
              scores={optionForm.chakraScores}
              onChange={(key, value) =>
                setOptionForm((prev) => ({
                  ...prev,
                  chakraScores: {
                    ...prev.chakraScores,
                    [key]: value,
                  },
                }))
              }
            />
          </div>

          <div className="md:col-span-2">
            <ScoreFields
              title="Nadi Scores"
              fields={nadiScoreFields}
              scores={optionForm.nadiScores}
              onChange={(key, value) =>
                setOptionForm((prev) => ({
                  ...prev,
                  nadiScores: {
                    ...prev.nadiScores,
                    [key]: value,
                  },
                }))
              }
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-[#eadfcb] pt-5">
          <Button type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : editingOption
                ? "Update Option"
                : "Create Option"}
          </Button>

          {editingOption ? (
            <Button type="button" variant="soft" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
    </Card>
  );
}

export default function OptionsPage() {
  const [options, setOptions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [editingOption, setEditingOption] = useState(null);
  const [optionForm, setOptionForm] = useState(defaultOptionForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const sortedOptions = useMemo(() => {
    return [...options].sort((a, b) => {
      const qA = Number(a.questionSortOrder || 0);
      const qB = Number(b.questionSortOrder || 0);

      if (qA !== qB) return qA - qB;

      return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
    });
  }, [options]);

  const sortedQuestions = useMemo(() => {
    return [...questions].sort(
      (a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0)
    );
  }, [questions]);

  const resetForm = () => {
    setEditingOption(null);
    setOptionForm({
      ...defaultOptionForm,
      chakraScores: { ...chakraTemplate },
      nadiScores: { ...nadiTemplate },
    });
  };

  const loadOptions = async () => {
    try {
      setLoading(true);
      setMessage("");

      const [optionData, questionData] = await Promise.all([
        adminApi.getOptions(),
        adminApi.getQuestions(),
      ]);

      setOptions(Array.isArray(optionData) ? optionData : []);
      setQuestions(Array.isArray(questionData) ? questionData : []);
    } catch (error) {
      setMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load options."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  const startEditOption = (option) => {
    setEditingOption(option);
    setOptionForm({
      questionId: option.questionId || "",
      label: option.label || "",
      value: option.value || "",
      sortOrder: option.sortOrder ?? 0,
      description: option.description || "",
      explanation: option.explanation || "",
      reflection: option.reflection || "",
      isNeutral: Boolean(option.isNeutral),
      multiplierValue: option.multiplierValue ?? 1,
      chakraScores: normalizeScores(option.chakraScores, chakraTemplate),
      nadiScores: normalizeScores(option.nadiScores, nadiTemplate),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!optionForm.questionId) {
      setMessage("Please select a question for this option.");
      return;
    }

    if (!optionForm.label.trim()) {
      setMessage("Option label is required.");
      return;
    }

    if (!optionForm.value.trim()) {
      setMessage("Internal value is required.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const payload = {
        questionId: optionForm.questionId,
        label: optionForm.label.trim(),
        value: optionForm.value.trim(),
        sortOrder: Number(optionForm.sortOrder || 0),
        description: optionForm.description.trim(),
        explanation: optionForm.explanation.trim(),
        reflection: optionForm.reflection.trim(),
        isNeutral: Boolean(optionForm.isNeutral),
        multiplierValue: Number(optionForm.multiplierValue || 1),
        chakraScores: optionForm.chakraScores,
        nadiScores: optionForm.nadiScores,
      };

      if (editingOption) {
        await adminApi.updateOption(editingOption._id, payload);
        setMessage("Option updated successfully.");
      } else {
        await adminApi.createOption(payload);
        setMessage("Option created successfully.");
      }

      resetForm();
      await loadOptions();
    } catch (error) {
      setMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save option."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (option) => {
    const confirmed = window.confirm("Delete this option?");
    if (!confirmed) return;

    try {
      await adminApi.deleteOption(option._id);
      setMessage("Option deleted successfully.");

      if (editingOption?._id === option._id) {
        resetForm();
      }

      await loadOptions();
    } catch (error) {
      setMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete option."
      );
    }
  };

  return (
    <AdminLayout title="Options Manager">
      <div className="space-y-6">
        <Card>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
                Answer Options
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold text-slate-900">
                Manage Option Scoring & Result Reflection
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                Create and edit answer options by selecting the related question
                from a dropdown. Chakra and nadi scores can be managed with
                simple buttons and number inputs.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadOptions}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>

          {message ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </div>
          ) : null}
        </Card>

        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0 space-y-6">
            <OptionForm
              optionForm={optionForm}
              setOptionForm={setOptionForm}
              questions={sortedQuestions}
              onSubmit={handleSubmit}
              saving={saving}
              editingOption={editingOption}
              onCancel={resetForm}
            />
          </div>

          <div className="space-y-6">
            <Card className="2xl:sticky 2xl:top-24">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-orange-50 p-3 text-orange-700">
                  <ListChecks size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    Existing Options
                  </h3>
                  <p className="text-sm text-slate-500">
                    {sortedOptions.length} option
                    {sortedOptions.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              {loading ? (
                <p className="text-sm text-slate-500">Loading options...</p>
              ) : sortedOptions.length === 0 ? (
                <p className="text-sm text-slate-500">No options found.</p>
              ) : (
                <div className="max-h-[78vh] space-y-3 overflow-auto pr-1">
                  {sortedOptions.map((option) => (
                    <div
                      key={option._id}
                      className="rounded-2xl border border-[#eadfcb] bg-[#fbf7ef] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-orange-700">
                              Q {option.questionSortOrder ?? "—"}
                            </span>
                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                              Order {option.sortOrder ?? 0}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              {option.isNeutral ? "Neutral" : "Scored"}
                            </span>
                          </div>

                          <p className="mt-3 font-semibold text-slate-900">
                            {option.label}
                          </p>

                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                            {option.value}
                          </p>

                          {option.questionText ? (
                            <p className="mt-3 line-clamp-2 text-xs leading-6 text-slate-500">
                              {option.questionText}
                            </p>
                          ) : null}

                          {option.explanation ? (
                            <p className="mt-3 line-clamp-3 rounded-xl bg-white px-3 py-2 text-xs leading-6 text-slate-600">
                              {option.explanation}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => startEditOption(option)}
                            className="rounded-xl bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-100"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(option)}
                            className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}