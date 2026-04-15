import { createContext, useContext, useMemo, useState } from "react";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const raw = localStorage.getItem("adminUser");
    return raw ? JSON.parse(raw) : null;
  });

  const login = (payload) => {
    setAdmin(payload);
    localStorage.setItem("adminUser", JSON.stringify(payload));
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminToken");
  };

  const value = useMemo(
    () => ({
      admin,
      login,
      logout,
    }),
    [admin]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
}