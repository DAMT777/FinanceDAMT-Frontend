import "./src/i18n";
import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import Toast, { BaseToast, BaseToastProps } from "react-native-toast-message";
import RootNavigator from "./src/navigation/RootNavigator";
import { queryClient } from "./src/lib/queryClient";
import { useUIStore } from "./src/store/uiStore";
import { useThemeStore } from "./src/store/themeStore";
import { applyTheme } from "./src/theme";
import { colors } from "./src/constants/colors";

// react-native-toast-message only ships success/error/info renderers and THROWS
// for any other type. The app raises "warning" toasts (e.g. missing note before
// AI parse, saving without an account), so a warning renderer must be
// registered or those calls crash the whole app.
const toastConfig = {
  warning: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: colors.warning, backgroundColor: colors.bgCard }}
      text1Style={{ color: colors.textPrimary, fontSize: 14 }}
      text2Style={{ color: colors.textSecondary, fontSize: 12 }}
    />
  ),
};

function ToastBridge() {
  const toast = useUIStore((state) => state.toast);
  const hideToast = useUIStore((state) => state.hideToast);

  useEffect(() => {
    if (!toast) {
      return;
    }

    Toast.show({
      type: toast.type,
      text1: toast.message,
      position: "bottom",
      visibilityTime: 2200,
    });

    hideToast();
  }, [hideToast, toast]);

  return <Toast config={toastConfig} />;
}

export default function App() {
  const theme = useThemeStore((state) => state.theme);
  const loadTheme = useThemeStore((state) => state.loadTheme);

  // Keep the live palette and style resolver in sync before children render, so
  // a theme change re-renders the whole tree with the new colors.
  applyTheme(theme);

  useEffect(() => {
    void loadTheme();
  }, [loadTheme]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <QueryClientProvider client={queryClient}>
          <RootNavigator />
          <ToastBridge />
          <StatusBar style={theme === "dark" ? "light" : "dark"} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
