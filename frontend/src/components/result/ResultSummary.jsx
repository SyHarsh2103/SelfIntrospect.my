import {
  Activity,
  CheckCircle2,
  Flower2,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";
import Card from "../common/Card";

const getStatus = (score = 0) => {
  if (score <= 0) {
    return {
      label: "Balanced",
      className: "bg-emerald-50 border-emerald-200 text-emerald-800",
      bar: "bg-emerald-500",
      icon: CheckCircle2,
      glow: "shadow-emerald-100",
    };
  }

  if (score <= 2) {
    return {
      label: "Mild Attention",
      className: "bg-sky-50 border-sky-200 text-sky-800",
      bar: "bg-sky-500",
      icon: Waves,
      glow: "shadow-sky-100",
    };
  }

  if (score <= 5) {
    return {
      label: "Need to Work",
      className: "bg-amber-50 border-amber-200 text-amber-800",
      bar: "bg-amber-500",
      icon: Activity,
      glow: "shadow-amber-100",
    };
  }

  return {
    label: "Strong Attention",
    className: "bg-orange-50 border-orange-200 text-orange-800",
    bar: "bg-orange-600",
    icon: Sparkles,
    glow: "shadow-orange-100",
  };
};

function GuidanceCard({ item, index, maxScore }) {
  const status = getStatus(Number(item.score || 0));
  const Icon = status.icon;
  const percentage =
    maxScore > 0 ? Math.min((Number(item.score || 0) / maxScore) * 100, 100) : 0;

  return (
    <div
      className={`group rounded-[26px] border bg-white p-5 shadow-lg transition hover:-translate-y-1 hover:shadow-xl ${status.glow}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${status.className}`}>
            <Icon size={20} />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
              Rank #{index + 1}
            </p>
            <h3 className="mt-1 font-serif text-xl font-bold leading-7 text-slate-900">
              {item.label}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Score: {Number(item.score || 0)}
            </p>
          </div>
        </div>

        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}>
          {status.label}
        </span>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${status.bar} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function ResultSummary({ result }) {
  const chakraRanking = Array.isArray(result?.chakraRanking)
    ? result.chakraRanking
    : [];
  const nadiRanking = Array.isArray(result?.nadiRanking)
    ? result.nadiRanking
    : [];

  const maxChakraScore = Math.max(
    ...chakraRanking.map((item) => Number(item.score || 0)),
    1
  );

  const maxNadiScore = Math.max(
    ...nadiRanking.map((item) => Number(item.score || 0)),
    1
  );

  const requiredChakras = chakraRanking.filter(
    (item) => Number(item.score || 0) > 0
  );

  const balancedChakras = chakraRanking.filter(
    (item) => Number(item.score || 0) <= 0
  );

  const topChakra = chakraRanking[0];
  const topNadi = nadiRanking[0];

  return (
    <div className="space-y-7">
      <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-emerald-50">
        <div className="absolute -left-20 top-10 h-52 w-52 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-52 w-52 rounded-full bg-emerald-200/30 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-700 shadow-sm">
            <Flower2 size={15} />
            Complete subtle-system view
          </div>

          <h2 className="mt-4 font-serif text-3xl font-bold text-slate-950">
            Full chakra and nadi overview
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            This result shows all chakras and channels. Areas marked as “Need to
            Work” or “Strong Attention” may need more observation, cleansing, or
            guidance.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl bg-white/85 px-5 py-4 shadow-sm">
              <Sparkles className="text-orange-600" size={22} />
              <p className="mt-2 text-3xl font-bold text-orange-700">
                {requiredChakras.length}
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Chakras to observe
              </p>
            </div>

            <div className="rounded-3xl bg-white/85 px-5 py-4 shadow-sm">
              <CheckCircle2 className="text-emerald-600" size={22} />
              <p className="mt-2 text-3xl font-bold text-emerald-700">
                {balancedChakras.length}
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Balanced areas
              </p>
            </div>

            <div className="rounded-3xl bg-white/85 px-5 py-4 shadow-sm">
              <Activity className="text-amber-600" size={22} />
              <p className="mt-2 text-lg font-bold text-slate-900">
                {topChakra?.label || "—"}
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Highest chakra
              </p>
            </div>

            <div className="rounded-3xl bg-white/85 px-5 py-4 shadow-sm">
              <ShieldCheck className="text-sky-600" size={22} />
              <p className="mt-2 text-lg font-bold text-slate-900">
                {result?.confidence || "—"}
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Guidance clarity
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3">
          <Sparkles className="text-orange-600" size={22} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
              Chakra details
            </p>
            <h3 className="mt-1 font-serif text-2xl font-bold text-slate-900">
              All chakras by attention level
            </h3>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {chakraRanking.map((item, index) => (
            <GuidanceCard
              key={item.key || item.label}
              item={item}
              index={index}
              maxScore={maxChakraScore}
            />
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3">
          <Waves className="text-emerald-600" size={22} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Nadi details
            </p>
            <h3 className="mt-1 font-serif text-2xl font-bold text-slate-900">
              All channels by activity level
            </h3>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {nadiRanking.map((item, index) => (
            <GuidanceCard
              key={item.key || item.label}
              item={item}
              index={index}
              maxScore={maxNadiScore}
            />
          ))}
        </div>

        {topNadi ? (
          <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm leading-7 text-emerald-800">
            The most active channel tendency appears as{" "}
            <strong>{topNadi.label}</strong>. Please read this gently as a
            reflection, not as a final conclusion.
          </div>
        ) : null}
      </Card>
    </div>
  );
}