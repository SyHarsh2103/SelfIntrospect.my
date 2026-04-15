import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Flower2,
  Loader2,
  Sparkles,
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

const getTemplateStyle = (key = "") => {
  if (key.includes("new_seeker")) {
    return {
      card: "from-emerald-50 via-white to-green-100",
      badge: "bg-emerald-100 text-emerald-800",
      icon: "bg-emerald-600 text-white shadow-emerald-200",
      border: "hover:border-emerald-400",
      button: "bg-emerald-600 group-hover:bg-emerald-700",
      glow: "bg-emerald-200/70",
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
    };
  }

  return {
    card: "from-orange-50 via-white to-emerald-100",
    badge: "bg-orange-100 text-orange-800",
    icon: "bg-orange-600 text-white shadow-orange-200",
    border: "hover:border-orange-400",
    button: "bg-orange-600 group-hover:bg-orange-700",
    glow: "bg-orange-200/70",
  };
};

export default function ProfileSelectionPage() {
  const navigate = useNavigate();
  const { saveSelectedTemplate } = useQuestionnaire();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState("");

  useEffect(() => {
    const loadTemplates = async () => {
      try {
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
      <div className="relative mx-auto max-w-6xl">
        <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-emerald-200/30 blur-3xl" />

        <Card className="relative mb-8 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-emerald-50">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-700 shadow-sm">
                <Flower2 size={15} />
                Self Introspect
              </div>

              <h2 className="mt-4 font-serif text-3xl font-bold text-slate-950">
                Begin with the right question set
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                New seekers can answer simple life and meditation questions,
                while experienced practitioners can include vibration-based
                questions.
              </p>
            </div>

            <div className="rounded-3xl bg-white/80 px-5 py-4 text-center shadow-sm">
              <p className="text-3xl font-bold text-orange-700">
                {templates.length || 0}
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Paths Available
              </p>
            </div>
          </div>
        </Card>

        {loading ? (
          <Card className="relative">
            <div className="flex items-center gap-3 text-slate-600">
              <Loader2 className="animate-spin text-orange-600" size={20} />
              <p className="text-sm font-medium">Loading guidance paths...</p>
            </div>
          </Card>
        ) : templates.length === 0 ? (
          <Card className="relative">
            <p className="text-sm leading-7 text-slate-600">
              No guidance paths are available right now. Please check admin
              template settings.
            </p>
          </Card>
        ) : (
          <div className="relative grid gap-5 md:grid-cols-2">
            {templates.map((template) => {
              const style = getTemplateStyle(template.key);
              const isSelected = selectedKey === template.key;

              return (
                <button
                  key={template._id}
                  type="button"
                  onClick={() => selectTemplate(template)}
                  className={`group relative overflow-hidden rounded-[28px] border bg-gradient-to-br ${style.card} p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    isSelected
                      ? "border-orange-500 ring-4 ring-orange-100"
                      : `border-[#eadfcb] ${style.border}`
                  }`}
                >
                  <div
                    className={`absolute -right-10 -top-10 h-36 w-36 rounded-full ${style.glow} blur-2xl transition`}
                  />

                  <div className="relative flex items-start justify-between gap-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg ${style.icon}`}
                    >
                      <Sparkles size={24} />
                    </div>

                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <CheckCircle2 size={22} className="text-orange-600" />
                      ) : null}

                      <ArrowRight
                        size={21}
                        className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-orange-600"
                      />
                    </div>
                  </div>

                  <div className="relative mt-6">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] ${style.badge}`}
                    >
                      {audienceLabels[template.audienceType] ||
                        template.audienceType}
                    </span>

                    <h2 className="mt-5 font-serif text-2xl font-bold text-slate-950">
                      {template.name}
                    </h2>

                    <p className="mt-3 min-h-[72px] text-sm leading-7 text-slate-600">
                      {template.description ||
                        "A guided question path for self-reflection and supportive Sahajayoga practice."}
                    </p>

                    {template.introText ? (
                      <div className="mt-5 rounded-2xl bg-white/70 px-4 py-3 text-sm leading-6 text-slate-600 shadow-sm">
                        {template.introText}
                      </div>
                    ) : null}

                    <div className="mt-6 flex items-center justify-between border-t border-white/70 pt-4">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Start reflection
                      </span>

                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-white shadow-sm transition ${style.button}`}
                      >
                        Continue
                        <ArrowRight size={15} />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}