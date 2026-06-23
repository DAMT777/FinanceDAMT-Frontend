import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as LocalAuthentication from "expo-local-authentication";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { authApi } from "../../api/auth";
import Input from "../../components/ui/Input";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { getApiErrorMessage } from "../../utils/apiError";

const buildLoginSchema = (t: (key: string) => string) => z.object({
  email: z.string().email(t("auth.emailInvalid")),
  password: z.string().min(8, t("auth.passwordMin")),
});

type LoginForm = {
  email: string;
  password: string;
};

type LoginScreenProps = {
  navigation: {
    navigate: (screen: "Register") => void;
  };
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { t } = useTranslation();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const loginAction = useAuthStore((state) => state.login);
  const showToast = useUIStore((state) => state.showToast);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(buildLoginSchema(t)),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (Platform.OS === "web") {
      setIsBiometricAvailable(false);
      return;
    }
    void (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricAvailable(compatible && enrolled);
    })();
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await authApi.login(values.email, values.password);
      await loginAction(response);
      showToast(t("auth.welcome"), "success");
    } catch (error) {
      showToast(getApiErrorMessage(error, t, "auth.invalidCredentials"), "error");
    }
  });

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
          <View style={styles.brandRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>F</Text>
            </View>
            <Text style={styles.brandText}>FinanceDAMT</Text>
          </View>

          <Text style={styles.heading}>{t("auth.welcome")}</Text>
          <Text style={styles.subheading}>{t("auth.signInSubtitle")}</Text>

          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t("auth.email")}
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textSecondary} />}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t("auth.password")}
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                  secureTextEntry={!isPasswordVisible}
                  leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />}
                  rightIcon={
                    <Ionicons
                      name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color={colors.textSecondary}
                    />
                  }
                  onRightIconPress={() => setIsPasswordVisible((prev) => !prev)}
                />
              )}
            />

            <Pressable style={styles.forgotWrap}>
              <Text style={styles.forgotText}>{t("auth.forgotPassword")}</Text>
            </Pressable>

            <Pressable onPress={() => void onSubmit()} disabled={isSubmitting} style={styles.signInBtn}>
              <Text style={styles.signInText}>{isSubmitting ? t("auth.signingIn") : t("auth.signIn")}</Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t("auth.or")}</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              style={[styles.biometricBtn, !isBiometricAvailable && styles.biometricBtnDisabled]}
              onPress={() => showToast(t("auth.biometricSoon"), "info")}
              disabled={!isBiometricAvailable}
            >
              <Text style={styles.biometricText}>{t("auth.useBiometric")}</Text>
            </Pressable>

            <Pressable onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}>
                {t("auth.newHere")}<Text style={styles.registerLinkBold}>{t("auth.createAccount")}</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  orb1: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(0,214,143,0.06)",
    top: -60,
    right: -80,
  },
  orb2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(108,99,255,0.05)",
    top: 80,
    right: -30,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: colors.primary,
    fontSize: 18,
    fontFamily: typography.fontFamily.headingSemiBold,
  },
  brandText: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: 18,
  },
  heading: {
    marginTop: 48,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.heading,
    fontSize: 30,
  },
  subheading: {
    marginTop: 8,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.body,
    fontSize: 15,
  },
  form: {
    marginTop: 32,
    gap: spacing.md,
  },
  forgotWrap: {
    alignItems: "flex-end",
    marginTop: -6,
  },
  forgotText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.body,
    fontSize: 13,
  },
  signInBtn: {
    marginTop: 2,
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  signInText: {
    color: colors.textInverse,
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: 16,
  },
  dividerRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.bgCardBorder,
  },
  dividerText: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.body,
    fontSize: 13,
  },
  biometricBtn: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  biometricBtnDisabled: {
    opacity: 0.55,
  },
  biometricText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: 16,
  },
  registerLink: {
    marginTop: 8,
    textAlign: "center",
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.body,
    fontSize: 14,
  },
  registerLinkBold: {
    color: colors.primary,
    fontFamily: typography.fontFamily.body,
    textDecorationLine: "underline",
  },
});
