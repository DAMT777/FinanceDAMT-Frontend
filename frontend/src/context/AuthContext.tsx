import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearTokens, getAccessToken, getRefreshToken, persistTokens } from "../storage/tokenStorage";
import { login as loginRequest, register as registerRequest, refreshToken as refreshTokenRequest } from "../services/authService";
import type { LoginRequest, RegisterRequest } from "../types/auth";

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const accessToken = await getAccessToken();
        const refreshToken = await getRefreshToken();

        if (accessToken) {
          setIsAuthenticated(true);
        } else if (refreshToken) {
          const refreshed = await refreshTokenRequest(refreshToken);
          await persistTokens(refreshed.accessToken, refreshed.refreshToken);
          setIsAuthenticated(true);
        }
      } catch {
        await clearTokens();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isLoading,
      login: async (payload) => {
        const auth = await loginRequest(payload);
        await persistTokens(auth.accessToken, auth.refreshToken);
        setIsAuthenticated(true);
      },
      register: async (payload) => {
        const auth = await registerRequest(payload);
        await persistTokens(auth.accessToken, auth.refreshToken);
        setIsAuthenticated(true);
      },
      logout: async () => {
        await clearTokens();
        setIsAuthenticated(false);
      },
    }),
    [isAuthenticated, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
