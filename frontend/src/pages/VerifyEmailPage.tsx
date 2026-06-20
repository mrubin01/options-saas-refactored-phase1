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
    <div style={{ maxWidth: 420, margin: "48px auto" }}>
      <h2>Email verification</h2>

      {!token && <p style={{ color: "red" }}>Missing verification token.</p>}

      {!!token && !isDone && (
        <>
          <p>Click below to verify your email address.</p>
          <button onClick={handleVerify} disabled={isSubmitting}>
            {isSubmitting ? "Verifying..." : "Verify email"}
          </button>
        </>
      )}

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <p>
        <Link to="/login">Back to login</Link>
      </p>
    </div>
  );
}
