import { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, fetchMe } from "../api/auth";

type User = {
  id: number;
  email: string;
};

type AuthContextType = {
  token: string | null;
  user: User | null;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("access_token"));
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function hydrateUser() {
      if (!token) {
        if (!cancelled) {
          setUser(null);
          setIsInitializing(false);
        }
        return;
      }

      try {
        const me = await fetchMe();
        if (!cancelled) {
          setUser(me);
        }
      } catch {
        localStorage.removeItem("access_token");
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    }

    hydrateUser();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function login(email: string, password: string) {
    const data = await apiLogin(email, password);
    localStorage.setItem("access_token", data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    setIsInitializing(false);
  }

  function logout() {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
    setIsInitializing(false);
  }

  return (
    <AuthContext.Provider value={{ token, user, isInitializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext missing");
  return ctx;
}
