import { Link } from "react-router-dom";

export default function PageShell({ title, subtitle, actions, children }) {
  return (
    <main className="min-h-screen bg-[#f8f6f1] px-5 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-[28px] border border-[#eadfcb] bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <Link
                to="/"
                className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700"
              >
                Sahajayoga Guidance Tool
              </Link>
              <h1 className="mt-3 font-serif text-4xl font-bold text-slate-900">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                  {subtitle}
                </p>
              ) : null}
            </div>

            {actions ? <div>{actions}</div> : null}
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}