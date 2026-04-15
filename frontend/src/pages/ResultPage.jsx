import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Loader2,
  RotateCcw,
} from "lucide-react";

import PageShell from "../components/common/PageShell";
import DisclaimerBox from "../components/common/DisclaimerBox";
import { publicApi } from "../services/api";
import { useQuestionnaire } from "../context/QuestionnaireContext";

const generalGuidance = [
  "Raise Kundalini and give yourself a bandhan.",
  "Footsoak for 10–15 minutes with salt water.",
  "Sit for meditation with attention on Sahasrara.",
];

const chakraFallback = [
  { key: "mooladhara", label: "Mooladhara Chakra" },
  { key: "swadhisthana", label: "Swadhisthana Chakra" },
  { key: "nabhi", label: "Nabhi Chakra" },
  { key: "void", label: "Void" },
  { key: "heart", label: "Heart Chakra" },
  { key: "vishuddhi", label: "Vishuddhi Chakra" },
  { key: "agnya", label: "Agnya Chakra" },
  { key: "sahasrara", label: "Sahasrara Chakra" },
];

const nadiFallback = [
  { key: "leftNadi", label: "Left Channel / Ida Nadi" },
  { key: "rightNadi", label: "Right Channel / Pingala Nadi" },
  { key: "centerNadi", label: "Center Channel / Sushumna Nadi" },
];

const keywordMap = {
  mooladhara: ["mooladhara", "ganesha", "grounding", "innocence"],
  swadhisthana: ["swadhisthana", "saraswati", "attention", "creativity"],
  nabhi: ["nabhi", "lakshmi", "narayana", "satisfaction"],
  void: ["void", "guru", "dattatreya", "dharma"],
  heart: ["heart", "jagadamba", "confidence", "security"],
  vishuddhi: ["vishuddhi", "krishna", "witness", "guilt"],
  agnya: ["agnya", "forgiveness", "forgive"],
  sahasrara: ["sahasrara", "mahamaya", "connection", "silence"],
  leftNadi: ["left", "ida", "left channel", "heaviness", "past"],
  rightNadi: ["right", "pingala", "right channel", "cooling", "heat"],
  centerNadi: ["center", "sushumna", "center channel", "steadiness", "balance"],
};

const getContentSafely = async (key, fallback = "") => {
  try {
    const block = await publicApi.getContent(key);
    return block?.content || fallback;
  } catch {
    return fallback;
  }
};

const getStatus = (score = 0) => {
  if (score <= 0) {
    return {
      label: "Balanced",
      className: "text-emerald-700 bg-emerald-50 border-emerald-100",
      bar: "bg-emerald-500",
    };
  }

  if (score <= 2) {
    return {
      label: "Mild Attention",
      className: "text-sky-700 bg-sky-50 border-sky-100",
      bar: "bg-sky-500",
    };
  }

  if (score <= 5) {
    return {
      label: "Need to Work",
      className: "text-amber-700 bg-amber-50 border-amber-100",
      bar: "bg-amber-500",
    };
  }

  return {
    label: "Strong Attention",
    className: "text-orange-700 bg-orange-50 border-orange-100",
    bar: "bg-orange-600",
  };
};

const normalizeRanking = (ranking = [], fallback = []) => {
  const rankingMap = new Map(
    ranking.map((item) => [
      item.key || item.name || item.label,
      {
        ...item,
        key: item.key || item.name || item.label,
        label: item.label || item.displayName || item.name,
        score: Number(item.score || 0),
      },
    ])
  );

  return fallback
    .map((item) => {
      const found = rankingMap.get(item.key);
      const score = Number(found?.score || 0);
      const status = getStatus(score);

      return {
        ...item,
        ...found,
        key: item.key,
        label: found?.label || item.label,
        score,
        status: found?.status || status.label,
        statusClassName: status.className,
        barColor: status.bar,
      };
    })
    .sort((a, b) => b.score - a.score);
};

function normalizeResultItems(primaryList, fallbackList) {
  if (Array.isArray(primaryList) && primaryList.length) {
    return primaryList.filter((item) => item && typeof item === "object");
  }

  if (Array.isArray(fallbackList) && fallbackList.length) {
    return fallbackList.filter((item) => item && typeof item === "object");
  }

  return [];
}

