import { Link } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  Leaf,
  ShieldCheck,
  Sparkles,
  Flower2,
  Flame,
  Wind,
  CheckCircle2,
  HelpCircle,
  HandHeart,
  SunMedium,
  Waves,
  CircleDot,
} from "lucide-react";
import PublicLayout from "../components/layout/PublicLayout";
import Card from "../components/common/Card";
import DisclaimerBox from "../components/common/DisclaimerBox";

const userTypes = [
  "New Seekers",
  "Beginner Sahajayogis",
  "Regular Sahajayogis",
  "Vibration-aware Sahajayogis",
];

const steps = [
  {
    icon: Heart,
    title: "Choose your path",
    text: "Select your current Sahajayoga understanding level so the flow feels simple and relevant.",
  },
  {
    icon: Leaf,
    title: "Answer gently",
    text: "Reflect on your meditation, vibrations, emotions, and subtle experience without pressure.",
  },
  {
    icon: ShieldCheck,
    title: "Receive guidance",
    text: "Get supportive chakra, nadi, cleansing, remedy, and mantra guidance based on your answers.",
  },
];

const stats = [
  { icon: Flower2, value: "8", label: "Subtle Areas" },
  { icon: Flame, value: "3", label: "Nadis" },
  { icon: HelpCircle, value: "12", label: "Guided Questions" },
];

const highlights = [
  {
    icon: Wind,
    title: "Calm Questionnaire",
    text: "A soft one-question-at-a-time experience designed for honest self-reflection.",
  },
  {
    icon: Waves,
    title: "Nadi Awareness",
    text: "Understand possible left, right, or center channel tendencies in a gentle way.",
  },
  {
    icon: HandHeart,
    title: "Remedy Support",
    text: "Receive practical Sahajayoga-based cleansing suggestions for daily practice.",
  },
  {
    icon: SunMedium,
    title: "Spiritual Disclaimer",
    text: "The tool always reminds users that results are supportive guidance, not final assessment.",
  },
];

const guidancePoints = [
  "Uses gentle and qualifying language like likely, possible, and may indicate.",
  "Includes neutral answer options so users are not forced into inaccurate choices.",
  "Encourages connection with experienced Sahajayogis for deeper clarity.",
];

