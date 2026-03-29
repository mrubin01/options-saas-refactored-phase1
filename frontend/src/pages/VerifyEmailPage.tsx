import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { verifyEmail } from "../api/auth";
import { getApiErrorMessage } from "../api/errors";

export default function VerifyEmailPage() {
  const location = useLocation();
  const token = useMemo(() => new URLSearchParams(location.search).get("token") || "", [location.search]);

  const [message, setMessage] = useState("Verifying...");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!token) {
        if (!cancelled) {
          setError("Missing verification token.");
          setMessage("");
        }
        return;
      }

      try {
        const res = await verifyEmail(token);
        if (!cancelled) {
          setMessage(res.message);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Unable to verify email."));
          setMessage("");
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div style={{ maxWidth: 420, margin: "48px auto" }}>
      <h2>Email verification</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>
        <Link to="/login">Back to login</Link>
      </p>
    </div>
  );
}
