import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { AxiosError } from "axios";
import { z } from "zod";
import { authApi } from "../../api/auth";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";

const buildRegisterSchema = (t: (key: string) => string) => z
  .object({
    name: z.string().min(2, t("auth.nameMin")),
    email: z.string().email(t("auth.emailInvalid")),
    password: z
      .string()
      .min(8, t("auth.passwordMin"))
      .regex(/\d/, t("auth.passwordNumber")),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: t("auth.passwordsNoMatch"),
  });

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type RegisterScreenProps = {
  navigation: {
    navigate: (screen: "Login" | "Survey") => void;
  };
};

const STRENGTH_COLORS = [colors.expense, colors.warning, colors.info, colors.primary];

function getPasswordStrength(password: string): number {
  if (!password.length) return 0;
  if (password.length > 12 || /[^a-zA-Z0-9]/.test(password)) return 4;
  if (/[A-Z]/.test(password) && /\d/.test(password)) return 3;
  if (password.length > 6) return 2;
  return 1;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { t } = useTranslation();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const loginAction = useAuthStore((state) => state.login);
  const showToast = useUIStore((state) => state.showToast);

  // Entrance animations
  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(20);
  const btnScale = useSharedValue(0.9);

  useEffect(() => {
    contentOpacity.value = withTiming(1, { duration: 320 });
    contentY.value = withSpring(0, { damping: 20 });
    btnScale.value = withDelay(350, withSpring(1, { damping: 16 }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));
  const btnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const {
    control,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterForm>({
    resolver: zodResolver(buildRegisterSchema(t)),
    mode: "onChange",
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });
  const strengthLabels = [
    "",
    t("auth.passwordStrength.weak"),
    t("auth.passwordStrength.fair"),
    t("auth.passwordStrength.good"),
    t("auth.passwordStrength.strong"),
  ];


  const password = watch("password");
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await authApi.register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      await loginAction(response);
      navigation.navigate("Survey");
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const status = axiosError.response?.status;
      const detail = axiosError.response?.data?.detail;

      if (status === 409) {
        showToast(t("auth.emailAlreadyRegistered"), "error");
      } else {
        showToast(detail || t("auth.couldNotCreate"), "error");
      }
    }
  });

  return (
    <View style={styles.screen}>
      {/* Decorative orbs */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />
      <View style={styles.orb3} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand */}
          <View style={styles.brandRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>$</Text>
            </View>
            <Text style={styles.brandText}>FinanceDAMT</Text>
          </View>

          <Animated.View style={contentStyle}>
            <Text style={styles.heading}>{t("auth.createAccountTitle")}</Text>
            <Text style={styles.subheading}>{t("auth.createAccountSubtitle")}</Text>

            <View style={styles.form}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label={t("auth.name")}
                    value={value}
                    onChangeText={onChange}
                    error={errors.name?.message}
                    leftIcon={<Ionicons name="person-outline" size={18} color={colors.textSecondary} />}
                  />
                )}
              />

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

              {/* Password strength bar */}
              <View style={styles.strengthWrap}>
                <View style={styles.strengthBar}>
                  {[1, 2, 3, 4].map((segment) => {
                    const isActive = strength >= segment;
                    return (
                      <View
                        key={segment}
                        style={[
                          styles.strengthSegment,
                          { backgroundColor: isActive ? STRENGTH_COLORS[segment - 1] : colors.bgCardBorder },
                        ]}
                      />
                    );
                  })}
                </View>
                {strength > 0 ? (
                  <Text style={[styles.strengthLabel, { color: STRENGTH_COLORS[strength - 1] }]}>
                    {strengthLabels[strength]}
                  </Text>
                ) : null}
              </View>

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label={t("auth.confirmPassword")}
                    value={value}
                    onChangeText={onChange}
                    error={errors.confirmPassword?.message}
                    secureTextEntry={!isConfirmPasswordVisible}
                    leftIcon={<Ionicons name="shield-checkmark-outline" size={18} color={colors.textSecondary} />}
                    rightIcon={
                      <Ionicons
                        name={isConfirmPasswordVisible ? "eye-off-outline" : "eye-outline"}
                        size={18}
                        color={colors.textSecondary}
                      />
                    }
                    onRightIconPress={() => setIsConfirmPasswordVisible((prev) => !prev)}
                  />
                )}
              />

              {/* Create Account gradient button */}
              <Animated.View style={btnAnimStyle}>
                <Pressable
                  onPress={() => void onSubmit()}
                  disabled={isSubmitting || !isValid}
                  style={styles.btnPressable}
                >
                  <LinearGradient
                    colors={isValid ? ["#00D68F", "#00B87A"] : [colors.bgCard, colors.bgCard]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.gradientBtn, !isValid && styles.gradientBtnDisabled]}
                  >
                    {isSubmitting ? (
                      <Text style={styles.btnText}>{t("auth.creatingAccount")}</Text>
                    ) : (
                      <Text style={[styles.btnText, !isValid && styles.btnTextDisabled]}>
                        {t("auth.createAccount")}
                      </Text>
                    )}
                  </LinearGradient>
                </Pressable>
              </Animated.View>

              <Pressable onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>
                  {t("auth.alreadyHaveAccount")}
                  <Text style={styles.loginLinkBold}>{t("auth.signInLink")}</Text>
                </Text>
              </Pressable>
            </View>
          </Animated.View>
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
    top: 60,
    right: -40,
  },
  orb3: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(0,214,143,0.05)",
    top: 140,
    left: -30,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg + spacing.xs,
    paddingTop: 60,
    paddingBottom: 40,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xxxl,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: colors.textInverse,
    fontSize: 20,
    fontFamily: typography.fontFamily.heading,
  },
  brandText: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.heading,
    fontSize: 18,
    fontWeight: "700",
  },
  heading: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.heading,
    fontSize: 30,
    fontWeight: "800",
  },
  subheading: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
  },
  form: {
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
  strengthWrap: {
    marginTop: -spacing.xs,
    gap: 6,
  },
  strengthBar: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.xs,
    alignSelf: "flex-end",
  },
  btnPressable: {
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
  loginLink: {
    textAlign: "center",
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
  },
  loginLinkBold: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bodyMedium,
    textDecorationLine: "underline",
  },
});
