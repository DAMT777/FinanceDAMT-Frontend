import { create } from "zustand";
import i18n from "../i18n";
import { storage } from "../utils/storage";

type ToastType = "success" | "error" | "warning" | "info";

const VENTURES_ENABLED_KEY = "venturesEnabled";

interface UIState {
  isLoading: boolean;
  currentLanguage: string;
  venturesEnabled: boolean;
  toast: { message: string; type: ToastType } | null;
  showToast: (message: string, type: ToastType) => void;
  hideToast: () => void;
  setLoading: (loading: boolean) => void;
  changeLanguage: (lang: string) => Promise<void>;
  loadSavedLanguage: () => Promise<void>;
  setVenturesEnabled: (enabled: boolean) => Promise<void>;
  loadVenturesEnabled: () => Promise<void>;
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  currentLanguage: "es",
  // Opt-out preference: the Ventures (entrepreneurship) section can be hidden
  // by users who don't need it. Defaults to shown.
  venturesEnabled: true,
  toast: null,
  showToast: (message, type) => set({ toast: { message, type } }),
  hideToast: () => set({ toast: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  changeLanguage: async (lang) => {
    await i18n.changeLanguage(lang);
    await storage.setItem("appLanguage", lang);
    set({ currentLanguage: lang });
  },
  loadSavedLanguage: async () => {
    const saved = await storage.getItem("appLanguage");
    const lang = saved ?? "es";
    await i18n.changeLanguage(lang);
    set({ currentLanguage: lang });
  },
  setVenturesEnabled: async (enabled) => {
    set({ venturesEnabled: enabled });
    try {
      await storage.setItem(VENTURES_ENABLED_KEY, enabled ? "true" : "false");
    } catch {
      // Preference persistence is best-effort.
    }
  },
  loadVenturesEnabled: async () => {
    try {
      const saved = await storage.getItem(VENTURES_ENABLED_KEY);
      if (saved != null) {
        set({ venturesEnabled: saved !== "false" });
      }
    } catch {
      // Keep the default (enabled) on failure.
    }
  },
}));
