import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navigation() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-white border-b mb-6">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex gap-6 text-sm font-medium">
          <Link to="/covered-calls">Covered Calls</Link>
          <Link to="/put-options">Put Options</Link>
          <Link to="/spread-options">Spread Options</Link>
        </div>

        <div className="flex items-center gap-4 text-sm">
          {user && <span className="text-gray-600">{user.email}</span>}
          {user && (
            <button
              onClick={logout}
              className="text-red-600 hover:underline"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
