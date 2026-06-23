import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { verifyEmail } from "../api/auth";
import { getApiErrorMessage } from "../api/errors";

export default function VerifyEmailPage() {
  const location = useLocation();
  const token = useMemo(
    () => new URLSearchParams(location.search).get("token") || "",
    [location.search]
  );

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  async function handleVerify() {
    if (!token) {
      setError("Missing verification token.");
      setMessage("");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const res = await verifyEmail(token);
      setMessage(res.message);
      setIsDone(true);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to verify email."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-navy tracking-tight">OptionStacker</h1>
          <p className="mt-1 text-sm text-muted">Email verification</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-8 shadow-sm space-y-4">
          {!token && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              Missing verification token.
            </div>
          )}

          {!!token && !isDone && (
            <>
              <p className="text-sm text-muted">Click below to verify your email address.</p>
              <button
                type="button"
                onClick={handleVerify}
                disabled={isSubmitting}
                className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60 transition-colors"
              >
                {isSubmitting ? "Verifying…" : "Verify email"}
              </button>
            </>
          )}

          {message && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="text-center">
            <Link to="/login" className="text-sm font-medium text-primary hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
