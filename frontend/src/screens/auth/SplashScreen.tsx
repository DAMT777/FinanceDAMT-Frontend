import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import { useAuthStore } from "../../store/authStore";

type SplashScreenProps = {
  navigation?: {
    replace: (route: string) => void;
  };
  autoNavigate?: boolean;
};

export default function SplashScreen({ navigation, autoNavigate = true }: SplashScreenProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!autoNavigate || !navigation) {
      return;
    }

    const timeout = setTimeout(() => {
      if (isAuthenticated) {
        navigation.replace("App");
      } else {
        navigation.replace("Onboarding");
      }
    }, 2200);

    return () => clearTimeout(timeout);
  }, [autoNavigate, isAuthenticated, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.glowOuter} />
      <View style={styles.glowInner} />

      <View style={styles.centerContent}>
        <LinearGradient colors={["#0D2818", "#141426"]} style={styles.logoBox}>
          <Text style={styles.logoText}>F</Text>
        </LinearGradient>

        <Text style={styles.title}>FinanceDAMT</Text>
        <Text style={styles.subtitle}>Tu dinero, entendido.</Text>
        <ActivityIndicator color={colors.primary} size="small" style={styles.spinner} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  glowOuter: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: "rgba(0,214,143,0.08)",
  },
  glowInner: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(0,214,143,0.12)",
  },
  centerContent: {
    alignItems: "center",
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(0,214,143,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: colors.primary,
    fontSize: 36,
    fontFamily: typography.fontFamily.heading,
  },
  title: {
    color: colors.textPrimary,
    marginTop: 16,
    fontSize: 22,
    fontFamily: typography.fontFamily.headingBold,
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: 6,
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
  },
  spinner: {
    marginTop: 24,
  },
});
