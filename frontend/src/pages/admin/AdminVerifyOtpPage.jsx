import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminApi } from "../../services/api";

export default function AdminVerifyOtpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("adminResetEmail") || "";
    setEmail(storedEmail);

    if (!storedEmail) {
      navigate("/admin/forgot-password", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await adminApi.verifyOtp({ email, otp });
      const resetToken = response?.resetToken;

      if (!resetToken) {
        throw new Error("Reset token was not returned.");
      }

      sessionStorage.setItem("adminResetToken", resetToken);
      navigate("/admin/reset-password");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to verify OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] px-6 py-10">
      <div className="mx-auto max-w-md rounded-3xl border border-amber-200 bg-white p-8 shadow-sm">
        <Link to="/admin/forgot-password" className="text-sm font-semibold text-orange-700">
          ← Back
        </Link>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
          OTP Verification
        </p>

        <h1 className="mt-2 font-serif text-3xl font-bold text-slate-900">
          Verify OTP
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          Enter the 6-digit OTP sent to <b>{email}</b>.
        </p>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              className="w-full rounded-2xl border border-amber-200 px-4 py-3 text-center text-lg font-bold tracking-[0.4em] outline-none focus:border-orange-500"
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}