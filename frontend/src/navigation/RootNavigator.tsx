import { DarkTheme, NavigationContainer, Theme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { RootStackParams } from "./types";
import { colors } from "../constants/colors";
import { useAuthStore } from "../store/authStore";
import { useUIStore } from "../store/uiStore";
import AuthNavigator from "./AuthNavigator";
import AppStackNavigator from "./AppStackNavigator";
import SplashScreen from "../screens/auth/SplashScreen";

const RootStack = createNativeStackNavigator<RootStackParams>();

const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.textPrimary,
    border: colors.bgCardBorder,
    primary: colors.primary,
  },
};

export default function RootNavigator() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);
  const loadSavedLanguage = useUIStore((state) => state.loadSavedLanguage);

  useEffect(() => {
    void loadStoredAuth();
    void loadSavedLanguage();
  }, [loadSavedLanguage, loadStoredAuth]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={navTheme}>
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
