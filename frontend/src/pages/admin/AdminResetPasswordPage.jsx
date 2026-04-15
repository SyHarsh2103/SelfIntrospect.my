import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminApi } from "../../services/api";

export default function AdminResetPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("adminResetEmail") || "";
    const storedToken = sessionStorage.getItem("adminResetToken") || "";

    setEmail(storedEmail);
    setResetToken(storedToken);

    if (!storedEmail || !storedToken) {
      navigate("/admin/forgot-password", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setLoading(true);

    try {
      await adminApi.resetPassword({
        email,
        resetToken,
        newPassword: form.newPassword,
      });

      sessionStorage.removeItem("adminResetEmail");
      sessionStorage.removeItem("adminResetToken");

      navigate("/admin/login", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] px-6 py-10">
      <div className="mx-auto max-w-md rounded-3xl border border-amber-200 bg-white p-8 shadow-sm">
        <Link to="/admin/login" className="text-sm font-semibold text-orange-700">
          ← Back to Login
        </Link>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
          New Password
        </p>

        <h1 className="mt-2 font-serif text-3xl font-bold text-slate-900">
          Reset Password
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          Create a new password for <b>{email}</b>.
        </p>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-amber-200 px-4 py-3 text-sm outline-none focus:border-orange-500"
              placeholder="Minimum 8 characters"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-amber-200 px-4 py-3 text-sm outline-none focus:border-orange-500"
              placeholder="Re-enter new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}