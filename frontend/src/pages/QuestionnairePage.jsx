import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Flower2,
  HelpCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import PageShell from "../components/common/PageShell";
import ProgressBar from "../components/common/ProgressBar";
import QuestionCard from "../components/questionnaire/QuestionCard";
import IntensitySelector from "../components/questionnaire/IntensitySelector";

import { publicApi } from "../services/api";
import { useQuestionnaire } from "../context/QuestionnaireContext";
import { getStoredSessionId, storeSessionId } from "../hooks/useSession";

export default function QuestionnairePage() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { answers, saveAnswer, selectedTemplate } = useQuestionnaire();

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoadingQuestions(true);
        setError("");

        const data = await publicApi.getQuestions(
          selectedTemplate?.key || "regular_sahajayogi"
        );

        setQuestions(Array.isArray(data) ? data : []);
        setIndex(0);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load questions."
        );
      } finally {
        setLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, [selectedTemplate?.key]);

  const current = questions[index];
  const currentAnswer = current ? answers[current._id] : null;

  const isQuestionAnswered = (question) => {
    const answer = answers[question._id];

    if (!answer) return false;

    if (question.type === "intensity") {
      return Boolean(answer.intensityLevel);
    }

    return Array.isArray(answer.selectedOptionIds)
      ? answer.selectedOptionIds.length > 0
      : false;
  };

  const completed = useMemo(() => {
    return questions.filter((question) => isQuestionAnswered(question)).length;
  }, [questions, answers]);

  const progressValue = questions.length
    ? Math.round((completed / questions.length) * 100)
    : 0;

  const currentStepValue = questions.length
    ? Math.round(((index + 1) / questions.length) * 100)
    : 0;

  const canProceed = () => {
    if (!current) return false;
    return isQuestionAnswered(current);
  };

  const getUnansweredQuestions = () => {
    return questions.filter((question) => !isQuestionAnswered(question));
  };

  const handleSubmit = async () => {
    const unansweredQuestions = getUnansweredQuestions();

    if (unansweredQuestions.length > 0) {
      setError("Please answer all questions before generating your result.");

      const firstUnansweredIndex = questions.findIndex(
        (question) => String(question._id) === String(unansweredQuestions[0]._id)
      );

      if (firstUnansweredIndex >= 0) {
        setIndex(firstUnansweredIndex);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        sessionId: getStoredSessionId(),
        templateKey: selectedTemplate?.key || "regular_sahajayogi",
        audienceType: selectedTemplate?.audienceType || "regular",
        answers: questions.map((question) => ({
          questionId: question._id,
          selectedOptionIds: answers[question._id]?.selectedOptionIds || [],
          intensityLevel: answers[question._id]?.intensityLevel || null,
        })),
      };

      const result = await publicApi.submit(payload);
      const resultSessionId = result?.sessionId || result?.data?.sessionId;

      if (!resultSessionId) {
        throw new Error("Result session ID was not returned.");
      }

      storeSessionId(resultSessionId);
      navigate(`/result/${resultSessionId}`);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong while generating your result. Please check backend submit API and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const goToPrevious = () => {
    setIndex((prev) => Math.max(prev - 1, 0));
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToNext = () => {
    if (!canProceed()) {
      setError("Please select an answer before moving to the next question.");
      return;
    }

    setIndex((prev) => Math.min(prev + 1, questions.length - 1));
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToQuestion = (questionIndex) => {
    setIndex(questionIndex);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getQuestionTypeLabel = () => {
    if (!current) return "Question";

    if (current.type === "multiple-choice") {
      return "You may select multiple answers.";
    }

    if (current.type === "intensity") {
      return "Select the intensity level.";
    }

    return "Select one answer.";
  };

  const renderActionButton = (isMobile = false) => {
    const baseClass = isMobile
      ? "inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold shadow-lg transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      : "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-bold shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

    if (index < questions.length - 1) {
      return (
        <button
          type="button"
          disabled={!canProceed() || submitting}
          onClick={goToNext}
          className={`${baseClass} bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-orange-200`}
        >
          Next
          <ArrowRight size={18} />
        </button>
      );
    }

    return (
      <button
        type="button"
        disabled={!canProceed() || submitting}
        onClick={handleSubmit}
        className={`${baseClass} bg-gradient-to-r from-emerald-600 to-orange-500 text-white shadow-emerald-200`}
      >
        {submitting ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Generating...
          </>
        ) : (
          <>
            See Result
            <ArrowRight size={18} />
          </>
        )}
      </button>
    );
  };

  if (loadingQuestions) {
    return (
      <PageShell
        title="Questionnaire"
        subtitle="Loading your guided questions..."
      >
        <div className="mx-auto max-w-3xl rounded-[26px] border border-orange-100 bg-white p-6 shadow-sm sm:rounded-[32px] sm:p-8">
          <div className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50">
              <Loader2 className="animate-spin text-orange-600" size={24} />
            </div>

            <div>
              <p className="text-base font-bold text-slate-800">
                Loading questions...
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Please keep calm attention while the questionnaire is prepared.
              </p>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  if (error && questions.length === 0) {
    return (
      <PageShell title="Questionnaire" subtitle="Unable to continue right now.">
        <div className="mx-auto max-w-3xl rounded-[26px] border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-700 sm:rounded-[32px] sm:p-6">
          {error}
        </div>
      </PageShell>
    );
  }

  if (!questions.length) {
    return (
      <PageShell title="Questionnaire" subtitle="No questions are available.">
        <div className="mx-auto max-w-3xl rounded-[26px] border border-orange-100 bg-orange-50 p-5 text-sm leading-6 text-orange-800 sm:rounded-[32px] sm:p-6">
          No active questions are available right now. Please contact the admin
          or try again later.
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Self Introspection Questions"
      subtitle="Answer slowly and honestly. Choose neutral options when you are unsure."
    >
      <div className="mx-auto max-w-6xl space-y-5 pb-6 sm:space-y-6 lg:pb-0">
        <section className="overflow-hidden rounded-[26px] border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-4 shadow-sm sm:rounded-[34px] sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700 shadow-sm sm:px-4 sm:text-xs sm:tracking-[0.18em]">
                <Flower2 size={15} className="shrink-0" />
                <span className="truncate">
                  {selectedTemplate?.name || "Guided Reflection"}
                </span>
              </div>

              <h2 className="mt-4 font-serif text-2xl font-bold leading-tight text-slate-950 sm:text-3xl lg:text-4xl">
                Question {index + 1} of {questions.length}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                Complete each step with calm attention. Your result will be
                generated only after all questions are answered.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:min-w-[360px]">
              <div className="rounded-2xl bg-white/85 px-3 py-3 text-center shadow-sm sm:px-4">
                <p className="text-xl font-bold text-orange-700 sm:text-2xl">
                  {completed}
                </p>
                <p className="text-[11px] font-semibold text-slate-500 sm:text-xs">
                  Answered
                </p>
              </div>

              <div className="rounded-2xl bg-white/85 px-3 py-3 text-center shadow-sm sm:px-4">
                <p className="text-xl font-bold text-emerald-700 sm:text-2xl">
                  {questions.length - completed}
                </p>
                <p className="text-[11px] font-semibold text-slate-500 sm:text-xs">
                  Left
                </p>
              </div>

              <div className="rounded-2xl bg-white/85 px-3 py-3 text-center shadow-sm sm:px-4">
                <p className="text-xl font-bold text-slate-900 sm:text-2xl">
                  {progressValue}%
                </p>
                <p className="text-[11px] font-semibold text-slate-500 sm:text-xs">
                  Done
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <ProgressBar
              value={currentStepValue}
              label={`Current step ${index + 1} of ${questions.length}`}
            />
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {questions.map((question, questionIndex) => {
              const answered = isQuestionAnswered(question);
              const active = questionIndex === index;

              return (
                <button
                  key={question._id}
                  type="button"
                  onClick={() => goToQuestion(questionIndex)}
                  className={`flex h-10 min-w-10 items-center justify-center rounded-full border text-xs font-bold transition ${
                    active
                      ? "border-orange-600 bg-orange-600 text-white shadow-sm"
                      : answered
                        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-500"
                  }`}
                  aria-label={`Go to question ${questionIndex + 1}`}
                >
                  {answered && !active ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    questionIndex + 1
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6">
          <main className="rounded-[26px] border border-orange-100 bg-white p-4 shadow-sm sm:rounded-[34px] sm:p-5 lg:p-6">
            <div className="mb-5 flex flex-col gap-4 border-b border-orange-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
                  {current?.category || "Question"}
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {getQuestionTypeLabel()}
                </p>
              </div>

              {canProceed() ? (
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                  <CheckCircle2 size={15} />
                  Answered
                </div>
              ) : (
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                  <HelpCircle size={15} />
                  Required
                </div>
              )}
            </div>

            <div className="min-h-[360px]">
              {current?.type === "intensity" ? (
                <IntensitySelector
                  question={current}
                  value={currentAnswer}
                  onSelect={(payload) => {
                    saveAnswer(current._id, payload);
                    setError("");
                  }}
                />
              ) : (
                <QuestionCard
                  question={current}
                  value={currentAnswer}
                  onSelect={(payload) => {
                    saveAnswer(current._id, payload);
                    setError("");
                  }}
                />
              )}
            </div>

            <div className="mt-6 grid grid-cols-[56px_1fr] gap-3 border-t border-orange-100 pt-5 sm:hidden">
              <button
                type="button"
                disabled={index === 0 || submitting}
                onClick={goToPrevious}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-700 shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous question"
              >
                <ArrowLeft size={19} />
              </button>

              {renderActionButton(true)}

              <Link
                to="/profile"
                className="col-span-2 inline-flex min-h-11 items-center justify-center rounded-full border border-slate-100 bg-slate-50 px-4 text-sm font-bold text-slate-600"
              >
                Change Path
              </Link>
            </div>
          </main>

          <aside className="hidden rounded-[34px] border border-orange-100 bg-white p-5 shadow-sm lg:block">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-orange-600" />
              <h3 className="font-serif text-xl font-bold text-slate-900">
                Gentle Reminder
              </h3>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-600">
              There is no right or wrong answer. Select what feels closest to
              your current state.
            </p>

            <div className="mt-5 rounded-2xl bg-orange-50 px-4 py-3 text-sm leading-6 text-orange-800">
              Results are supportive guidance, not a final spiritual
              assessment.
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <ShieldCheck className="mt-0.5 text-emerald-700" size={18} />
              <p className="text-xs font-semibold leading-6 text-emerald-800">
                Neutral options help protect result accuracy when you are not
                sure.
              </p>
            </div>

            <div className="mt-5 max-h-[360px] space-y-2 overflow-y-auto pr-1">
              {questions.map((question, questionIndex) => {
                const answered = isQuestionAnswered(question);
                const active = questionIndex === index;

                return (
                  <button
                    key={question._id}
                    type="button"
                    onClick={() => goToQuestion(questionIndex)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition ${
                      active
                        ? "bg-orange-600 text-white"
                        : answered
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-50 text-slate-500 hover:bg-orange-50 hover:text-orange-700"
                    }`}
                  >
                    <span>Question {questionIndex + 1}</span>
                    {answered ? <CheckCircle2 size={14} /> : null}
                  </button>
                );
              })}
            </div>
          </aside>
        </section>

        <section className="hidden rounded-[28px] border border-orange-100 bg-white/95 p-4 shadow-lg shadow-orange-100/40 backdrop-blur sm:block">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              disabled={index === 0 || submitting}
              onClick={goToPrevious}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-3 text-sm font-bold text-orange-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            >
              <ArrowLeft size={17} />
              Previous
            </button>

            <Link
              to="/profile"
              className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-50 hover:text-orange-700"
            >
              Change Path
            </Link>

            {renderActionButton(false)}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
   