import { create } from "zustand";
import i18n from "../i18n";
import { storage } from "../utils/storage";

type ToastType = "success" | "error" | "warning" | "info";

interface UIState {
  isLoading: boolean;
  currentLanguage: string;
  toast: { message: string; type: ToastType } | null;
  showToast: (message: string, type: ToastType) => void;
  hideToast: () => void;
  setLoading: (loading: boolean) => void;
  changeLanguage: (lang: string) => Promise<void>;
  loadSavedLanguage: () => Promise<void>;
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  currentLanguage: "es",
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
}));
