import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AxiosError } from "axios";
import { authApi } from "../../api/auth";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { AuthStackParams } from "../../navigation/types";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { makeStyles } from "../../theme/styles";

type VerifyRoute = RouteProp<AuthStackParams, "VerifyEmail">;
type VerifyNav = NativeStackNavigationProp<AuthStackParams, "VerifyEmail">;

export default function VerifyEmailScreen() {
  const { t } = useTranslation();
  const route = useRoute<VerifyRoute>();
  const navigation = useNavigation<VerifyNav>();
  const email = route.params?.email ?? "";

  const loginAction = useAuthStore((state) => state.login);
  const showToast = useUIStore((state) => state.showToast);

  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const isValid = code.trim().length === 6;

  const onVerify = async () => {
    if (!isValid || isVerifying) return;
    setIsVerifying(true);
    try {
      const response = await authApi.verifyEmail(email, code.trim());
      await loginAction(response);
      navigation.navigate("Survey");
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const detail = axiosError.response?.data?.detail;
      showToast(detail || t("auth.invalidCode"), "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const onResend = async () => {
    if (isResending) return;
    setIsResending(true);
    try {
      await authApi.resendVerification(email);
      showToast(t("auth.codeResent"), "success");
    } catch {
      showToast(t("auth.couldNotResend"), "error");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.textSecondary} />
          </Pressable>

          <View style={styles.iconCircle}>
            <Ionicons name="mail-unread-outline" size={30} color={colors.primary} />
          </View>

          <Text style={styles.heading}>{t("auth.verifyEmailTitle")}</Text>
          <Text style={styles.subheading}>
            {t("auth.verifyEmailSubtitle")} <Text style={styles.email}>{email}</Text>
          </Text>

          <TextInput
            value={code}
            onChangeText={(text) => setCode(text.replace(/\D/g, "").slice(0, 6))}
            keyboardType="number-pad"
            placeholder="••••••"
            placeholderTextColor={colors.textMuted}
            style={styles.codeInput}
            maxLength={6}
            autoFocus
          />

          <Pressable
            onPress={() => void onVerify()}
            disabled={!isValid || isVerifying}
            style={styles.btnPressable}
          >
            <LinearGradient
              colors={isValid ? ["#00D68F", "#00B87A"] : [colors.bgCard, colors.bgCard]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.gradientBtn, !isValid && styles.gradientBtnDisabled]}
            >
              <Text style={[styles.btnText, !isValid && styles.btnTextDisabled]}>
                {isVerifying ? t("auth.verifying") : t("auth.verifyCta")}
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={() => void onResend()} disabled={isResending} style={styles.resendWrap}>
            <Text style={styles.resendText}>
              {isResending ? t("auth.resending") : t("auth.resendCode")}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = makeStyles((colors) => ({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  orb1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(0,214,143,0.08)",
    top: -80,
    right: -80,
  },
  orb2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(108,99,255,0.06)",
    top: 80,
    left: -50,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg + spacing.xs,
    paddingTop: 70,
    paddingBottom: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -spacing.xs,
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryGlow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  heading: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.heading,
    fontSize: 28,
    fontWeight: "800",
  },
  subheading: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    lineHeight: 22,
  },
  email: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  codeInput: {
    marginTop: spacing.xxl,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 16,
    paddingVertical: 18,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.mono,
    fontSize: 28,
    textAlign: "center",
    letterSpacing: 12,
  },
  btnPressable: {
    marginTop: spacing.xl,
    borderRadius: 16,
    overflow: "hidden",
  },
  gradientBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  gradientBtnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    color: "#fff",
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: 16,
    fontWeight: "600",
  },
  btnTextDisabled: {
    color: colors.textMuted,
  },
  resendWrap: {
    marginTop: spacing.lg,
    alignItems: "center",
  },
  resendText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.sm,
  },
}));
