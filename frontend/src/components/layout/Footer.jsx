import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-orange-100 bg-[#fffaf2]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <h3 className="font-serif text-xl font-bold text-slate-900">
            Sahajayoga Guidance Tool
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            A supportive reflection tool for understanding possible chakra and
            nadi tendencies based on selected answers.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-orange-700">
            Quick Links
          </h4>
          <div className="mt-4 space-y-2 text-sm">
            <Link className="block text-slate-600 hover:text-orange-700" to="/">
              Home
            </Link>
            <Link
              className="block text-slate-600 hover:text-orange-700"
              to="/profile"
            >
              Start Guidance
            </Link>
            <Link
              className="block text-slate-600 hover:text-orange-700"
              to="/admin/login"
            >
              Admin Login
            </Link>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-orange-700">
            Important Note
          </h4>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            This result may not always be fully accurate. For deeper clarity,
            please connect with experienced Sahajayogis and regular collective
            meditation.
          </p>
        </div>
      </div>

      <div className="border-t border-orange-100 px-4 py-4 text-center text-xs text-slate-500">
        Sahajayoga is free of cost. © {new Date().getFullYear()} Sahajayoga
        Guidance Tool.
      </div>
    </footer>
  );
}