const stringifySearchable = (item) => {
  if (!item || typeof item !== "object") return "";

  return [
    item.title,
    item.notes,
    item.usageNotes,
    item.mantraText,
    item.phoneticText,
    item.chakraId?.name,
    item.chakraId?.displayName,
    ...(Array.isArray(item.chakraIds)
      ? item.chakraIds.map(
          (chakra) => chakra?.name || chakra?.displayName || chakra
        )
      : []),
    ...(Array.isArray(item.nadiIds)
      ? item.nadiIds.map((nadi) => nadi?.name || nadi?.displayName || nadi)
      : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

const itemMatchesFinding = (item, finding) => {
  const searchable = stringifySearchable(item);
  const keywords = keywordMap[finding.key] || [finding.key, finding.label];

  return keywords.some((keyword) =>
    searchable.includes(String(keyword).toLowerCase())
  );
};

function ReportPill({ children, className = "" }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${className}`}
    >
      {children}
    </span>
  );
}

function ReportTableRow({ label, value }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 py-3 last:border-b-0 sm:grid-cols-[180px_1fr]">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="break-words text-sm font-semibold leading-6 text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}

function RemedyReport({ remedies }) {
  if (!remedies.length) {
    return (
      <p className="text-sm leading-7 text-slate-600">
        No specific remedy is linked to this finding yet. Follow the general
        cleansing recommendation below.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {remedies.map((remedy, remedyIndex) => (
        <div
          key={remedy._id || remedy.title}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
        >
          <p className="font-serif text-xl font-bold text-slate-900">
            {remedyIndex + 1}. {remedy.title}
          </p>

          {remedy.duration ? (
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-orange-700">
              Duration: {remedy.duration}
            </p>
          ) : null}

          {Array.isArray(remedy.steps) && remedy.steps.length > 0 ? (
            <ol className="mt-3 space-y-2 pl-5 text-sm leading-7 text-slate-700">
              {remedy.steps.map((step, index) => (
                <li key={`${remedy.title}-${index}`} className="list-decimal">
                  {step}
                </li>
              ))}
            </ol>
          ) : null}

          {remedy.notes ? (
            <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm leading-6 text-slate-600">
              {remedy.notes}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function MantraReport({ mantras }) {
  if (!mantras.length) {
    return (
      <p className="text-sm leading-7 text-slate-600">
        No mantra is linked to this chakra yet.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {mantras.map((mantra, mantraIndex) => (
        <div
          key={mantra._id || mantra.title}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
        >
          <p className="font-serif text-xl font-bold text-slate-900">
            {mantraIndex + 1}. {mantra.title}
          </p>
          <p className="mt-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold leading-7 text-slate-800">
            {mantra.mantraText}
          </p>
          {mantra.phoneticText ? (
            <p className="mt-3 text-sm leading-7 text-slate-600">
              <strong>Pronunciation:</strong> {mantra.phoneticText}
            </p>
          ) : null}
          {mantra.repetitions ? (
            <p className="mt-2 text-sm leading-7 text-slate-600">
              <strong>Repetition:</strong> {mantra.repetitions}
            </p>
          ) : null}
          {mantra.usageNotes ? (
            <p className="mt-2 text-sm leading-7 text-slate-600">
              <strong>Usage:</strong> {mantra.usageNotes}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function FindingReportSection({
  item,
  maxScore,
  index,
  type,
  remedies = [],
  mantras = [],
}) {
  const percentage =
    maxScore > 0 ? Math.min((item.score / maxScore) * 100, 100) : 0;
  const isChakra = type === "chakra";

  return (
    <section className="border-t border-slate-200 py-8 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-700">
            Section {index + 1} · {isChakra ? "Chakra Finding" : "Nadi Finding"}
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-slate-950">
            {item.label}
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
            This {isChakra ? "chakra" : "channel"} appeared in the answer
            pattern and is shown because it has a positive attention score.
            Balanced areas are intentionally hidden from this report.
          </p>
        </div>

        <ReportPill className={item.statusClassName}>{item.status}</ReportPill>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
        <ReportTableRow label="Attention score" value={item.score} />
        <ReportTableRow label="Status" value={item.status} />
        <ReportTableRow
          label="Category"
          value={isChakra ? "Chakra" : "Nadi / Channel"}
        />

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Relative attention level</span>
            <span>{Math.round(percentage)}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${item.barColor}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-7 grid gap-7 lg:grid-cols-2">
        <div>
          <h3 className="border-b border-slate-200 pb-2 font-serif text-2xl font-bold text-slate-900">
            Recommended Remedies
          </h3>
          <div className="mt-4">
            <RemedyReport remedies={remedies} />
          </div>
        </div>

        {isChakra ? (
          <div>
            <h3 className="border-b border-slate-200 pb-2 font-serif text-2xl font-bold text-slate-900">
              Mantra Support
            </h3>
            <div className="mt-4">
              <MantraReport mantras={mantras} />
            </div>
          </div>
        ) : (
          <div>
            <h3 className="border-b border-slate-200 pb-2 font-serif text-2xl font-bold text-slate-900">
              Channel Guidance
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              For channel imbalance, start with the recommended remedy and
              general cleansing practice. Mantra support is shown mainly under
              the chakra sections.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function EmptyBalancedReport() {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-1 text-emerald-700" size={22} />
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            No strong problem area detected
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Your selected answers did not show a specific chakra or channel that
            needs focused attention. Continue with regular meditation and general
            cleansing.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  const { sessionId } = useParams();
  const { resetAnswers } = useQuestionnaire();

  const [result, setResult] = useState(null);
  const [disclaimer, setDisclaimer] = useState("");
  const [finalGuidance, setFinalGuidance] = useState("");
  const [inconclusiveGuidance, setInconclusiveGuidance] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResult = async () => {
      try {
        setLoading(true);
        setError("");

        const resultData = await publicApi.getResult(sessionId);

        const [shortDisclaimer, finalBlock, inconclusiveBlock] =
          await Promise.all([
            getContentSafely(
              "shortDisclaimer",
              "This result is based on your selected answers and may not always be fully accurate. For deeper and proper guidance, please connect with experienced Sahajayogis."
            ),
            getContentSafely(
              "finalGuidance",
              "Please use this as gentle supportive guidance only. Regular meditation, footsoak, Kundalini raising, and connection with experienced Sahajayogis may help you understand more clearly."
            ),
            getContentSafely(
              "inconclusiveGuidance",
              "Your answers show a mixed pattern. General cleansing, daily meditation, and direct guidance from experienced Sahajayogis may be the best next step."
            ),
          ]);

        setResult(resultData);
        setDisclaimer(shortDisclaimer);
        setFinalGuidance(finalBlock);
        setInconclusiveGuidance(inconclusiveBlock);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load your result."
        );
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) loadResult();
  }, [sessionId]);

  const chakraAnalysis = useMemo(
    () => normalizeRanking(result?.chakraRanking || [], chakraFallback),
    [result]
  );

  const nadiAnalysis = useMemo(
    () => normalizeRanking(result?.nadiRanking || [], nadiFallback),
    [result]
  );

  if (loading) {
    return (
      <PageShell title="Preparing your report">
        <div className="mx-auto max-w-3xl rounded-3xl border border-orange-100 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2 className="animate-spin text-orange-600" size={22} />
            <p className="text-sm font-semibold">
              Generating professional report...
            </p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (error || !result) {
    return (
      <PageShell title="Result not available">
        <div className="rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
          <p className="text-sm leading-7 text-red-700">
            {error || "No result was found for this session."}
          </p>

          <div className="mt-5">
            <Link
              to="/questionnaire"
              onClick={resetAnswers}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <RotateCcw size={17} />
              Retake questionnaire
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const remedies = normalizeResultItems(result.remedies, result.remedyIds);
  const mantras = normalizeResultItems(result.mantras, result.mantraIds);

  const isInconclusive =
    String(result.confidence || "").toLowerCase() === "inconclusive";

  const problemChakras = chakraAnalysis.filter((item) => item.score > 0);
  const problemNadis = nadiAnalysis.filter((item) => item.score > 0);
  const topChakra = problemChakras[0];
  const topNadi = problemNadis[0];

  const maxChakraScore = Math.max(
    ...problemChakras.map((item) => item.score),
    1
  );
  const maxNadiScore = Math.max(...problemNadis.map((item) => item.score), 1);
  const hasProblems = problemChakras.length > 0 || problemNadis.length > 0;

  const personName = result?.userInfo?.name || "Seeker";
  const personEmail = result?.userInfo?.email || "";
  const personPhone = result?.userInfo?.phone || "";

  return (
    <PageShell
      title="Self Introspection Report"
      subtitle="Professional one-page style report with only detected areas."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/questionnaire"
            onClick={resetAnswers}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <RotateCcw size={17} />
            Retake
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-3 text-sm font-bold text-orange-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-50"
          >
            Go home
            <ArrowRight size={17} />
          </Link>
        </div>
      }
    >
      <article className="mx-auto max-w-5xl rounded-[34px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8 lg:p-10">
        <header className="border-b border-slate-200 pb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
                <ClipboardList size={15} />
                Sahajayoga Self Introspection Report
              </div>

              <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                Prepared for
              </p>

              <h1 className="mt-2 font-serif text-4xl font-bold leading-tight text-slate-950">
                {personName}
              </h1>

              <p className="mt-3 font-serif text-2xl font-bold text-orange-700">
                {hasProblems
                  ? "Focused Areas Requiring Attention"
                  : "No Strong Problem Area Detected"}
              </p>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                This report is prepared for {personName} from the selected
                answers. Balanced chakras and nadis are hidden so the report
                stays focused, clean, and practical.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 lg:min-w-[260px]">
              <ReportTableRow label="Clarity" value={result.confidence || "—"} />
              <ReportTableRow
                label="Chakra findings"
                value={problemChakras.length}
              />
              <ReportTableRow label="Nadi findings" value={problemNadis.length} />
            </div>
          </div>
        </header>

        <section className="grid gap-4 border-b border-slate-200 py-6 md:grid-cols-2">
          <div className="rounded-2xl bg-orange-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-700">
              Highest Chakra Finding
            </p>
            <p className="mt-2 font-serif text-2xl font-bold text-slate-950">
              {topChakra?.label || "None"}
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
              Highest Nadi Finding
            </p>
            <p className="mt-2 font-serif text-2xl font-bold text-slate-950">
              {topNadi?.label || "None"}
            </p>
          </div>
        </section>

        {isInconclusive && (
          <section className="border-b border-slate-200 py-6">
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-1 text-amber-700" size={22} />
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900">
                    Mixed Pattern Guidance
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-700">
                    {inconclusiveGuidance}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {!hasProblems ? (
          <section className="py-8">
            <EmptyBalancedReport />
          </section>
        ) : (
          <>
            {problemChakras.map((item, index) => (
              <FindingReportSection
                key={item.key}
                item={item}
                index={index}
                maxScore={maxChakraScore}
                type="chakra"
                remedies={remedies.filter((remedy) =>
                  itemMatchesFinding(remedy, item)
                )}
                mantras={mantras.filter((mantra) =>
                  itemMatchesFinding(mantra, item)
                )}
              />
            ))}

            {problemNadis.map((item, index) => (
              <FindingReportSection
                key={item.key}
                item={item}
                index={index}
                maxScore={maxNadiScore}
                type="nadi"
                remedies={remedies.filter((remedy) =>
                  itemMatchesFinding(remedy, item)
                )}
              />
            ))}
          </>
        )}

        <section className="border-t border-slate-200 py-8">
          <h2 className="font-serif text-3xl font-bold text-slate-950">
            General Cleansing Recommendation
          </h2>
          <ol className="mt-4 space-y-3 pl-5 text-sm leading-7 text-slate-700">
            {generalGuidance.map((item) => (
              <li key={item} className="list-decimal">
                {item}
              </li>
            ))}
          </ol>
        </section>

        <section className="border-t border-slate-200 py-8">
          <h2 className="font-serif text-3xl font-bold text-slate-950">
            Final Note
          </h2>
          <p className="mt-4 text-sm leading-8 text-slate-700">
            {finalGuidance}
          </p>
        </section>

        <DisclaimerBox short content={disclaimer} />
      </article>
    </PageShell>
  );
}
