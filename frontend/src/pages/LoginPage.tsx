import { useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getApiErrorMessage } from "../api/errors";

export default function LoginPage() {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const expired = useMemo(() => new URLSearchParams(location.search).get("expired") === "1", [location.search]);

  if (token) {
    return <Navigate to="/covered-calls" replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/covered-calls", { replace: true });
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

        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}
