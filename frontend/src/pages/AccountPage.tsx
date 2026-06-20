import { useAuth } from "../auth/AuthContext";

export default function AccountPage() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: 640, margin: "24px auto" }}>
      <h2>Account</h2>

      <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8 }}>
        <p><strong>Email:</strong> {user?.email}</p>
        <p>
          <strong>Email verified:</strong> {user?.is_email_verified ? "Yes" : "No"}
        </p>
      </div>
    </div>
  );
}
