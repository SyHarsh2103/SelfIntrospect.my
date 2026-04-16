import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Flower2,
  Loader2,
  Sparkles,
  UsersRound,
  ShieldCheck,
  HeartHandshake,
  Leaf,
  CircleDot,
} from "lucide-react";
import PageShell from "../components/common/PageShell";
import Card from "../components/common/Card";
import { publicApi } from "../services/api";
import { useQuestionnaire } from "../context/QuestionnaireContext";

const audienceLabels = {
  newSeeker: "New Seeker",
  beginner: "Beginner",
  regular: "Regular",
  advanced: "Advanced",
};

const audienceSubtitles = {
  newSeeker: "Simple and gentle questions for first-time seekers.",
  beginner: "Beginner-friendly reflection with basic Sahajayoga context.",
  regular: "Balanced questions for regular meditation practice.",
  advanced: "Includes deeper subtle-system and vibration-based reflection.",
};

const getTemplateStyle = (key = "") => {
  if (key.includes("new_seeker")) {
    return {
      card: "from-emerald-50 via-white to-green-100",
      badge: "bg-emerald-100 text-emerald-800",
      icon: "bg-emerald-600 text-white shadow-emerald-200",
      border: "hover:border-emerald-400",
      button: "bg-emerald-600 group-hover:bg-emerald-700",
      glow: "bg-emerald-200/70",
      ring: "ring-emerald-100",
      accent: "text-emerald-700",
    };
  }

  if (key.includes("beginner")) {
    return {
      card: "from-orange-50 via-white to-amber-100",
      badge: "bg-orange-100 text-orange-800",
      icon: "bg-orange-600 text-white shadow-orange-200",
      border: "hover:border-orange-400",
      button: "bg-orange-600 group-hover:bg-orange-700",
      glow: "bg-orange-200/70",
      ring: "ring-orange-100",
      accent: "text-orange-700",
    };
  }

  if (key.includes("regular")) {
    return {
      card: "from-sky-50 via-white to-blue-100",
      badge: "bg-sky-100 text-sky-800",
      icon: "bg-sky-600 text-white shadow-sky-200",
      border: "hover:border-sky-400",
      button: "bg-sky-600 group-hover:bg-sky-700",
      glow: "bg-sky-200/70",
      ring: "ring-sky-100",
      accent: "text-sky-700",
    };
  }

  if (key.includes("advanced")) {
    return {
      card: "from-purple-50 via-white to-fuchsia-100",
      badge: "bg-purple-100 text-purple-800",
      icon: "bg-purple-600 text-white shadow-purple-200",
      border: "hover:border-purple-400",
      button: "bg-purple-600 group-hover:bg-purple-700",
      glow: "bg-purple-200/70",
      ring: "ring-purple-100",
      accent: "text-purple-700",
    };
  }

  return {
    card: "from-orange-50 via-white to-emerald-100",
    badge: "bg-orange-100 text-orange-800",
    icon: "bg-orange-600 text-white shadow-orange-200",
    border: "hover:border-orange-400",
    button: "bg-orange-600 group-hover:bg-orange-700",
    glow: "bg-orange-200/70",
    ring: "ring-orange-100",
    accent: "text-orange-700",
  };
};

const infoCards = [
  {
    icon: Leaf,
    title: "Begin gently",
    text: "Choose the path closest to your current understanding.",
  },
  {
    icon: ShieldCheck,
    title: "No pressure",
    text: "You can select neutral answers when you are unsure.",
  },
  {
    icon: HeartHandshake,
    title: "Supportive only",
    text: "The guidance is for reflection and not a final assessment.",
  },
];

