import { useEffect, useMemo, useState } from "react";
import {
  CirclePlus,
  Edit3,
  Eye,
  EyeOff,
  FileQuestion,
  ListChecks,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { adminApi } from "../../services/api";

const categoryOptions = [
  "vibration",
  "emotional",
  "mental",
  "meditation",
  "life-area",
  "physical",
  "spiritual",
  "channel-tendency",
  "joy",
  "profile",
  "general",
];

const typeOptions = ["single-choice", "multiple-choice", "intensity"];

const templateOptions = [
  { value: "new_seeker_basic", label: "New Seeker Basic" },
  { value: "beginner_sahajayogi", label: "Beginner Sahajayogi" },
  { value: "regular_sahajayogi", label: "Regular Sahajayogi" },
  { value: "advanced_vibration_guidance", label: "Advanced Vibration Guidance" },
];

const audienceOptions = [
  { value: "newSeeker", label: "New Seeker" },
  { value: "beginner", label: "Beginner Sahajayogi" },
  { value: "regular", label: "Regular Sahajayogi" },
  { value: "advanced", label: "Advanced Sahajayogi" },
];

const difficultyOptions = ["basic", "intermediate", "advanced"];

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

const defaultQuestionForm = {
  questionText: "",
  category: "",
  type: "",
  helpText: "",
  sortOrder: 0,
  isActive: true,
  templateKeys: ["regular_sahajayogi"],
  audienceTypes: ["regular"],
  difficultyLevel: "intermediate",
};

const defaultOptionForm = {
  label: "",
  value: "",
  sortOrder: 0,
  description: "",
  isNeutral: false,
  chakraScores: chakraTemplate,
  nadiScores: nadiTemplate,
};

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeScores = (value, fallback) => ({
  ...fallback,
  ...(value && typeof value === "object" ? value : {}),
});

function MultiSelectCheckboxes({ label, options, selected, onChange }) {
  const selectedValues = asArray(selected);

  const toggle = (value) => {
    const next = selectedValues.includes(value)
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value];

    onChange(next);
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="grid gap-2 rounded-2xl border border-[#eadfcb] bg-[#fbf7ef] p-3 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700"
          >
            <input
              type="checkbox"
              checked={selectedValues.includes(option.value)}
              onChange={() => toggle(option.value)}
              className="h-4 w-4 accent-orange-600"
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}

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
                onChange={(e) =>
                  onChange(field.key, Number(e.target.value || 0))
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

function QuestionForm({ form, setForm, onSubmit, saving, editing, onCancel }) {
  return (
    <Card>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
            Question Editor
          </p>
          <h3 className="mt-2 font-serif text-2xl font-bold text-slate-900">
            {editing ? "Edit Question" : "Create Question"}
          </h3>
        </div>

        {editing ? (
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
              Question Text
            </label>
            <textarea
              rows={4}
              value={form.questionText}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, questionText: e.target.value }))
              }
              required
              className="w-full rounded-2xl border border-[#eadfcb] bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              placeholder="Enter the full question text"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, category: e.target.value }))
              }
              required
              className="w-full rounded-2xl border border-[#eadfcb] bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            >
              <option value="">Select category</option>
              {categoryOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Type
            </label>
            <select
              value={form.type}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, type: e.target.value }))
              }
              required
              className="w-full rounded-2xl border border-[#eadfcb] bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            >
              <option value="">Select type</option>
              {typeOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <MultiSelectCheckboxes
              label="Question Templates"
              options={templateOptions}
              selected={form.templateKeys}
              onChange={(next) =>
                setForm((prev) => ({ ...prev, templateKeys: next }))
              }
            />
          </div>

          <div className="md:col-span-2">
            <MultiSelectCheckboxes
              label="Audience Types"
              options={audienceOptions}
              selected={form.audienceTypes}
              onChange={(next) =>
                setForm((prev) => ({ ...prev, audienceTypes: next }))
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Difficulty Level
            </label>
            <select
              value={form.difficultyLevel}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  difficultyLevel: e.target.value,
                }))
              }
              required
              className="w-full rounded-2xl border border-[#eadfcb] bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            >
              {difficultyOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Sort Order
            </label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, sortOrder: e.target.value }))
              }
              required
              className="w-full rounded-2xl border border-[#eadfcb] bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <div className="flex items-end">
            <label className="flex w-full items-center gap-3 rounded-2xl border border-[#eadfcb] bg-[#fbf7ef] px-4 py-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                }
                className="h-4 w-4 accent-orange-600"
              />
              Active Question
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Help Text
            </label>
            <textarea
              rows={3}
              value={form.helpText}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, helpText: e.target.value }))
              }
              className="w-full rounded-2xl border border-[#eadfcb] bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              placeholder="Optional helper note shown under the question"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-[#eadfcb] pt-5">
          <Button type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : editing
                ? "Update Question"
                : "Create Question"}
          </Button>

          {editing ? (
            <Button type="button" variant="soft" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
    </Card>
  );
}

