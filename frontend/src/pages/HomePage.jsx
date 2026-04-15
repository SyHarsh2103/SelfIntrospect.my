import { Link } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  Leaf,
  ShieldCheck,
  Sparkles,
  Flower2,
  Flame,
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
    text: "Select your current Sahajayoga understanding level.",
  },
  {
    icon: Leaf,
    title: "Answer gently",
    text: "Respond based on your current state, meditation, and subtle experience.",
  },
  {
    icon: ShieldCheck,
    title: "Receive guidance",
    text: "Get supportive chakra, nadi, remedy, and mantra guidance.",
  },
];

const stats = [
  { icon: Flower2, value: "7", label: "Chakras" },
  { icon: Flame, value: "3", label: "Nadis" },
];

export default function HomePage() {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-emerald-50">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-sm font-semibold text-orange-700 shadow-sm backdrop-blur">
              <Sparkles size={16} />
              Free Sahajayoga Guidance Tool
            </div>

            <h1 className="mt-7 font-serif text-4xl font-bold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Discover your subtle balance through guided chakra and nadi
              reflection.
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              Answer simple questions and receive supportive guidance about
              possible chakra or channel tendencies, cleansing suggestions, and
              mantra support.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Start Free Guidance <ArrowRight size={18} />
              </Link>

              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-7 py-4 text-sm font-bold text-orange-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-50"
              >
                Learn More
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {stats.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-3xl border border-orange-100 bg-white/80 p-4 shadow-sm"
                  >
                    <Icon className="text-orange-600" size={22} />
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {item.value}
                    </p>
                    <p className="text-sm text-slate-500">{item.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {userTypes.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute h-[420px] w-[420px] rounded-full bg-gradient-to-br from-orange-200/60 to-emerald-200/60 blur-3xl" />

            <div className="relative w-full max-w-[460px] rounded-[36px] border border-white/70 bg-white/80 p-4 shadow-2xl backdrop-blur">
              <div className="rounded-[30px] bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-5">
                <div className="rounded-[26px] bg-white p-5 shadow-inner">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="rounded-full bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
                      Subtle System
                    </span>
                    <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                      8 Chakras
                    </span>
                  </div>

                  <div className="rounded-[24px] bg-gradient-to-b from-white to-orange-50/50 p-4">
                    <img
                      src="/images/subtle-system.png"
                      alt="Sahajayoga subtle system showing chakras and nadis"
                      className="mx-auto max-h-[440px] w-full object-contain"
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-2xl bg-orange-50 px-3 py-3">
                      <p className="text-lg font-bold text-orange-700">7</p>
                      <p className="text-[11px] font-semibold text-slate-500">
                        Chakras
                      </p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 px-3 py-3">
                      <p className="text-lg font-bold text-emerald-700">3</p>
                      <p className="text-[11px] font-semibold text-slate-500">
                        Nadis
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-orange-50 px-4 py-3 text-sm font-medium leading-6 text-orange-800">
                    Reflect gently. Results are supportive guidance, not final
                    diagnosis.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
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
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-gradient-to-br from-orange-600 to-emerald-700 p-8 text-center text-white shadow-xl md:p-12">
          <h2 className="font-serif text-3xl font-bold sm:text-4xl">
            Begin with a calm attention.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-orange-50">
            This tool is free of cost and created only as supportive reflection
            for Sahajayoga practice.
          </p>

          <div className="mt-7">
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-orange-700 shadow-lg transition hover:-translate-y-0.5"
            >
              Start Guidance <ArrowRight size={18} />
            </Link>
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