export default function HomePage() {
  return (
    <PublicLayout>
      {/* HERO SECTION */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-orange-50 via-white to-emerald-50">
        <div className="absolute -left-28 top-16 h-64 w-64 rounded-full bg-orange-200/40 blur-3xl sm:h-80 sm:w-80" />
        <div className="absolute -right-28 bottom-8 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute left-1/2 top-1/2 -z-10 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-100/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-8 lg:py-24">
          {/* LEFT CONTENT */}
          <div className="text-center lg:text-left">
            <div className="mx-auto inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-white/85 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-orange-700 shadow-sm backdrop-blur lg:mx-0">
              <Sparkles size={15} />
              Free Sahajayoga Guidance Tool
            </div>

            <h1 className="mx-auto mt-6 max-w-4xl font-serif text-3xl font-bold leading-tight text-slate-950 sm:text-5xl lg:mx-0 lg:text-6xl">
              Discover your subtle balance through chakra and nadi reflection.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg lg:mx-0">
              Answer simple guided questions and receive supportive guidance
              about possible chakra catching, nadi tendencies, cleansing
              suggestions, and mantra support.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                to="/profile"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-200"
              >
                Start Free Guidance <ArrowRight size={18} />
              </Link>

              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-200 bg-white px-7 py-4 text-sm font-bold text-orange-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-50 focus:outline-none focus:ring-4 focus:ring-orange-100"
              >
                Learn More
              </Link>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {stats.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-3xl border border-orange-100 bg-white/85 p-4 text-left shadow-sm backdrop-blur"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
                        <Icon size={21} />
                      </div>

                      <div>
                        <p className="text-2xl font-bold leading-none text-slate-900">
                          {item.value}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {item.label}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-2 lg:justify-start">
              {userTypes.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white bg-white/90 px-4 py-2 text-xs font-bold text-slate-600 shadow-sm sm:text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT VISUAL CARD */}
          <div className="relative mx-auto flex w-full max-w-[500px] items-center justify-center lg:max-w-none">
            <div className="absolute h-[300px] w-[300px] rounded-full bg-gradient-to-br from-orange-200/60 to-emerald-200/60 blur-3xl sm:h-[420px] sm:w-[420px]" />

            <div className="relative w-full max-w-[460px] rounded-[28px] border border-white/70 bg-white/85 p-3 shadow-2xl backdrop-blur sm:rounded-[36px] sm:p-4">
              <div className="rounded-[24px] bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-4 sm:rounded-[30px] sm:p-5">
                <div className="rounded-[22px] bg-white p-4 shadow-inner sm:rounded-[26px] sm:p-5">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="w-fit rounded-full bg-orange-50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700 sm:text-xs">
                      Subtle System
                    </span>

                    <span className="w-fit rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                      Chakra & Nadi View
                    </span>
                  </div>

                  <div className="rounded-[22px] bg-gradient-to-b from-white to-orange-50/50 p-3 sm:p-4">
                    <img
                      src="/images/subtle-system.png"
                      alt="Sahajayoga subtle system showing chakras and nadis"
                      className="mx-auto max-h-[330px] w-full object-contain sm:max-h-[440px]"
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-2xl bg-orange-50 px-3 py-3">
                      <p className="text-lg font-bold text-orange-700">8</p>
                      <p className="text-[11px] font-semibold text-slate-500">
                        Subtle Areas
                      </p>
                    </div>

                    <div className="rounded-2xl bg-emerald-50 px-3 py-3">
                      <p className="text-lg font-bold text-emerald-700">3</p>
                      <p className="text-[11px] font-semibold text-slate-500">
                        Nadis
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-left text-sm font-medium leading-6 text-orange-800">
                    Reflect gently. Results are supportive guidance, not a final
                    spiritual assessment.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS SECTION */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">
            Gentle Reflection
          </p>

          <h2 className="mt-3 font-serif text-3xl font-bold text-slate-950 sm:text-4xl">
            Built for seekers with honesty, simplicity, and respect
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            The home experience is designed to feel calm on mobile, tablet, and
            desktop, while clearly explaining that this is a supportive
            Sahajayoga reflection tool.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className="h-full">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
                  <Icon size={24} />
                </div>

                <h3 className="mt-5 font-serif text-xl font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {item.text}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* PROCESS SECTION */}
      <section className="bg-gradient-to-b from-white to-orange-50/40">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">
              Simple Process
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold text-slate-950 sm:text-4xl">
              How the guidance works
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((item, index) => {
              const Icon = item.icon;

              return (
                <Card key={item.title} className="relative overflow-hidden">
                  <div className="absolute right-5 top-5 text-6xl font-bold text-orange-50">
                    0{index + 1}
                  </div>

                  <div className="relative">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
                      <Icon size={24} />
                    </div>

                    <h3 className="mt-5 font-serif text-2xl font-bold text-slate-900">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {item.text}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* GUIDANCE RULES SECTION */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid items-center gap-8 rounded-[32px] border border-orange-100 bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
              <CircleDot size={15} />
              Accuracy Protection
            </div>

            <h2 className="mt-4 font-serif text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
              The tool avoids forced or overconfident results.
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              It is designed to support reflection while remaining humble about
              accuracy. If answers are mixed, the result can guide users toward
              general cleansing instead of forcing one chakra conclusion.
            </p>
          </div>

          <div className="space-y-3">
            {guidancePoints.map((point) => (
              <div
                key={point}
                className="flex gap-3 rounded-2xl border border-orange-100 bg-orange-50/60 p-4"
              >
                <CheckCircle2
                  className="mt-0.5 shrink-0 text-emerald-700"
                  size={20}
                />

                <p className="text-sm font-medium leading-6 text-slate-700">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-orange-600 via-amber-600 to-emerald-700 p-7 text-center text-white shadow-xl sm:rounded-[36px] sm:p-10 md:p-12">
          <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 -right-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative">
            <h2 className="font-serif text-3xl font-bold leading-tight sm:text-4xl">
              Begin with a calm attention.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-orange-50 sm:text-base">
              This tool is free of cost and created only as supportive
              reflection for Sahajayoga practice.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/profile"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-orange-700 shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-white/30"
              >
                Start Guidance <ArrowRight size={18} />
              </Link>

              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                Understand the Tool
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <DisclaimerBox
            short
            content="This tool gives supportive guidance based on selected answers. Results may not always be fully accurate. For deeper clarity, please connect with experienced Sahajayogis."
          />
        </div>
      </section>
    </PublicLayout>
  );
}