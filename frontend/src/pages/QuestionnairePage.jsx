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
  X,
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
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({
    name: "",
    phone: "",
    email: "",
  });

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

  const completed = useMemo(() => {
    return questions.filter((question) => {
      const answer = answers[question._id];

      if (!answer) return false;

      if (question.type === "intensity") {
        return Boolean(answer.intensityLevel);
      }

      return Array.isArray(answer.selectedOptionIds)
        ? answer.selectedOptionIds.length > 0
        : false;
    }).length;
  }, [questions, answers]);

  const progressValue = questions.length
    ? Math.round((completed / questions.length) * 100)
    : 0;

  const canProceed = () => {
    if (!current) return false;

    if (current.type === "intensity") {
      return Boolean(currentAnswer?.intensityLevel);
    }

    return Array.isArray(currentAnswer?.selectedOptionIds)
      ? currentAnswer.selectedOptionIds.length > 0
      : false;
  };

  const handleSubmit = async () => {
    if (!userForm.name.trim()) {
      setError("Please enter your name before generating the result.");
      return;
    }

    if (!userForm.phone.trim()) {
      setError("Please enter your phone number before generating the result.");
      return;
    }

    if (!userForm.email.trim()) {
      setError("Please enter your email ID before generating the result.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        sessionId: getStoredSessionId(),
        templateKey: selectedTemplate?.key || "regular_sahajayogi",
        audienceType: selectedTemplate?.audienceType || "regular",
        userInfo: {
          name: userForm.name.trim(),
          phone: userForm.phone.trim(),
          email: userForm.email.trim().toLowerCase(),
        },
        answers: questions.map((question) => ({
          questionId: question._id,
          selectedOptionIds: answers[question._id]?.selectedOptionIds || [],
          intensityLevel: answers[question._id]?.intensityLevel || null,
        })),
      };

      const result = await publicApi.submit(payload);
      const sessionId = result?.sessionId || result?.data?.sessionId;

      if (!sessionId) {
        throw new Error("Result session ID was not returned.");
      }

      storeSessionId(sessionId);
      navigate(`/result/${sessionId}`);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong while generating your guidance."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openUserForm = () => {
    setError("");

    if (completed !== questions.length) {
      setError("Please answer all questions before generating your result.");
      return;
    }

    setShowUserForm(true);
  };

  if (loadingQuestions) {
    return (
      <PageShell
        title="Questionnaire"
        subtitle="Loading your guided questions..."
      >
        <div className="mx-auto max-w-3xl rounded-[28px] border border-orange-100 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2 className="animate-spin text-orange-600" size={22} />
            <p className="text-sm font-semibold">Loading questions...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (error && questions.length === 0) {
    return (
      <PageShell title="Questionnaire" subtitle="Unable to continue right now.">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Self Introspection Questions"
      subtitle="Answer slowly and honestly. Choose neutral options when you are unsure."
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="overflow-hidden rounded-[32px] border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-700 shadow-sm">
                <Flower2 size={15} />
                {selectedTemplate?.name || "Guided Reflection"}
              </div>

              <h2 className="mt-4 font-serif text-3xl font-bold text-slate-950">
                Question {index + 1} of {questions.length}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                Complete each step with calm attention. Your result will be
                generated only after all questions are answered.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/80 px-4 py-3 text-center shadow-sm">
                <p className="text-2xl font-bold text-orange-700">
                  {completed}
                </p>
                <p className="text-xs font-semibold text-slate-500">Answered</p>
              </div>

              <div className="rounded-2xl bg-white/80 px-4 py-3 text-center shadow-sm">
                <p className="text-2xl font-bold text-emerald-700">
                  {questions.length - completed}
                </p>
                <p className="text-xs font-semibold text-slate-500">Left</p>
              </div>

              <div className="col-span-2 rounded-2xl bg-white/80 px-4 py-3 text-center shadow-sm sm:col-span-1">
                <p className="text-2xl font-bold text-slate-900">
                  {progressValue}%
                </p>
                <p className="text-xs font-semibold text-slate-500">Progress</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <ProgressBar
              value={((index + 1) / questions.length) * 100}
              label={`Current step ${index + 1} of ${questions.length}`}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="rounded-[32px] border border-orange-100 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-orange-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
                  {current?.category || "Question"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {current?.type === "multiple-choice"
                    ? "You may select multiple answers."
                    : current?.type === "intensity"
                      ? "Select the intensity level."
                      : "Select one answer."}
                </p>
              </div>

              {canProceed() ? (
                <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                  <CheckCircle2 size={15} />
                  Answered
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                  <HelpCircle size={15} />
                  Required
                </div>
              )}
            </div>

            {current?.type === "intensity" ? (
              <IntensitySelector
                question={current}
                value={currentAnswer}
                onSelect={(payload) => saveAnswer(current._id, payload)}
              />
            ) : (
              <QuestionCard
                question={current}
                value={currentAnswer}
                onSelect={(payload) => saveAnswer(current._id, payload)}
              />
            )}
          </div>

          <aside className="rounded-[32px] border border-orange-100 bg-white p-5 shadow-sm">
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
              Results are supportive guidance, not a final diagnosis.
            </div>

            <div className="mt-5 space-y-2">
              {questions.map((question, questionIndex) => {
                const answered = Boolean(answers[question._id]);
                const active = questionIndex === index;

                return (
                  <button
                    key={question._id}
                    type="button"
                    onClick={() => setIndex(questionIndex)}
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
        </div>

        <div className="flex flex-col gap-4 rounded-[30px] border border-orange-100 bg-white/90 p-4 shadow-lg shadow-orange-100/40 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            disabled={index === 0 || submitting}
            onClick={() => setIndex((prev) => Math.max(prev - 1, 0))}
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

          {index < questions.length - 1 ? (
            <button
              type="button"
              disabled={!canProceed() || submitting}
              onClick={() => setIndex((prev) => prev + 1)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              Next
              <ArrowRight size={17} />
            </button>
          ) : (
            <button
              type="button"
              disabled={
                !canProceed() || completed !== questions.length || submitting
              }
              onClick={openUserForm}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-orange-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={17} />
                  Generating...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {showUserForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-[32px] bg-white shadow-2xl shadow-slate-950/30">
            <div className="relative bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-6">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowUserForm(false)}
                className="absolute right-5 top-5 rounded-full bg-white p-2 text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} />
              </button>

              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-700 shadow-sm">
                <Flower2 size={15} />
                Before Showing Result
              </div>

              <h2 className="mt-4 font-serif text-3xl font-bold text-slate-950">
                Please fill your details
              </h2>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                We will use this information to keep a record of your guidance request and contact you only for Sahajayoga follow-up or support.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-4 p-6"
            >
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  placeholder="Enter your full name"
                  className="w-full rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={userForm.phone}
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  required
                  placeholder="Enter your phone number"
                  className="w-full rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Email ID
                </label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                  placeholder="Enter your email ID"
                  className="w-full rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div className="rounded-2xl bg-orange-50 px-4 py-3 text-xs leading-6 text-orange-800">
                Your result is supportive guidance only and may not always be fully accurate. For deeper clarity, please connect with experienced Sahajayogis.
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowUserForm(false)}
                  className="inline-flex items-center justify-center rounded-full border border-orange-200 bg-white px-6 py-3 text-sm font-bold text-orange-700 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-orange-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={17} />
                      Generating...
                    </>
                  ) : (
                    <>
                      Submit & See Result
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}