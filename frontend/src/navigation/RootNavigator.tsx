import { DarkTheme, DefaultTheme, NavigationContainer, NavigationState, Theme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useRef } from "react";
import { RootStackParams } from "./types";
import { colors } from "../constants/colors";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { useUIStore } from "../store/uiStore";
import AuthNavigator from "./AuthNavigator";
import AppStackNavigator from "./AppStackNavigator";
import SplashScreen from "../screens/auth/SplashScreen";

const RootStack = createNativeStackNavigator<RootStackParams>();

export default function RootNavigator() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);
  const loadSavedLanguage = useUIStore((state) => state.loadSavedLanguage);
  const theme = useThemeStore((state) => state.theme);

  // Persisted across the remount that a theme change triggers, so the user stays
  // on the exact same screen while every screen rebuilds with the new theme.
  const navStateRef = useRef<NavigationState | undefined>(undefined);

  // Recomputed each render so it follows the active theme (colors is live).
  const navTheme: Theme = {
    ...(theme === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme === "dark" ? DarkTheme : DefaultTheme).colors,
      background: colors.bg,
      card: colors.bg,
      text: colors.textPrimary,
      border: colors.bgCardBorder,
      primary: colors.primary,
    },
  };

  useEffect(() => {
    void loadStoredAuth();
    void loadSavedLanguage();
  }, [loadSavedLanguage, loadStoredAuth]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer
      key={theme}
      theme={navTheme}
      initialState={navStateRef.current}
      onStateChange={(state) => {
        navStateRef.current = state;
      }}
    >
      <RootStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        {isAuthenticated ? (
          <RootStack.Screen name="App" component={AppStackNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
