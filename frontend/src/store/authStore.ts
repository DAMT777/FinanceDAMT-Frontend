import { create } from "zustand";
import { LoginResponse, UserProfile } from "../types/api";
import { storage } from "../utils/storage";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "authUser";

// Serialize the profile so the previously logged-in account is restored on the
// next app launch instead of falling back to the placeholder "Finance" user.
async function persistUser(user: UserProfile | null): Promise<void> {
  try {
    if (user) {
      await storage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      await storage.removeItem(USER_KEY);
    }
  } catch {
    // Storage failures must never break auth flow; the in-memory state stands.
  }
}

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginResponse) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserProfile) => void;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (data) => {
    await storage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    await storage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);

    const user: UserProfile = {
      id: data.userId,
      email: data.email,
      name: data.name,
      currency: "COP",
      financialProfile: null,
      biometricEnabled: false,
      createdAt: new Date().toISOString(),
    };

    await persistUser(user);

    set({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      isAuthenticated: true,
      isLoading: false,
      user,
    });
  },

  logout: async () => {
    await storage.removeItem(ACCESS_TOKEN_KEY);
    await storage.removeItem(REFRESH_TOKEN_KEY);
    await persistUser(null);

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setUser: (user) => {
    void persistUser(user);
    set({ user });
  },

  loadStoredAuth: async () => {
    set({ isLoading: true });

    const accessToken = await storage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);

    // Restore the persisted profile so a returning user keeps their identity
    // (name/email) without re-authenticating.
    let user: UserProfile | null = null;
    try {
      const storedUser = await storage.getItem(USER_KEY);
      if (storedUser) {
        user = JSON.parse(storedUser) as UserProfile;
      }
    } catch {
      user = null;
    }

    set({
      accessToken,
      refreshToken,
      user,
      isAuthenticated: !!accessToken,
      isLoading: false,
    });
  },
}));
