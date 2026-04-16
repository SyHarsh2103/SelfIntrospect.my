import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  Gauge,
  Loader2,
  Mail,
  Phone,
  RotateCcw,
  Sparkles,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";

import PageShell from "../components/common/PageShell";
import DisclaimerBox from "../components/common/DisclaimerBox";
import { publicApi } from "../services/api";
import { useQuestionnaire } from "../context/QuestionnaireContext";

const chakraLabels = {
  mooladhara: "Mooladhara Chakra",
  swadhisthana: "Swadhisthana Chakra",
  nabhi: "Nabhi Chakra",
  void: "Void",
  heart: "Heart Chakra",
  vishuddhi: "Vishuddhi Chakra",
  agnya: "Agnya Chakra",
  sahasrara: "Sahasrara Chakra",
};

const nadiLabels = {
  leftNadi: "Left Channel / Ida Nadi",
  rightNadi: "Right Channel / Pingala Nadi",
  centerNadi: "Center Channel / Sushumna Nadi",
};

const chakraOrder = [
  "mooladhara",
  "swadhisthana",
  "nabhi",
  "void",
  "heart",
  "vishuddhi",
  "agnya",
  "sahasrara",
];

const nadiOrder = ["leftNadi", "rightNadi", "centerNadi"];

const defaultUserForm = {
  name: "",
  phone: "",
  email: "",
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPhone = (phone) => {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return cleaned.length >= 8;
};

const getContentSafely = async (key, fallback = "") => {
  try {
    const block = await publicApi.getContent(key);
    return block?.content || fallback;
  } catch {
    return fallback;
  }
};

const formatLabel = (key = "") => {
  if (!key) return "";

  return String(key)
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase());
};

const getVisualStatus = (score = 0) => {
  const normalizedScore = Number(score || 0);

  if (normalizedScore <= 0) {
    return {
      label: "Good",
      level: 0,
      height: 18,
      className: "bg-emerald-500",
      softClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
      ringClass: "ring-emerald-100",
      dotClass: "bg-emerald-500",
    };
  }

  if (normalizedScore <= 1) {
    return {
      label: "Balanced",
      level: 1,
      height: 34,
      className: "bg-sky-500",
      softClass: "bg-sky-50 text-sky-700 border-sky-100",
      ringClass: "ring-sky-100",
      dotClass: "bg-sky-500",
    };
  }

  if (normalizedScore <= 2) {
    return {
      label: "Mild Attention",
      level: 2,
      height: 50,
      className: "bg-amber-400",
      softClass: "bg-amber-50 text-amber-700 border-amber-100",
      ringClass: "ring-amber-100",
      dotClass: "bg-amber-400",
    };
  }

  if (normalizedScore <= 5) {
    return {
      label: "Need to Work",
      level: 3,
      height: 70,
      className: "bg-orange-500",
      softClass: "bg-orange-50 text-orange-700 border-orange-100",
      ringClass: "ring-orange-100",
      dotClass: "bg-orange-500",
    };
  }

  return {
    label: "Strong Attention",
    level: 4,
    height: 90,
    className: "bg-red-500",
    softClass: "bg-red-50 text-red-700 border-red-100",
    ringClass: "ring-red-100",
    dotClass: "bg-red-500",
  };
};

