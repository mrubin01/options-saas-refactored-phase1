import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import { getApiErrorMessage } from "../api/errors";

const registrationEnabled = import.meta.env.VITE_REGISTRATION_ENABLED !== "false";

export default function RegisterPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (token) {
    return <Navigate to="/covered-calls" replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register(email, password);
      setSuccess("Account created. Check your email for a verification link.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to register."));
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-border-dark bg-white px-3 py-2 text-sm text-navy placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  if (!registrationEnabled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="mb-2 text-2xl font-bold text-navy tracking-tight">OptionStacker</h1>
          <div className="rounded-xl border border-border bg-white p-8 shadow-sm">
            <p className="text-sm font-medium text-navy">Registration is currently closed.</p>
            <p className="mt-1 text-sm text-muted">We're still polishing things up. Check back soon.</p>
            <Link to="/login" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-navy tracking-tight">OptionStacker</h1>
          <p className="mt-1 text-sm text-muted">Create your account</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Password</label>
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
              <label className="block text-sm font-medium text-navy mb-1.5">Confirm password</label>
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

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
