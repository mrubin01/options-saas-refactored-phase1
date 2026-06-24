import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { resetPassword } from "../api/auth";
import { getApiErrorMessage } from "../api/errors";

export default function ResetPasswordPage() {
  const location = useLocation();
  const token = useMemo(() => new URLSearchParams(location.search).get("token") || "", [location.search]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Missing reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await resetPassword(token, password);
      setMessage(res.message);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to reset password."));
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-border-dark bg-surface px-3 py-2 text-sm text-navy placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-navy tracking-tight">OptionStacker</h1>
          <p className="mt-1 text-sm text-muted">Set a new password</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">New password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Confirm new password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                className={inputClass}
              />
            </div>

            {message && (
              <div className="rounded-lg bg-emerald-950/30 border border-emerald-800 px-4 py-3 text-sm text-emerald-400">
                {message}{" "}
                <Link to="/login" className="font-medium underline">
                  Sign in
                </Link>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-950/30 border border-red-800 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? "Resetting…" : "Reset password"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-muted">
          <Link to="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
