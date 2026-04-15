import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { adminApi } from "../../services/api";

export default function AdminLoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await adminApi.login(form);

      const token = response?.token;
      const admin = response?.admin;

      if (!token) {
        throw new Error("Login successful, but token was not returned.");
      }

      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminUser", JSON.stringify(admin || {}));

      navigate("/admin", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to login. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] px-6 py-10">
      <div className="mx-auto max-w-md rounded-3xl border border-amber-200 bg-white p-8 shadow-sm">
        <Link to="/" className="text-sm font-semibold text-orange-700">
          ← Back to Home
        </Link>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
          Admin Panel
        </p>

        <h1 className="mt-2 font-serif text-3xl font-bold text-slate-900">
          Admin Login
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          Sign in to manage questions, options, remedies, mantras, chakras,
          nadis, and spiritual guidance content.
        </p>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-amber-200 px-4 py-3 text-sm outline-none focus:border-orange-500"
              placeholder="admin@sahajayoga.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-amber-200 px-4 py-3 text-sm outline-none focus:border-orange-500"
              placeholder="Enter admin password"
            />
          </div>

          <div className="flex justify-end">
            <Link
              to="/admin/forgot-password"
              className="text-sm font-semibold text-orange-700 transition hover:text-orange-800 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-6 text-slate-600">
          Forgot your password? Use the reset flow to receive an OTP on your
          registered admin email and create a new password.
        </div>
      </div>
    </div>
  );
}