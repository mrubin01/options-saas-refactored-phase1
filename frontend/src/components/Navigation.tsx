import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="bg-[#0b1120] sticky top-0 z-40 border-b border-white/10 shadow-sm">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 h-14">
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="text-base font-semibold text-white tracking-tight hover:text-white/90 transition-colors"
          >
            OptionStacker
          </Link>

          <nav className="flex items-center gap-1">
            {[
              { to: "/dashboard", label: "Dashboard" },
              { to: "/covered-calls", label: "Covered Calls" },
              { to: "/put-options", label: "Put Options" },
              { to: "/spread-options", label: "Spread Options" },
              { to: "/watchlist", label: "Watchlist" },
              { to: "/glossary", label: "Glossary" },
              { to: "/account", label: "Account" },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user?.email && (
            <span className="text-sm text-white/60 hidden sm:block">
              {user.email}
            </span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-white/25 px-3 py-1.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
