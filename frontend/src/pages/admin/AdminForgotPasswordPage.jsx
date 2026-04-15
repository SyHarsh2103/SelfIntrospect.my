import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminApi } from "../../services/api";

export default function AdminForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await adminApi.forgotPassword({ email });
      sessionStorage.setItem("adminResetEmail", email.trim().toLowerCase());
      setMessage("OTP sent successfully.");
      navigate("/admin/verify-otp");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to send OTP."
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
          Password Reset
        </p>

        <h1 className="mt-2 font-serif text-3xl font-bold text-slate-900">
          Forgot Password
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          Enter your registered admin email. We will send an OTP to reset your password.
        </p>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-amber-200 px-4 py-3 text-sm outline-none focus:border-orange-500"
              placeholder="admin@sahajayoga.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}