function OptionForm({
  optionForm,
  setOptionForm,
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
            {editingOption ? "Edit Option" : "Add Option"}
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
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Label
            </label>
            <input
              value={optionForm.label}
              onChange={(e) =>
                setOptionForm((prev) => ({ ...prev, label: e.target.value }))
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
              onChange={(e) =>
                setOptionForm((prev) => ({ ...prev, value: e.target.value }))
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
              onChange={(e) =>
                setOptionForm((prev) => ({
                  ...prev,
                  sortOrder: e.target.value,
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
                onChange={(e) =>
                  setOptionForm((prev) => ({
                    ...prev,
                    isNeutral: e.target.checked,
                  }))
                }
                className="h-4 w-4 accent-orange-600"
              />
              Neutral Option
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Admin Description
            </label>
            <textarea
              rows={3}
              value={optionForm.description}
              onChange={(e) =>
                setOptionForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full rounded-2xl border border-[#eadfcb] bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              placeholder="Optional internal note"
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

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingOption, setEditingOption] = useState(null);
  const [templateFilter, setTemplateFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [questionSaving, setQuestionSaving] = useState(false);
  const [optionSaving, setOptionSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [questionForm, setQuestionForm] = useState(defaultQuestionForm);
  const [optionForm, setOptionForm] = useState(defaultOptionForm);

  const displayQuestions = useMemo(() => {
    if (templateFilter === "all") return questions;

    return questions.filter((question) =>
      question.templateKeys?.includes(templateFilter)
    );
  }, [questions, templateFilter]);

  const selectedQuestion = useMemo(
    () => questions.find((item) => item._id === selectedQuestionId),
    [questions, selectedQuestionId]
  );

  const selectedOptions = useMemo(
    () =>
      options
        .filter((item) => String(item.questionId) === String(selectedQuestionId))
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [options, selectedQuestionId]
  );

  const resetQuestionForm = () => {
    setEditingQuestion(null);
    setQuestionForm(defaultQuestionForm);
  };

  const resetOptionForm = () => {
    setEditingOption(null);
    setOptionForm({
      ...defaultOptionForm,
      chakraScores: { ...chakraTemplate },
      nadiScores: { ...nadiTemplate },
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setMessage("");

      const [questionData, optionData] = await Promise.all([
        adminApi.getQuestions(),
        adminApi.getOptions(),
      ]);

      const questionList = Array.isArray(questionData) ? questionData : [];
      const optionList = Array.isArray(optionData) ? optionData : [];

      setQuestions(questionList);
      setOptions(optionList);

      if (!selectedQuestionId && questionList.length) {
        setSelectedQuestionId(questionList[0]._id);
      }
    } catch (err) {
      setMessage(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load question manager data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const startEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionForm({
      questionText: question.questionText || "",
      category: question.category || "",
      type: question.type || "",
      helpText: question.helpText || "",
      sortOrder: question.sortOrder ?? 0,
      isActive: Boolean(question.isActive),
      templateKeys: question.templateKeys?.length
        ? question.templateKeys
        : ["regular_sahajayogi"],
      audienceTypes: question.audienceTypes?.length
        ? question.audienceTypes
        : ["regular"],
      difficultyLevel: question.difficultyLevel || "intermediate",
    });
  };

  const startEditOption = (option) => {
    setEditingOption(option);
    setOptionForm({
      label: option.label || "",
      value: option.value || "",
      sortOrder: option.sortOrder ?? 0,
      description: option.description || "",
      isNeutral: Boolean(option.isNeutral),
      chakraScores: normalizeScores(option.chakraScores, chakraTemplate),
      nadiScores: normalizeScores(option.nadiScores, nadiTemplate),
    });
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    setQuestionSaving(true);
    setMessage("");

    try {
      const templateKeys = asArray(questionForm.templateKeys);
      const audienceTypes = asArray(questionForm.audienceTypes);

      if (!templateKeys.length) {
        setMessage("Please select at least one questionnaire template.");
        return;
      }

      if (!audienceTypes.length) {
        setMessage("Please select at least one audience type.");
        return;
      }

      const payload = {
        ...questionForm,
        templateKeys,
        audienceTypes,
        difficultyLevel: questionForm.difficultyLevel || "intermediate",
        sortOrder: Number(questionForm.sortOrder || 0),
      };

      if (editingQuestion) {
        await adminApi.updateQuestion(editingQuestion._id, payload);
        setMessage("Question updated successfully.");
      } else {
        await adminApi.createQuestion(payload);
        setMessage("Question created successfully.");
      }

      resetQuestionForm();
      await loadData();
    } catch (err) {
      setMessage(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save question."
      );
    } finally {
      setQuestionSaving(false);
    }
  };

  const handleQuestionDelete = async (question) => {
    const confirmed = window.confirm(
      "Delete this question and its related options?"
    );
    if (!confirmed) return;

    try {
      await adminApi.deleteQuestion(question._id);
      setMessage("Question deleted successfully.");

      if (selectedQuestionId === question._id) {
        setSelectedQuestionId("");
      }

      await loadData();
    } catch (err) {
      setMessage(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete question."
      );
    }
  };

  const handleOptionSubmit = async (e) => {
    e.preventDefault();

    if (!selectedQuestionId) {
      setMessage("Please select a question first.");
      return;
    }

    setOptionSaving(true);
    setMessage("");

    try {
      const payload = {
        questionId: selectedQuestionId,
        label: optionForm.label,
        value: optionForm.value,
        sortOrder: Number(optionForm.sortOrder || 0),
        description: optionForm.description,
        isNeutral: Boolean(optionForm.isNeutral),
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

      resetOptionForm();
      await loadData();
    } catch (err) {
      setMessage(
        err?.response?.data?.message || err?.message || "Failed to save option."
      );
    } finally {
      setOptionSaving(false);
    }
  };

  const handleOptionDelete = async (option) => {
    const confirmed = window.confirm("Delete this option?");
    if (!confirmed) return;

    try {
      await adminApi.deleteOption(option._id);
      setMessage("Option deleted successfully.");
      await loadData();
    } catch (err) {
      setMessage(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete option."
      );
    }
  };

  return (
    <AdminLayout title="Question Manager">
      <div className="space-y-6">
        <Card>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
                Questionnaire Builder
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold text-slate-900">
                Manage Questions by User Type
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                Assign each question to one or more questionnaire templates such
                as New Seeker, Beginner Sahajayogi, Regular Sahajayogi, or
                Advanced Vibration Guidance.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={templateFilter}
                onChange={(e) => {
                  setTemplateFilter(e.target.value);
                  setSelectedQuestionId("");
                  resetOptionForm();
                }}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              >
                <option value="all">All Templates</option>
                <option value="new_seeker_basic">New Seeker</option>
                <option value="beginner_sahajayogi">Beginner Sahajayogi</option>
                <option value="regular_sahajayogi">Regular Sahajayogi</option>
                <option value="advanced_vibration_guidance">
                  Advanced Guidance
                </option>
              </select>

              <button
                type="button"
                onClick={loadData}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw size={16} />
                Refresh
              </button>

              <button
                type="button"
                onClick={resetQuestionForm}
                className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
              >
                <CirclePlus size={16} />
                New Question
              </button>
            </div>
          </div>

          {message ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </div>
          ) : null}
        </Card>

        <div className="grid gap-6 2xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-6">
            <Card className="2xl:sticky 2xl:top-24">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-orange-50 p-3 text-orange-700">
                  <FileQuestion size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    Questions
                  </h3>
                  <p className="text-sm text-slate-500">
                    {displayQuestions.length} shown / {questions.length} total
                  </p>
                </div>
              </div>

              {loading ? (
                <p className="text-sm text-slate-500">Loading questions...</p>
              ) : (
                <div className="max-h-[70vh] space-y-3 overflow-auto pr-1">
                  {displayQuestions
                    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                    .map((question) => {
                      const active = selectedQuestionId === question._id;

                      return (
                        <button
                          key={question._id}
                          type="button"
                          onClick={() => {
                            setSelectedQuestionId(question._id);
                            resetOptionForm();
                          }}
                          className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                            active
                              ? "border-orange-300 bg-orange-50"
                              : "border-[#eadfcb] bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-orange-700 shadow-sm">
                                  {question.sortOrder}
                                </span>
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                                  {question.category}
                                </span>
                              </div>
                              <p className="mt-3 line-clamp-3 text-sm font-medium leading-7 text-slate-800">
                                {question.questionText}
                              </p>
                            </div>

                            <div className="shrink-0">
                              {question.isActive ? (
                                <Eye size={18} className="text-green-600" />
                              ) : (
                                <EyeOff size={18} className="text-slate-400" />
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              )}
            </Card>

            <QuestionForm
              form={questionForm}
              setForm={setQuestionForm}
              onSubmit={handleQuestionSubmit}
              saving={questionSaving}
              editing={editingQuestion}
              onCancel={resetQuestionForm}
            />
          </div>

          <div className="min-w-0 space-y-6">
            {selectedQuestion ? (
              <>
                <Card>
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
                        Selected Question
                      </p>
                      <h3 className="mt-2 font-serif text-2xl font-bold text-slate-900">
                        {selectedQuestion.questionText}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-700">
                          {selectedQuestion.category}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                          {selectedQuestion.type}
                        </span>
                        <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">
                          {selectedQuestion.difficultyLevel || "intermediate"}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 ${
                            selectedQuestion.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {selectedQuestion.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Templates
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(selectedQuestion.templateKeys || []).map((item) => (
                            <span
                              key={item}
                              className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      {selectedQuestion.helpText ? (
                        <p className="mt-4 text-sm leading-7 text-slate-600">
                          {selectedQuestion.helpText}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEditQuestion(selectedQuestion)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
                      >
                        <Edit3 size={16} />
                        Edit Question
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuestionDelete(selectedQuestion)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </Card>

                <OptionForm
                  optionForm={optionForm}
                  setOptionForm={setOptionForm}
                  onSubmit={handleOptionSubmit}
                  saving={optionSaving}
                  editingOption={editingOption}
                  onCancel={resetOptionForm}
                />

                <Card>
                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-2xl bg-orange-50 p-3 text-orange-700">
                      <ListChecks size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        Options for This Question
                      </h3>
                      <p className="text-sm text-slate-500">
                        {selectedOptions.length} option
                        {selectedOptions.length === 1 ? "" : "s"} linked
                      </p>
                    </div>
                  </div>

                  {selectedOptions.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No options found for this question yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedOptions.map((option) => (
                        <div
                          key={option._id}
                          className="rounded-2xl border border-[#eadfcb] bg-[#fbf7ef] p-4"
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-orange-700">
                                  Order {option.sortOrder ?? 0}
                                </span>
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                  {option.isNeutral ? "Neutral" : "Scored"}
                                </span>
                              </div>
                              <p className="mt-3 font-semibold text-slate-900">
                                {option.label}
                              </p>
                              <p className="mt-1 text-sm text-slate-600">
                                {option.value}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-slate-600">
                                {option.description || "No description"}
                              </p>
                            </div>

                            <div className="flex shrink-0 gap-2">
                              <button
                                type="button"
                                onClick={() => startEditOption(option)}
                                className="rounded-xl bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-100"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOptionDelete(option)}
                                className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </>
            ) : (
              <Card>
                <p className="text-sm text-slate-500">
                  Select a question from the list to manage its options.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}