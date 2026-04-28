import "./src/i18n";
import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import Toast from "react-native-toast-message";
import RootNavigator from "./src/navigation/RootNavigator";
import { queryClient } from "./src/lib/queryClient";
import { useUIStore } from "./src/store/uiStore";

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

  return <Toast />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <RootNavigator />
        <ToastBridge />
        <StatusBar style="light" />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
