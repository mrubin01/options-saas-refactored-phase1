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

  return (
    <div style={{ maxWidth: 420, margin: "48px auto" }}>
      <form onSubmit={handleSubmit}>
        <h2>Reset password</h2>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Resetting..." : "Reset password"}
        </button>

        {message && (
          <p style={{ color: "green" }}>
            {message} <Link to="/login">Go to login</Link>
          </p>
        )}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}
