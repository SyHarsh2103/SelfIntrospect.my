import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Flower2,
  Loader2,
  RotateCcw,
  ScrollText,
  Sparkles,
} from "lucide-react";

import PageShell from "../components/common/PageShell";
import DisclaimerBox from "../components/common/DisclaimerBox";
import { publicApi } from "../services/api";
import { useQuestionnaire } from "../context/QuestionnaireContext";

const generalMeditationGuidance = [
  "Sit comfortably with both hands open and attention on Sahasrara.",
  "Raise Kundalini and give bandhan before meditation.",
  "Observe thoughts silently without forcing anything.",
  "Do a simple salt-water footsoak for 10–15 minutes if possible.",
  "Connect with experienced Sahajayogis for deeper clarity.",
];

const getContentSafely = async (key, fallback = "") => {
  try {
    const block = await publicApi.getContent(key);
    return block?.content || fallback;
  } catch {
    return fallback;
  }
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

function EmptyState({ title, message }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-1 shrink-0 text-emerald-700" size={20} />
        <div>
          <p className="font-serif text-lg font-bold text-slate-900 sm:text-xl">
            {title}
          </p>
          <p className="mt-2 text-xs leading-6 text-slate-600 sm:text-sm">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

function RemedySection({ remedies }) {
  if (!remedies.length) {
    return (
      <EmptyState
        title="No specific remedy attached yet"
        message="No specific remedy record was linked to this result. Continue with regular meditation and connect with experienced Sahajayogis for deeper guidance."
      />
    );
  }

  return (
    <div className="space-y-4">
      {remedies.map((remedy, index) => (
        <article
          key={remedy._id || `${remedy.title}-${index}`}
          className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700">
                Remedy {index + 1}
              </p>
              <h3 className="mt-1 font-serif text-lg font-bold leading-tight text-slate-950 sm:text-xl">
                {remedy.title || "Recommended Remedy"}
              </h3>
            </div>

            {remedy.duration ? (
              <span className="w-fit shrink-0 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-[11px] font-bold text-orange-700">
                {remedy.duration}
              </span>
            ) : null}
          </div>

          {Array.isArray(remedy.steps) && remedy.steps.length > 0 ? (
            <ol className="mt-4 space-y-2 pl-5 text-xs leading-6 text-slate-700 sm:text-sm">
              {remedy.steps.map((step, stepIndex) => (
                <li key={`${remedy.title}-${stepIndex}`} className="list-decimal">
                  {step}
                </li>
              ))}
            </ol>
          ) : null}

          {remedy.notes ? (
            <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-600 sm:text-sm">
              <strong className="text-slate-800">Note:</strong> {remedy.notes}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function MantraSection({ mantras }) {
  if (!mantras.length) {
    return (
      <EmptyState
        title="No specific mantra attached yet"
        message="No mantra record was linked to this result. Use this page as supportive reference and connect with experienced Sahajayogis for proper mantra guidance."
      />
    );
  }

  return (
    <div className="space-y-4">
      {mantras.map((mantra, index) => (
        <article
          key={mantra._id || `${mantra.title}-${index}`}
          className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
            Mantra {index + 1}
          </p>

          <h3 className="mt-1 font-serif text-lg font-bold leading-tight text-slate-950 sm:text-xl">
            {mantra.title || "Suggested Mantra"}
          </h3>

          {mantra.chakraId?.displayName || mantra.chakraId?.name ? (
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Related to {mantra.chakraId?.displayName || mantra.chakraId?.name}
            </p>
          ) : null}

          {mantra.mantraText ? (
            <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-semibold leading-7 text-slate-800 sm:text-sm">
              {mantra.mantraText}
            </div>
          ) : null}

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {mantra.phoneticText ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Pronunciation
                </p>
                <p className="mt-1 text-xs leading-6 text-slate-700 sm:text-sm">
                  {mantra.phoneticText}
                </p>
              </div>
            ) : null}

            {mantra.repetitions ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Repetition
                </p>
                <p className="mt-1 text-xs leading-6 text-slate-700 sm:text-sm">
                  {mantra.repetitions}
                </p>
              </div>
            ) : null}
          </div>

          {mantra.usageNotes ? (
            <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-600 sm:text-sm">
              <strong className="text-slate-800">Usage:</strong> {mantra.usageNotes}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export default function GuidancePage() {
  const { sessionId } = useParams();
  const { resetAnswers } = useQuestionnaire();

  const [result, setResult] = useState(null);
  const [disclaimer, setDisclaimer] = useState("");
  const [finalGuidance, setFinalGuidance] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadGuidance = async () => {
      try {
        setLoading(true);
        setError("");

        const resultData = await publicApi.getResult(sessionId);

        const [shortDisclaimer, finalBlock] = await Promise.all([
          getContentSafely(
            "shortDisclaimer",
            "This guidance is based on your selected answers and may not always be fully accurate. For deeper clarity, please connect with experienced Sahajayogis."
          ),
          getContentSafely(
            "finalGuidance",
            "Please use this as gentle supportive guidance only. Regular Sahajayoga meditation and connection with the collective may help you understand your inner state more clearly."
          ),
        ]);

        setResult(resultData);
        setDisclaimer(shortDisclaimer);
        setFinalGuidance(finalBlock);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load guidance."
        );
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) loadGuidance();
  }, [sessionId]);

  if (loading) {
    return (
      <PageShell title="Preparing guidance">
        <div className="mx-auto max-w-2xl rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50">
              <Loader2 className="animate-spin text-orange-600" size={22} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Preparing guidance...
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                Loading remedies, mantras, and meditation support.
              </p>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  if (error || !result) {
    return (
      <PageShell title="Guidance not available">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-100 bg-white p-5 shadow-sm sm:p-8">
          <p className="text-sm leading-7 text-red-700">
            {error || "No guidance was found for this session."}
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

  const remedies = normalizeResultItems(result.remedies, result.remedyIds);
  const mantras = normalizeResultItems(result.mantras, result.mantraIds);

  return (
    <PageShell
      title="Guidance Report"
      subtitle="Concise remedies, mantras, and meditation support based on your self-introspection report."
      actions={
        <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-3">
          <Link
            to={`/result/${sessionId}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-200 bg-white px-5 py-2.5 text-xs font-bold text-orange-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-50 sm:px-6 sm:py-3 sm:text-sm"
          >
            <ArrowLeft size={16} />
            Back to Report
          </Link>

          <Link
            to="/questionnaire"
            onClick={resetAnswers}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl sm:px-6 sm:py-3 sm:text-sm"
          >
            <RotateCcw size={16} />
            Retake
          </Link>
        </div>
      }
    >
      <article className="mx-auto max-w-5xl rounded-[26px] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60 sm:rounded-[34px] sm:p-7 lg:p-8">
        <header className="border-b border-slate-200 pb-5 sm:pb-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700 sm:px-4 sm:tracking-[0.18em]">
                <ClipboardList size={14} className="shrink-0" />
                <span className="truncate">Sahajayoga Guidance</span>
              </div>

              <h1 className="mt-4 font-serif text-2xl font-bold leading-tight text-slate-950 sm:text-3xl lg:text-4xl">
                Remedies, Mantras & Meditation Support
              </h1>

              <p className="mt-3 max-w-3xl text-xs leading-6 text-slate-600 sm:text-sm sm:leading-7">
                This page presents practical next steps separately from the
                report. Use it respectfully as supportive guidance, not as a
                final spiritual assessment.
              </p>
            </div>

            <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:max-w-xs sm:p-4">
              <ReportTableRow label="Clarity" value={result.confidence || "—"} />
              <ReportTableRow
                label="Session"
                value={sessionId ? `${sessionId.slice(0, 8)}...` : "—"}
              />
            </div>
          </div>
        </header>

        <section className="border-b border-slate-200 py-5 sm:py-6">
          <div className="rounded-3xl bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-sm">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-slate-950 sm:text-2xl">
                  General Meditation Support
                </h2>
                <p className="mt-2 text-xs leading-6 text-slate-700 sm:text-sm sm:leading-7">
                  These practices may help you observe your inner state with
                  calm attention, thoughtless awareness, and vibrations.
                </p>

                <ol className="mt-4 grid gap-2 text-xs leading-6 text-slate-700 sm:text-sm lg:grid-cols-2">
                  {generalMeditationGuidance.map((item, index) => (
                    <li
                      key={item}
                      className="flex gap-2 rounded-2xl border border-white/80 bg-white/70 px-3 py-2 shadow-sm"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[10px] font-bold text-orange-700">
                        {index + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 py-5 sm:py-6">
          <div className="mb-4 flex items-center gap-3 sm:mb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <Flower2 size={21} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-700">
                Remedies
              </p>
              <h2 className="font-serif text-2xl font-bold text-slate-950 sm:text-3xl">
                Recommended Remedies
              </h2>
            </div>
          </div>

          <RemedySection remedies={remedies} />
        </section>

        <section className="border-b border-slate-200 py-5 sm:py-6">
          <div className="mb-4 flex items-center gap-3 sm:mb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ScrollText size={21} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">
                Mantras
              </p>
              <h2 className="font-serif text-2xl font-bold text-slate-950 sm:text-3xl">
                Suggested Mantras
              </h2>
            </div>
          </div>

          <MantraSection mantras={mantras} />
        </section>

        <section className="border-b border-slate-200 py-5 sm:py-6">
          <h2 className="font-serif text-xl font-bold text-slate-950 sm:text-2xl">
            Final Note
          </h2>
          <p className="mt-2 text-xs leading-6 text-slate-700 sm:text-sm sm:leading-7">
            {finalGuidance}
          </p>
        </section>

        <DisclaimerBox short content={disclaimer} />
      </article>
    </PageShell>
  );
}