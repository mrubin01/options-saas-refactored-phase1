import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getApiErrorMessage } from "../api/errors";

type LocationState = {
  from?: string;
};

export default function LoginPage() {
  const { login, token, isInitializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state as LocationState | null) ?? null;
  const redirectTo = state?.from || "/covered-calls";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const expired = useMemo(
    () => new URLSearchParams(location.search).get("expired") === "1",
    [location.search]
  );

  if (!isInitializing && token) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to log in."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "48px auto" }}>
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>

        {expired && (
          <p style={{ color: "#b45309" }}>Your session expired. Please sign in again.</p>
        )}

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Login"}
        </button>

        <p>
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
        <p>
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}
