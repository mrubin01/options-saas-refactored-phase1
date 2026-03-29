import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    marginRight: 16,
    textDecoration: "none",
    fontWeight: isActive ? 700 : 400,
  });

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "12px 16px",
        borderBottom: "1px solid #ddd",
        marginBottom: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link to="/covered-calls" style={{ fontWeight: 700, textDecoration: "none" }}>
          Options SaaS
        </Link>

        <NavLink to="/covered-calls" style={linkStyle}>
          Covered Calls
        </NavLink>

        <NavLink to="/put-options" style={linkStyle}>
          Put Options
        </NavLink>

        <NavLink to="/spread-options" style={linkStyle}>
          Spread Options
        </NavLink>

        <NavLink to="/account" style={linkStyle}>
          Account
        </NavLink>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {user?.email && (
          <span style={{ fontSize: 14, color: "#555" }}>{user.email}</span>
        )}

        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