export default function ProfileSelectionPage() {
  const navigate = useNavigate();
  const { saveSelectedTemplate } = useQuestionnaire();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState("");

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        const data = await publicApi.getTemplates();
        setTemplates(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const sortedTemplates = useMemo(() => {
    const order = ["new_seeker", "beginner", "regular", "advanced"];

    return [...templates].sort((a, b) => {
      const aIndex = order.findIndex((key) => a?.key?.includes(key));
      const bIndex = order.findIndex((key) => b?.key?.includes(key));

      return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
    });
  }, [templates]);

  const selectTemplate = (template) => {
    setSelectedKey(template.key);
    saveSelectedTemplate(template);
    navigate("/center");
  };

  return (
    <PageShell
      title="Choose Your Self Introspection Path"
      subtitle="Select the option that best matches your current Sahajayoga understanding. Your questions will be adjusted based on this path."
    >
      <div className="relative mx-auto max-w-6xl overflow-hidden px-0 pb-4">
        <div className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-orange-200/30 blur-3xl sm:h-72 sm:w-72" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-56 w-56 rounded-full bg-emerald-200/30 blur-3xl sm:h-72 sm:w-72" />

        {/* HERO CARD */}
        <Card className="relative mb-6 overflow-hidden rounded-[26px] bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-4 sm:mb-8 sm:rounded-[34px] sm:p-6 lg:p-8">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-orange-200/30 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700 shadow-sm sm:px-4 sm:text-xs sm:tracking-[0.18em]">
                <Flower2 size={15} className="shrink-0" />
                <span className="truncate">Self Introspect</span>
              </div>

              <h2 className="mt-4 max-w-3xl font-serif text-2xl font-bold leading-tight text-slate-950 sm:text-3xl lg:text-4xl">
                Begin with the question set that fits your current journey.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                New seekers can start with simple life and meditation questions,
                while experienced practitioners can include vibration-based
                reflection.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {infoCards.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm backdrop-blur"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                          <Icon size={19} />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:items-stretch lg:min-w-[260px] lg:flex-col">
              <div className="rounded-3xl bg-white/85 px-5 py-4 text-center shadow-sm backdrop-blur">
                <p className="text-3xl font-bold text-orange-700">
                  {templates.length || 0}
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:text-xs">
                  Paths Available
                </p>
              </div>

              <div className="rounded-3xl bg-white/85 px-5 py-4 text-center shadow-sm backdrop-blur">
                <p className="text-3xl font-bold text-emerald-700">12</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:text-xs">
                  Guided Questions
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* LOADING / EMPTY / GRID */}
        {loading ? (
          <Card className="relative rounded-[26px] p-5 sm:rounded-[32px] sm:p-6">
            <div className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50">
                <Loader2 className="animate-spin text-orange-600" size={24} />
              </div>

              <div>
                <p className="text-base font-bold text-slate-800">
                  Loading guidance paths...
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Preparing the available self-introspection options.
                </p>
              </div>
            </div>
          </Card>
        ) : sortedTemplates.length === 0 ? (
          <Card className="relative rounded-[26px] p-5 sm:rounded-[32px] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
                <CircleDot size={22} />
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold text-slate-950">
                  No guidance paths available
                </h3>

                <p className="mt-2 text-sm leading-7 text-slate-600">
                  No guidance paths are available right now. Please check admin
                  template settings.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="relative grid gap-4 sm:gap-5 md:grid-cols-2">
            {sortedTemplates.map((template) => {
              const style = getTemplateStyle(template.key);
              const isSelected = selectedKey === template.key;
              const audienceLabel =
                audienceLabels[template.audienceType] || template.audienceType;
              const audienceSubtitle =
                audienceSubtitles[template.audienceType] ||
                "A guided path for supportive Sahajayoga reflection.";

              return (
                <button
                  key={template._id}
                  type="button"
                  onClick={() => selectTemplate(template)}
                  className={`group relative min-h-[320px] overflow-hidden rounded-[26px] border bg-gradient-to-br ${style.card} p-4 text-left shadow-sm transition duration-300 active:scale-[0.99] sm:rounded-[30px] sm:p-6 lg:min-h-[360px] lg:hover:-translate-y-1 lg:hover:shadow-xl ${
                    isSelected
                      ? `border-orange-500 ring-4 ${style.ring}`
                      : `border-[#eadfcb] ${style.border}`
                  }`}
                >
                  <div
                    className={`pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full ${style.glow} blur-2xl transition group-hover:scale-125`}
                  />

                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className={`flex h-13 w-13 items-center justify-center rounded-2xl shadow-lg sm:h-14 sm:w-14 ${style.icon}`}
                      >
                        <Sparkles size={23} />
                      </div>

                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <CheckCircle2
                            size={22}
                            className="text-orange-600"
                          />
                        ) : null}

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/75 text-slate-400 shadow-sm transition group-hover:text-orange-600">
                          <ArrowRight
                            size={20}
                            className="transition group-hover:translate-x-0.5"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <span
                        className={`inline-flex max-w-full items-center rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] sm:text-xs ${style.badge}`}
                      >
                        <span className="truncate">{audienceLabel}</span>
                      </span>

                      <h2 className="mt-5 font-serif text-2xl font-bold leading-tight text-slate-950 sm:text-[1.7rem]">
                        {template.name}
                      </h2>

                      <p className={`mt-2 text-xs font-bold ${style.accent}`}>
                        {audienceSubtitle}
                      </p>

                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {template.description ||
                          "A guided question path for self-reflection and supportive Sahajayoga practice."}
                      </p>

                      {template.introText ? (
                        <div className="mt-5 rounded-2xl border border-white/80 bg-white/75 px-4 py-3 text-sm leading-6 text-slate-600 shadow-sm">
                          {template.introText}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-auto pt-6">
                      <div className="flex items-center justify-between gap-3 border-t border-white/70 pt-4">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:text-xs">
                          Start reflection
                        </span>

                        <span
                          className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-white shadow-sm transition ${style.button}`}
                        >
                          Continue
                          <ArrowRight size={15} />
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* BOTTOM NOTE */}
        <div className="relative mt-6 rounded-[24px] border border-orange-100 bg-white/80 p-4 shadow-sm backdrop-blur sm:mt-8 sm:rounded-[30px] sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
              <UsersRound size={21} />
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold text-slate-950">
                Not sure which path to choose?
              </h3>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                Start with the simplest path. You can always retake the
                questionnaire later with a different path. The result is
                supportive guidance only and may not always be fully accurate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}