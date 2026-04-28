import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthStackParams } from "./types";
import SplashScreen from "../screens/auth/SplashScreen";
import OnboardingScreen from "../screens/auth/OnboardingScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import SurveyScreen from "../screens/onboarding/SurveyScreen";

const Stack = createNativeStackNavigator<AuthStackParams>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
      <Stack.Screen
        name="Splash"
        options={{ gestureEnabled: false }}
      >
        {(props) => <SplashScreen navigation={props.navigation} autoNavigate />}
      </Stack.Screen>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Survey" component={SurveyScreen} />
    </Stack.Navigator>
  );
}
