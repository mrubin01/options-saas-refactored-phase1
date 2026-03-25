import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  login as apiLogin,
  logout as apiLogout,
  refreshSession,
  type AuthUser,
} from "../api/auth";
import { clearAccessToken, getAccessToken, setAccessToken } from "./tokenStore";

type AuthContextType = {
  token: string | null;
  user: AuthUser | null;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

type BootstrapResult =
  | { session: { access_token: string; user: AuthUser } }
  | { session: null };

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getAccessToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const bootstrapPromiseRef = useRef<Promise<BootstrapResult> | null>(null);

  useEffect(() => {
    let mounted = true;

    if (!bootstrapPromiseRef.current) {
      bootstrapPromiseRef.current = (async (): Promise<BootstrapResult> => {
        try {
          const session = await refreshSession();
          return {
            session: {
              access_token: session.access_token,
              user: session.user,
            },
          };
        } catch {
          return { session: null };
        }
      })();
    }

    bootstrapPromiseRef.current
      .then((result) => {
        if (!mounted) return;

        if (result.session) {
          setAccessToken(result.session.access_token);
          setTokenState(result.session.access_token);
          setUser(result.session.user);
        } else {
          clearAccessToken();
          setTokenState(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setIsInitializing(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function login(email: string, password: string) {
    const data = await apiLogin(email, password);
    setAccessToken(data.access_token);
    setTokenState(data.access_token);
    setUser(data.user);
    setIsInitializing(false);
  }

  async function logout() {
    try {
      await apiLogout();
    } catch {
      // ignore logout API failures; still clear local state
    } finally {
      clearAccessToken();
      setTokenState(null);
      setUser(null);
      setIsInitializing(false);
    }
  }

  return (
    <AuthContext.Provider value={{ token, user, isInitializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("AuthContext missing");
  }
  return ctx;
}
