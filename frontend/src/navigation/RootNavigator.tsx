import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { RootStackParams } from "./types";
import { useAuthStore } from "../store/authStore";
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

  useEffect(() => {
    void loadStoredAuth();
    void loadSavedLanguage();
  }, [loadSavedLanguage, loadStoredAuth]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="App" component={AppStackNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
