import { create } from "zustand";
import { ThemeName } from "../theme/palettes";
import { applyTheme } from "../theme";
import { storage } from "../utils/storage";

const THEME_KEY = "themePreference";

interface ThemeState {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "dark",
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
    void storage.setItem(THEME_KEY, theme);
  },
  toggleTheme: () => {
    get().setTheme(get().theme === "dark" ? "light" : "dark");
  },
  loadTheme: async () => {
    const saved = await storage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") {
      applyTheme(saved);
      set({ theme: saved });
    }
  },
}));
