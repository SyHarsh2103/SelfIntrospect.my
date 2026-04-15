import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CircleHelp,
  FileText,
  HeartHandshake,
  ScrollText,
  Sparkles,
  Users,
  Layers,
} from "lucide-react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import Card from "../../components/common/Card";
import { adminApi } from "../../services/api";

function StatCard({ title, value, note, icon: Icon }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-3 font-serif text-3xl font-bold text-slate-900">
            {value}
          </h3>
          {note ? <p className="mt-2 text-xs text-slate-500">{note}</p> : null}
        </div>

        <div className="rounded-2xl bg-orange-50 p-3 text-orange-700">
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
}

function QuickLinkCard({ title, description, to, icon: Icon }) {
  return (
    <Link to={to}>
      <div className="group rounded-2xl border border-[#eadfcb] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div className="rounded-2xl bg-orange-50 p-3 text-orange-700">
            <Icon size={20} />
          </div>
          <ArrowRight
            size={18}
            className="text-slate-400 transition group-hover:text-orange-700"
          />
        </div>

        <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
      </div>
    </Link>
  );
}

const countUniqueUsers = (results = []) => {
  const unique = new Set();

  results.forEach((item) => {
    const email = item?.userInfo?.email;
    const phone = item?.userInfo?.phone;
    const name = item?.userInfo?.name;

    if (email) unique.add(`email:${email}`);
    else if (phone) unique.add(`phone:${phone}`);
    else if (name) unique.add(`name:${name}`);
    else if (item.sessionId) unique.add(`session:${item.sessionId}`);
  });

  return unique.size;
};

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [templateCount, setTemplateCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");
        const [analyticsData, questionsData, templatesData] = await Promise.all([
          adminApi.getAnalytics(),
          adminApi.getQuestions(),
          adminApi.getTemplates?.() || [],
        ]);

        setAnalytics(analyticsData || {});
        setQuestionCount(Array.isArray(questionsData) ? questionsData.length : 0);
        setTemplateCount(Array.isArray(templatesData) ? templatesData.length : 0);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load dashboard analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const recentResults = analytics?.recentResults || [];

  const totalUsers = useMemo(() => {
    return (
      analytics?.totalUsers ??
      analytics?.uniqueUsers ??
      analytics?.totalSeekers ??
      countUniqueUsers(recentResults)
    );
  }, [analytics, recentResults]);

  const totalQuestions = useMemo(() => {
    return (
      analytics?.totalQuestions ??
      analytics?.questionCount ??
      analytics?.questionsCount ??
      questionCount ??
      0
    );
  }, [analytics, questionCount]);

  const totalTemplates = useMemo(() => {
    return (
      analytics?.totalTemplates ??
      analytics?.templateCount ??
      analytics?.templatesCount ??
      templateCount ??
      0
    );
  }, [analytics, templateCount]);

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <section className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
          <div className="overflow-hidden rounded-[28px] bg-gradient-to-r from-[#d4500a] via-[#df6a12] to-[#d08b15] p-7 text-white shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-50/90">
              Admin Overview
            </p>
            <h2 className="mt-3 max-w-2xl font-serif text-4xl font-bold leading-tight">
              Manage the full Sahajayoga guidance experience
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-orange-50/95">
              Update public-facing questions, spiritual guidance text, remedies,
              mantras, and subtle-system content from one organized workspace.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/admin/questions"
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-orange-700 shadow-sm"
              >
                Open Question Manager
              </Link>
              <Link
                to="/admin/content"
                className="rounded-2xl border border-white/40 px-5 py-3 text-sm font-semibold text-white"
              >
                Edit Content Blocks
              </Link>
            </div>
          </div>

          <Card className="bg-white">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-orange-50 p-3 text-orange-700">
                <BarChart3 size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Dashboard Notes
                </h3>
                <p className="text-sm text-slate-500">
                  Keep guidance soft and spiritually respectful.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Use qualifying language in all public content such as “may
                indicate” and “based on your answers.”
              </p>
              <p>
                Maintain neutral answer options where appropriate so seekers are
                never forced into inaccurate choices.
              </p>
              <p>
                Review remedies and mantras regularly to keep result pages
                useful, gentle, and aligned.
              </p>
            </div>
          </Card>
        </section>

        {error ? (
          <Card className="border-red-200 bg-red-50">
            <p className="text-sm text-red-700">{error}</p>
          </Card>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Completions"
            value={loading ? "..." : analytics?.totalCompletions ?? 0}
            note="Questionnaire submissions"
            icon={BarChart3}
          />
          <StatCard
            title="Total User"
            value={loading ? "..." : totalUsers ?? 0}
            note="Users collected from result history"
            icon={Users}
          />
          <StatCard
            title="Total Questions"
            value={loading ? "..." : totalQuestions ?? 0}
            note="Active/available questionnaire records"
            icon={CircleHelp}
          />
          <StatCard
            title="Total Template"
            value={loading ? "..." : totalTemplates ?? 0}
            note="Questionnaire templates in the system"
            icon={Layers}
          />
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-2xl font-bold text-slate-900">
                Quick Access
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Jump directly into common admin modules.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <QuickLinkCard
              title="Questions"
              description="Manage questionnaire content, flow, and core structure."
              to="/admin/questions"
              icon={CircleHelp}
            />
            <QuickLinkCard
              title="Options"
              description="Update answer choices and score mappings."
              to="/admin/options"
              icon={FileText}
            />
            <QuickLinkCard
              title="Remedies"
              description="Maintain supportive cleansing and balancing guidance."
              to="/admin/remedies"
              icon={HeartHandshake}
            />
            <QuickLinkCard
              title="Mantras"
              description="Edit mantra text, pronunciation, and repetition guidance."
              to="/admin/mantras"
              icon={ScrollText}
            />
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Recent Result History
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Latest questionnaire submissions with seeker contact details.
                </p>
              </div>
            </div>

            {loading ? (
              <p className="mt-6 text-sm text-slate-500">
                Loading recent results...
              </p>
            ) : recentResults.length === 0 ? (
              <p className="mt-6 text-sm text-slate-500">
                No questionnaire submissions yet.
              </p>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#eadfcb] bg-[#fbf7ef] text-slate-700">
                      <th className="px-4 py-3 font-semibold">Name</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentResults.map((item) => (
                      <tr
                        key={item._id}
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {item.userInfo?.name || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.userInfo?.email || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.userInfo?.phone || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="text-xl font-semibold text-slate-900">
              Content Care Tips
            </h3>

            <div className="mt-5 space-y-4">
              {[
                "Keep all public guidance gentle, reflective, and non-absolute.",
                "Use disclaimers clearly on the home and result pages.",
                "Review chakra and nadi descriptions for clarity and consistency.",
                "Ensure remedies remain practical and spiritually respectful.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-[#fbf7ef] px-4 py-4 text-sm leading-7 text-slate-600"
                >
                  {item}
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </AdminLayout>
  );
}