const getScoreEntries = (scores = {}, labelMap = {}) => {
  return Object.entries(scores || {})
    .map(([key, value]) => ({
      key,
      label: labelMap[key] || formatLabel(key),
      score: Number(value || 0),
      ...getVisualStatus(Number(value || 0)),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
};

const getChakraGraphData = (result = {}) => {
  const scores = result.chakraScores || {};

  return chakraOrder.map((key) => {
    const score = Number(scores[key] || 0);
    const status = getVisualStatus(score);
    const areaLabel = chakraLabels[key] || formatLabel(key);

    return {
      key,
      areaLabel,
      shortLabel: areaLabel.replace(" Chakra", ""),
      score,
      ...status,
      statusLabel: status.label,
    };
  });
};

const getNadiGraphData = (result = {}) => {
  const scores = result.nadiScores || {};

  return nadiOrder.map((key) => {
    const score = Number(scores[key] || 0);
    const status = getVisualStatus(score);
    const areaLabel = nadiLabels[key] || formatLabel(key);

    return {
      key,
      areaLabel,
      shortLabel:
        key === "leftNadi" ? "Left" : key === "rightNadi" ? "Right" : "Center",
      score,
      ...status,
      statusLabel: status.label,
    };
  });
};

const getDetailedAnswers = (result = {}) => {
  const possibleLists = [
    result.answersDetailed,
    result.answerDetails,
    result.detailedAnswers,
    result.populatedAnswers,
  ];

  const found = possibleLists.find((list) => Array.isArray(list) && list.length);

  if (found) return found;
  if (Array.isArray(result.answers) && result.answers.length) return result.answers;

  return [];
};

const getSelectedOptionText = (answer = {}) => {
  if (Array.isArray(answer.selectedOptions) && answer.selectedOptions.length) {
    return answer.selectedOptions
      .map((option) => option?.label || option?.value)
      .filter(Boolean)
      .join(", ");
  }

  if (Array.isArray(answer.options) && answer.options.length) {
    return answer.options
      .map((option) => option?.label || option?.value)
      .filter(Boolean)
      .join(", ");
  }

  if (
    Array.isArray(answer.selectedOptionLabels) &&
    answer.selectedOptionLabels.length
  ) {
    return answer.selectedOptionLabels.join(", ");
  }

  if (answer.selectedOptionLabel) return answer.selectedOptionLabel;

  if (answer.intensityLevel) return `Intensity level ${answer.intensityLevel}`;

  return "Selected response recorded";
};

const getQuestionText = (answer = {}, index) => {
  return (
    answer.questionText ||
    answer.question?.questionText ||
    answer.question?.text ||
    answer.questionId?.questionText ||
    `Question ${index + 1}`
  );
};

const collectScoresFromAnswer = (answer = {}) => {
  const selectedOptions = [
    ...(Array.isArray(answer.selectedOptions) ? answer.selectedOptions : []),
    ...(Array.isArray(answer.options) ? answer.options : []),
  ];

  const chakraScores = {};
  const nadiScores = {};

  selectedOptions.forEach((option) => {
    Object.entries(option?.chakraScores || {}).forEach(([key, value]) => {
      chakraScores[key] = Number(chakraScores[key] || 0) + Number(value || 0);
    });

    Object.entries(option?.nadiScores || {}).forEach(([key, value]) => {
      nadiScores[key] = Number(nadiScores[key] || 0) + Number(value || 0);
    });
  });

  return { chakraScores, nadiScores };
};

const getReflectionText = (answer = {}) => {
  const selectedOptions = [
    ...(Array.isArray(answer.selectedOptions) ? answer.selectedOptions : []),
    ...(Array.isArray(answer.options) ? answer.options : []),
  ];

  const optionExplanations = selectedOptions
    .map(
      (option) =>
        option?.explanation || option?.reflection || option?.description
    )
    .filter(Boolean);

  if (optionExplanations.length) return optionExplanations.join(" ");

  const { chakraScores, nadiScores } = collectScoresFromAnswer(answer);

  const chakraAreas = getScoreEntries(chakraScores, chakraLabels)
    .slice(0, 2)
    .map((item) => item.label);

  const nadiAreas = getScoreEntries(nadiScores, nadiLabels)
    .slice(0, 2)
    .map((item) => item.label);

  if (chakraAreas.length || nadiAreas.length) {
    const parts = [];

    if (chakraAreas.length) parts.push(chakraAreas.join(" and "));
    if (nadiAreas.length) parts.push(nadiAreas.join(" and "));

    return `This answer may point toward ${parts.join(", ")}. Treat this as a gentle observation, not a final conclusion.`;
  }

  return "This answer may reflect a present inner tendency. Observe it gently through meditation, vibrations, and honest self-introspection.";
};

const getOverallStatus = (chakraData = [], nadiData = []) => {
  const all = [...chakraData, ...nadiData];
  const maxLevel = Math.max(...all.map((item) => Number(item.level || 0)), 0);

  const status = getVisualStatus(
    maxLevel === 0 ? 0 : maxLevel === 1 ? 1 : maxLevel === 2 ? 2 : maxLevel === 3 ? 3 : 6
  );

  return {
    ...status,
    label:
      maxLevel <= 0
        ? "Good"
        : maxLevel === 1
          ? "Balanced"
          : maxLevel === 2
            ? "Mild Attention"
            : maxLevel === 3
              ? "Need to Work"
              : "Strong Attention",
  };
};

function ReportTableRow({ label, value }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 py-2 last:border-b-0 sm:grid-cols-[120px_1fr]">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="break-words text-xs font-semibold leading-5 text-slate-800 sm:text-sm">
        {value || "—"}
      </p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, helper, statusClass = "" }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-orange-100/50 blur-2xl transition group-hover:scale-125" />
      <div className="relative flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 ring-8 ring-orange-50/50">
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="mt-1 truncate font-serif text-xl font-bold text-slate-950">
            {value || "—"}
          </p>
          {helper ? (
            <p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p>
          ) : null}
          {statusClass ? (
            <div className={`mt-3 inline-flex rounded-full border px-3 py-1 text-[10px] font-bold ${statusClass}`}>
              Current signal
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function OverallAnalysisPanel({ result, chakraData, nadiData }) {
  const topChakra = [...chakraData].sort((a, b) => b.score - a.score)[0];
  const topNadi = [...nadiData].sort((a, b) => b.score - a.score)[0];
  const overall = getOverallStatus(chakraData, nadiData);
  const isMixed = String(result?.confidence || "").toLowerCase() === "inconclusive";

  return (
    <section className="border-b border-slate-200 py-5 sm:py-6">
      <div className="mb-4 flex flex-col gap-2 sm:mb-5">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700">
          <Gauge size={14} />
          Analysis Snapshot
        </div>
        <h2 className="font-serif text-2xl font-bold text-slate-950 sm:text-3xl">
          Overall Balance Summary
        </h2>
        <p className="max-w-3xl text-xs leading-6 text-slate-600 sm:text-sm sm:leading-7">
          A compact summary of the strongest answer-based tendencies before the detailed graphs.
        </p>
      </div>

      {isMixed ? (
        <div className="mb-4 rounded-3xl border border-amber-100 bg-amber-50 p-4 text-xs leading-6 text-amber-800 sm:text-sm sm:leading-7">
          Your answers show a mixed pattern. General meditation, footsoak, and guidance from experienced Sahajayogis may be more suitable than focusing on one area only.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Gauge}
          label="Overall Pattern"
          value={overall.label}
          helper="Highest visual status"
          statusClass={overall.softClass}
        />
        <StatCard
          icon={Sparkles}
          label="Main Chakra Area"
          value={topChakra?.areaLabel || "No strong area"}
          helper={topChakra?.score ? `Signal: ${topChakra.score}` : "No clear chakra signal"}
          statusClass={topChakra?.softClass}
        />
        <StatCard
          icon={TrendingUp}
          label="Main Nadi Tendency"
          value={topNadi?.areaLabel || "No strong tendency"}
          helper={topNadi?.score ? `Signal: ${topNadi.score}` : "No clear nadi signal"}
          statusClass={topNadi?.softClass}
        />
        <StatCard
          icon={ClipboardList}
          label="Clarity"
          value={result?.confidence || "—"}
          helper="Answer consistency"
        />
      </div>
    </section>
  );
}

function TopAttentionAreas({ chakraData = [], nadiData = [] }) {
  const topAreas = [...chakraData, ...nadiData]
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <section className="border-b border-slate-200 py-5 sm:py-6">
      <div className="mb-4 sm:mb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-700">
          Priority View
        </p>
        <h2 className="mt-1 font-serif text-2xl font-bold text-slate-950 sm:text-3xl">
          Top Attention Areas
        </h2>
        <p className="mt-2 max-w-3xl text-xs leading-6 text-slate-600 sm:text-sm sm:leading-7">
          The strongest answer patterns, shown as a simple ranking for self-reflection.
        </p>
      </div>

      {topAreas.length ? (
        <div className="grid gap-3 md:grid-cols-3">
          {topAreas.map((item, index) => (
            <div
              key={item.key}
              className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className={`absolute inset-x-0 top-0 h-1 ${item.className}`} />
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-sm font-bold text-orange-700">
                  {index + 1}
                </span>
                <span className={`rounded-full border px-3 py-1 text-[10px] font-bold ${item.softClass}`}>
                  {item.statusLabel || item.label}
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold leading-tight text-slate-950">
                {item.areaLabel || item.shortLabel}
              </h3>
              <p className="mt-2 text-xs leading-6 text-slate-600">
                This area appeared in your answer pattern and can be used as a gentle observation point.
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-7 text-emerald-800">
          No strong attention area was detected from the selected answers.
        </div>
      )}
    </section>
  );
}

function BalanceGraph({ eyebrow = "Visual Overview", title, subtitle, data = [] }) {
  return (
    <section className="border-b border-slate-200 py-5 sm:py-6">
      <div className="mb-4 sm:mb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-700">
          {eyebrow}
        </p>
        <h2 className="mt-1 font-serif text-2xl font-bold text-slate-950 sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 max-w-3xl text-xs leading-6 text-slate-600 sm:text-sm sm:leading-7">
          {subtitle}
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <BarChart3 size={16} className="text-orange-600" />
            Visual Signal
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Swipe on mobile
          </p>
        </div>

        <div className="overflow-x-auto p-3 sm:p-5">
          <div className="flex min-w-[620px] gap-3 sm:min-w-[760px] sm:gap-4">
            <div className="flex w-28 flex-col justify-between pb-12 pt-2 text-right text-[9px] font-bold text-slate-500 sm:w-36 sm:text-[11px]">
              <span>Strong</span>
              <span>Work</span>
              <span>Mild</span>
              <span>Balanced</span>
              <span>Good</span>
            </div>

            <div className="flex flex-1 items-end justify-between gap-2 border-l border-b border-slate-200 px-3 pt-4 sm:gap-3 sm:px-4">
              {data.map((item) => (
                <div
                  key={item.key}
                  className="flex min-w-[56px] flex-1 flex-col items-center justify-end sm:min-w-[70px]"
                >
                  <span
                    className={`mb-2 rounded-full border px-2 py-1 text-[9px] font-bold sm:text-[10px] ${item.softClass}`}
                  >
                    {(item.statusLabel || item.label) === "Need to Work"
                      ? "Work"
                      : item.statusLabel || item.label}
                  </span>

                  <div className="flex h-32 w-full items-end justify-center sm:h-36">
                    <div
                      className={`w-7 rounded-t-xl shadow-sm sm:w-9 ${item.className}`}
                      style={{ height: `${item.height}%` }}
                      title={`${item.shortLabel}: ${item.statusLabel || item.label}`}
                    />
                  </div>

                  <p className="mt-3 min-h-10 text-center text-[10px] font-bold leading-4 text-slate-600 sm:text-[11px]">
                    {item.shortLabel}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {[
          { label: "Good", className: "bg-emerald-50 text-emerald-700" },
          { label: "Balanced", className: "bg-sky-50 text-sky-700" },
          { label: "Mild", className: "bg-amber-50 text-amber-700" },
          { label: "Work", className: "bg-orange-50 text-orange-700" },
          { label: "Strong", className: "bg-red-50 text-red-700" },
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-2xl px-3 py-2 text-center text-[11px] font-bold ${item.className}`}
          >
            {item.label}
          </div>
        ))}
      </div>
    </section>
  );
}

function GraphExplanation({ title, points = [] }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="font-serif text-xl font-bold text-slate-950 sm:text-2xl">
        {title}
      </h2>

      <ul className="mt-4 space-y-3 text-xs leading-6 text-slate-700 sm:text-sm sm:leading-7">
        {points.map((point) => (
          <li key={point} className="flex gap-3">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SimpleMeaningCard() {
  return (
    <section className="border-b border-slate-200 py-5 sm:py-6">
      <div className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-sm">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-slate-950 sm:text-2xl">
              What this means in simple words
            </h2>
            <p className="mt-2 text-xs leading-6 text-slate-700 sm:text-sm sm:leading-7">
              Your answers may show where attention, emotions, thoughts, or energy are asking for gentle observation. This does not mean anything is wrong. It only gives a direction for meditation, self-awareness, and practical Sahajayoga guidance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReflectionItem({ answer, index }) {
  const questionText = getQuestionText(answer, index);
  const selectedText = getSelectedOptionText(answer);
  const reflectionText = getReflectionText(answer);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-bold text-orange-700">
          {index + 1}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700">
            Reflection
          </p>

          <h3 className="mt-1 font-serif text-lg font-bold leading-snug text-slate-950 sm:text-xl">
            {questionText}
          </h3>

          <div className="mt-3 grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700">
                Selected answer
              </p>
              <p className="mt-1 text-xs font-semibold leading-6 text-slate-800 sm:text-sm">
                {selectedText}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                Reflection note
              </p>
              <p className="mt-1 text-xs leading-6 text-slate-700 sm:text-sm">
                {reflectionText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyReflectionReport() {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-1 shrink-0 text-emerald-700" size={20} />
        <div>
          <h2 className="font-serif text-xl font-bold text-slate-900">
            Detailed reflection is not available
          </h2>
          <p className="mt-2 text-xs leading-6 text-slate-700 sm:text-sm">
            Your report was generated successfully, but the server did not return question-wise answer details yet.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { resetAnswers } = useQuestionnaire();

  const [result, setResult] = useState(null);
  const [disclaimer, setDisclaimer] = useState("");
  const [finalGuidance, setFinalGuidance] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showUserForm, setShowUserForm] = useState(false);
  const [savingUserInfo, setSavingUserInfo] = useState(false);
  const [userForm, setUserForm] = useState(defaultUserForm);
  const [userFormError, setUserFormError] = useState("");

  useEffect(() => {
    const loadResult = async () => {
      try {
        setLoading(true);
        setError("");

        const resultData = await publicApi.getResult(sessionId);

        const [shortDisclaimer, finalBlock] = await Promise.all([
          getContentSafely(
            "shortDisclaimer",
            "This report is based only on your selected answers and may not always be fully accurate. For deeper clarity, please connect with experienced Sahajayogis."
          ),
          getContentSafely(
            "finalGuidance",
            "Please use this as gentle self-reflection only. Regular Sahajayoga meditation, thoughtless awareness, and connection with experienced Sahajayogis may help you observe your inner state more clearly."
          ),
        ]);

        setResult(resultData);
        setDisclaimer(shortDisclaimer);
        setFinalGuidance(finalBlock);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load your report."
        );
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) loadResult();
  }, [sessionId]);

  const detailedAnswers = useMemo(
    () => getDetailedAnswers(result || {}),
    [result]
  );

  const chakraGraphData = useMemo(
    () => getChakraGraphData(result || {}),
    [result]
  );

  const nadiGraphData = useMemo(
    () => getNadiGraphData(result || {}),
    [result]
  );

  const validateUserForm = () => {
    const name = userForm.name.trim();
    const phone = userForm.phone.trim();
    const email = userForm.email.trim();

    if (!name || name.length < 2) return "Please enter a valid full name.";
    if (!phone || !isValidPhone(phone)) return "Please enter a valid phone number.";
    if (!email || !isValidEmail(email)) return "Please enter a valid email ID.";

    return "";
  };

  const openGuidanceFlow = () => {
    setUserFormError("");

    setUserForm({
      name: result?.userInfo?.name || "",
      phone: result?.userInfo?.phone || "",
      email: result?.userInfo?.email || "",
    });

    setShowUserForm(true);
  };

  const handleSaveUserInfo = async () => {
    const validationError = validateUserForm();

    if (validationError) {
      setUserFormError(validationError);
      return;
    }

    try {
      setSavingUserInfo(true);
      setUserFormError("");

      const payload = {
        userInfo: {
          name: userForm.name.trim(),
          phone: userForm.phone.trim(),
          email: userForm.email.trim().toLowerCase(),
        },
      };

      const response = await publicApi.updateResultUserInfo(sessionId, payload);

      setResult((prev) => ({
        ...prev,
        userInfo: response?.userInfo || payload.userInfo,
        hasUserInfo: true,
      }));

      setShowUserForm(false);
      navigate(`/result/${sessionId}/guidance`);
    } catch (err) {
      setUserFormError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to save your details. Please try again."
      );
    } finally {
      setSavingUserInfo(false);
    }
  };

  if (loading) {
    return (
      <PageShell title="Preparing your report">
        <div className="mx-auto max-w-2xl rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50">
              <Loader2 className="animate-spin text-orange-600" size={22} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Preparing analysis...
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                Building your chart-based self-introspection report.
              </p>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  if (error || !result) {
    return (
      <PageShell title="Report not available">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-100 bg-white p-5 shadow-sm sm:p-8">
          <p className="text-sm leading-7 text-red-700">
            {error || "No report was found for this session."}
          </p>

          <div className="mt-5">
            <Link
              to="/questionnaire"
              onClick={resetAnswers}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
            >
              <RotateCcw size={17} />
              Retake questionnaire
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Self Introspection Analysis"
      subtitle="A mobile-responsive analysis report based on your selected answers."
      actions={
        <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-3">
          <button
            type="button"
            onClick={openGuidanceFlow}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl sm:px-6 sm:py-3 sm:text-sm"
          >
            View Guidance
            <ArrowRight size={16} />
          </button>

          <Link
            to="/questionnaire"
            onClick={resetAnswers}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-200 bg-white px-5 py-2.5 text-xs font-bold text-orange-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-50 sm:px-6 sm:py-3 sm:text-sm"
          >
            <RotateCcw size={16} />
            Retake
          </Link>
        </div>
      }
    >
      <article className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-[26px] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60 sm:rounded-[34px] sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-orange-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-56 h-72 w-72 rounded-full bg-emerald-100/60 blur-3xl" />

        <div className="relative">
          <header className="border-b border-slate-200 pb-5 sm:pb-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700 sm:px-4 sm:tracking-[0.18em]">
                  <BarChart3 size={14} className="shrink-0" />
                  <span className="truncate">Sahajayoga Analysis Report</span>
                </div>

                <h1 className="mt-4 font-serif text-2xl font-bold leading-tight text-slate-950 sm:text-3xl lg:text-5xl">
                  Answer-Based Imbalance Analysis
                </h1>

                <p className="mt-3 max-w-4xl text-xs leading-6 text-slate-600 sm:text-sm sm:leading-7">
                  This report combines summary cards, chakra and nadi graphs, and question-wise reflection. It is supportive guidance only and not a final spiritual assessment.
                </p>
              </div>

              <div className="w-full rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur sm:max-w-xs sm:p-4">
                <ReportTableRow label="Clarity" value={result.confidence || "—"} />
                <ReportTableRow label="Chakras" value={`${chakraGraphData.length} areas`} />
                <ReportTableRow label="Nadis" value={`${nadiGraphData.length} channels`} />
              </div>
            </div>
          </header>

          <section className="border-b border-slate-200 py-5 sm:py-6">
            <div className="rounded-3xl bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-4 shadow-sm ring-1 ring-orange-100/70 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-sm">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-slate-950 sm:text-2xl">
                    Executive Summary
                  </h2>
                  <p className="mt-2 text-xs leading-6 text-slate-700 sm:text-sm sm:leading-7">
                    Your answers may reflect patterns connected with attention, emotions, thoughts, habits, or inner sensitivity. In Sahajayoga, these patterns are best observed calmly through meditation, vibrations, and self-awareness.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <OverallAnalysisPanel
            result={result}
            chakraData={chakraGraphData}
            nadiData={nadiGraphData}
          />

          <TopAttentionAreas chakraData={chakraGraphData} nadiData={nadiGraphData} />

          <SimpleMeaningCard />

          <div className="space-y-5">
            <BalanceGraph
              title="Chakra Balance Graph"
              subtitle="A visual overview of possible chakra attention areas based on your selected answers. Higher bars suggest more signal for gentle observation."
              data={chakraGraphData}
            />

            <BalanceGraph
              title="Nadi Balance Graph"
              subtitle="A simple view of whether your answers lean more toward left channel, right channel, or center channel patterns."
              data={nadiGraphData}
            />
          </div>

          <section className="grid gap-5 border-b border-slate-200 py-5 sm:py-6 xl:grid-cols-2">
            <GraphExplanation
              title="How to understand the Chakra Graph"
              points={[
                "Good or Balanced means your selected answers did not strongly point toward that chakra area.",
                "Mild Attention means there may be a light pattern to observe gently during meditation.",
                "Need to Work means multiple answers may be pointing toward that chakra area.",
                "Strong Attention means this area appeared more strongly in your answer pattern.",
                "This graph is supportive reflection only, not a final spiritual assessment.",
              ]}
            />

            <GraphExplanation
              title="How to understand the Nadi Graph"
              points={[
                "Left channel tendency may reflect emotional heaviness, past-oriented attention, or low energy.",
                "Right channel tendency may reflect overactivity, too much planning, heat, or mental pressure.",
                "Center channel balance may reflect steadiness, present attention, and meditation depth.",
                "A higher bar only shows where your selected answers created more signal.",
                "For deeper clarity, observe vibrations during meditation and connect with experienced Sahajayogis.",
              ]}
            />
          </section>

          <section className="py-5 sm:py-6">
            <div className="mb-4 sm:mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-700">
                Question-wise report
              </p>
              <h2 className="mt-1 font-serif text-2xl font-bold text-slate-950 sm:text-3xl">
                Selected Answers & Reflection
              </h2>
            </div>

            {detailedAnswers.length ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {detailedAnswers.map((answer, index) => (
                  <ReflectionItem
                    key={answer._id || answer.questionId || index}
                    answer={answer}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <EmptyReflectionReport />
            )}
          </section>

          <section className="grid gap-4 border-t border-slate-200 py-5 sm:py-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <h2 className="font-serif text-xl font-bold text-slate-950 sm:text-2xl">
                Meditation Support
              </h2>
              <p className="mt-2 text-xs leading-6 text-slate-700 sm:text-sm sm:leading-7">
                Sahajayoga meditation may support deeper awareness through silence, thoughtless attention, and vibration-based observation.
              </p>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4 sm:p-5">
              <h2 className="font-serif text-xl font-bold text-slate-950 sm:text-2xl">
                Next Step
              </h2>
              <p className="mt-2 text-xs leading-6 text-slate-700 sm:text-sm sm:leading-7">
                Continue to the guidance page to view practical remedies and mantra suggestions based on this result.
              </p>
              <button
                type="button"
                onClick={openGuidanceFlow}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto sm:text-sm"
              >
                View Guidance
                <ArrowRight size={16} />
              </button>
            </div>
          </section>

          <section className="border-t border-slate-200 py-5 sm:py-6">
            <h2 className="font-serif text-xl font-bold text-slate-950 sm:text-2xl">
              Final Note
            </h2>
            <p className="mt-2 text-xs leading-6 text-slate-700 sm:text-sm sm:leading-7">
              {finalGuidance}
            </p>
          </section>

          <DisclaimerBox short content={disclaimer} />
        </div>
      </article>

      {showUserForm && (
        <div className="fixed inset-0 z-[99999] flex items-end justify-center bg-slate-950/70 px-0 py-0 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
          <div className="flex h-[92dvh] w-full flex-col overflow-hidden rounded-t-[30px] bg-white shadow-2xl shadow-slate-950/30 sm:h-auto sm:max-h-[92vh] sm:max-w-xl sm:rounded-[34px]">
            <div className="relative shrink-0 border-b border-orange-100 bg-gradient-to-br from-orange-50 via-white to-emerald-50 px-4 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6">
              <button
                type="button"
                disabled={savingUserInfo}
                onClick={() => {
                  setShowUserForm(false);
                  setUserFormError("");
                }}
                className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close details form"
              >
                <X size={18} />
              </button>

              <div className="inline-flex max-w-[calc(100%-3rem)] items-center gap-2 rounded-full bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700 shadow-sm sm:px-4 sm:text-xs sm:tracking-[0.16em]">
                <ClipboardList size={15} className="shrink-0" />
                <span className="truncate">Before Guidance Page</span>
              </div>

              <h2 className="mt-4 pr-12 font-serif text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">
                Please fill your details
              </h2>

              <p className="mt-2 pr-2 text-sm leading-6 text-slate-600 sm:leading-7">
                Your report is ready. Please share your details before opening the remedies and mantras guidance page.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
              {userFormError && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  {userFormError}
                </div>
              )}

              <form
                id="guidance-user-details-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSaveUserInfo();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserRound
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      value={userForm.name}
                      onChange={(event) => {
                        setUserForm((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }));
                        setUserFormError("");
                      }}
                      required
                      placeholder="Enter your full name"
                      className="h-12 w-full rounded-2xl border border-orange-100 bg-white pl-11 pr-4 text-base outline-none transition placeholder:text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-100 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="tel"
                      inputMode="tel"
                      value={userForm.phone}
                      onChange={(event) => {
                        setUserForm((prev) => ({
                          ...prev,
                          phone: event.target.value,
                        }));
                        setUserFormError("");
                      }}
                      required
                      placeholder="Enter your phone number"
                      className="h-12 w-full rounded-2xl border border-orange-100 bg-white pl-11 pr-4 text-base outline-none transition placeholder:text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-100 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Email ID
                  </label>
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="email"
                      inputMode="email"
                      value={userForm.email}
                      onChange={(event) => {
                        setUserForm((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }));
                        setUserFormError("");
                      }}
                      required
                      placeholder="Enter your email ID"
                      className="h-12 w-full rounded-2xl border border-orange-100 bg-white pl-11 pr-4 text-base outline-none transition placeholder:text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-100 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-3 rounded-2xl bg-orange-50 px-4 py-3 text-xs leading-6 text-orange-800">
                  <CircleDot className="mt-0.5 shrink-0" size={16} />
                  <p>
                    Your details are used only for Sahajayoga follow-up guidance and are not shown publicly. The report remains supportive guidance, not a final spiritual assessment.
                  </p>
                </div>
              </form>
            </div>

            <div className="shrink-0 border-t border-orange-100 bg-white px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={savingUserInfo}
                  onClick={() => {
                    setShowUserForm(false);
                    setUserFormError("");
                  }}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-orange-200 bg-white px-6 py-3 text-sm font-bold text-orange-700 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Back
                </button>

                <button
                  type="submit"
                  form="guidance-user-details-form"
                  disabled={savingUserInfo}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-orange-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {savingUserInfo ? (
                    <>
                      <Loader2 className="animate-spin" size={17} />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}