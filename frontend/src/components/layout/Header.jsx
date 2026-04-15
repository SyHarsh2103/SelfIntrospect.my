import { Link, NavLink } from "react-router-dom";
import { Flower2 } from "lucide-react";
import Button from "../common/Button";

export default function Header() {
  const navLinkClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${
      isActive
        ? "bg-orange-50 text-orange-700"
        : "text-slate-600 hover:bg-orange-50 hover:text-orange-700"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-orange-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-sm">
            <Flower2 size={22} />
          </div>

          <div>
            <p className="font-serif text-xl font-bold text-slate-900">
              Self Introspect
            </p>
            <p className="text-xs font-medium text-slate-500">
              Supportive chakra & nadi reflection
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/profile" className={navLinkClass}>
            Start Guidance
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
        </nav>

        <Link to="/admin/login">
          <Button variant="soft">Admin</Button>
        </Link>
      </div>
    </header>
  );
}