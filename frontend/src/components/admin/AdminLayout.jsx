import {
    LayoutDashboard,
    HelpCircle,
    ListChecks,
    Sparkles,
    Activity,
    HeartHandshake,
    ScrollText,
    FileText,
    LogOut,
    Home,
    PanelLeftClose,
    PanelLeftOpen,
    Users,
    Layers,
  } from "lucide-react";
  import { Link, useLocation, useNavigate } from "react-router-dom";
  import { useMemo, useState } from "react";
  
  const navItems = [
    { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
    { label: "Templates", to: "/admin/templates", icon: Layers },
    { label: "Questions", to: "/admin/questions", icon: HelpCircle },
    { label: "Options", to: "/admin/options", icon: ListChecks },
    { label: "Chakras", to: "/admin/chakras", icon: Sparkles },
    { label: "Nadis", to: "/admin/nadis", icon: Activity },
    { label: "Remedies", to: "/admin/remedies", icon: HeartHandshake },
    { label: "Mantras", to: "/admin/mantras", icon: ScrollText },
    { label: "Content", to: "/admin/content", icon: FileText },
    { label: "Admin Users", to: "/admin/users", icon: Users },
  ];
  
  export default function AdminLayout({ title, children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
  
    const activeItem = useMemo(() => {
      return navItems.find((item) => item.to === location.pathname);
    }, [location.pathname]);
  
    const logout = () => {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      navigate("/admin/login", { replace: true });
    };
  
    return (
      <div className="min-h-screen bg-[#f8f6f1] text-slate-800">
        <div className="flex min-h-screen">
          <aside
            className={`hidden border-r border-[#eadfcb] bg-white shadow-sm lg:flex lg:flex-col ${
              collapsed ? "w-24" : "w-72"
            } transition-all duration-300`}
          >
            <div className="flex items-center justify-between border-b border-[#eadfcb] px-5 py-5">
              {!collapsed && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-700">
                    Sahajayoga Admin
                  </p>
                  <h1 className="mt-2 font-serif text-2xl font-bold text-slate-900">
                    Guidance Tool
                  </h1>
                </div>
              )}
  
              <button
                type="button"
                onClick={() => setCollapsed((prev) => !prev)}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100"
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? (
                  <PanelLeftOpen size={18} />
                ) : (
                  <PanelLeftClose size={18} />
                )}
              </button>
            </div>
  
            <div className="flex-1 px-4 py-5">
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.to;
  
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                        active
                          ? "bg-orange-600 text-white shadow-sm"
                          : "text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                      } ${collapsed ? "justify-center px-2" : ""}`}
                      title={item.label}
                    >
                      <Icon size={18} className="shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>
  
            <div className="border-t border-[#eadfcb] px-4 py-4">
              <div className="space-y-2">
                <Link
                  to="/"
                  className={`flex items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 ${
                    collapsed ? "px-2" : ""
                  }`}
                  title="View site"
                >
                  <Home size={17} />
                  {!collapsed && <span>View Site</span>}
                </Link>
  
                <button
                  type="button"
                  onClick={logout}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 ${
                    collapsed ? "px-2" : ""
                  }`}
                  title="Logout"
                >
                  <LogOut size={17} />
                  {!collapsed && <span>Logout</span>}
                </button>
              </div>
            </div>
          </aside>
  
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-20 border-b border-[#eadfcb] bg-white/95 backdrop-blur">
              <div className="px-5 py-4 lg:px-8">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-700">
                      Admin Panel
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      {activeItem?.icon ? (
                        <activeItem.icon size={20} className="text-orange-700" />
                      ) : null}
                      <h2 className="truncate font-serif text-3xl font-bold text-slate-900">
                        {title}
                      </h2>
                    </div>
                  </div>
  
                  <div className="hidden items-center gap-2 lg:flex">
                    <Link
                      to="/"
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      View Site
                    </Link>
                    <button
                      type="button"
                      onClick={logout}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Logout
                    </button>
                  </div>
                </div>
  
                <div className="mt-4 overflow-x-auto lg:hidden">
                  <div className="flex gap-2 pb-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const active = location.pathname === item.to;
  
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold ${
                            active
                              ? "bg-orange-600 text-white"
                              : "bg-orange-50 text-slate-700"
                          }`}
                        >
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </header>
  
            <main className="flex-1 px-5 py-6 lg:px-8">
              <div className="mx-auto max-w-7xl">{children}</div>
            </main>
          </div>
        </div>
      </div>
    );
  }