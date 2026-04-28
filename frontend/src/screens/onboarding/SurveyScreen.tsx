import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

const employmentOptions = ["survey.employed", "survey.freelance", "survey.businessOwner", "survey.student"] as const;
const goalOptions = [
  "survey.saveMoney",
  "survey.payDebts",
  "survey.emergencyFund",
  "survey.invest",
  "survey.buyProperty",
] as const;

type SurveyScreenProps = {
  navigation: {
    replace: (route: "App") => void;
  };
};

export default function SurveyScreen({ navigation }: SurveyScreenProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [employmentType, setEmploymentType] = useState<string | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState(2500000);
  const [dependents, setDependents] = useState(0);
  const [fixedExpenses, setFixedExpenses] = useState(1200000);
  const [financialGoal, setFinancialGoal] = useState<string | null>(null);

  const progress = useSharedValue(0);
  progress.value = withTiming(step / 5, {
    duration: 350,
    easing: Easing.out(Easing.cubic),
  });

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const canContinue = useMemo(() => {
    if (step === 1) return !!employmentType;
    if (step === 5) return !!financialGoal;
    return true;
  }, [employmentType, financialGoal, step]);

  const onNext = () => {
    if (step < 5) {
      setStep((prev) => prev + 1);
      return;
    }

    navigation.replace("App");
  };

  const onBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <View style={styles.cardGrid}>
          {employmentOptions.map((option) => {
            const selected = employmentType === option;
            return (
              <Pressable
                key={option}
                style={[styles.optionCard, selected && styles.optionCardSelected]}
                onPress={() => setEmploymentType(option)}
              >
                <Ionicons name="briefcase-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.optionLabel}>{t(option)}</Text>
              </Pressable>
            );
          })}
        </View>
      );
    }

    if (step === 2) {
      return (
        <View style={styles.stepBlock}>
          <Text style={styles.question}>{t("survey.step2Title")}</Text>
          <Text style={styles.bigNumber}>COP {monthlyIncome.toLocaleString("es-CO")}</Text>
          <Input
            label={t("survey.enterAmount")}
            value={String(monthlyIncome)}
            onChangeText={(value) => setMonthlyIncome(Number(value) || 0)}
            keyboardType="numeric"
            style={styles.numericInput}
            placeholder=""
          />
        </View>
      );
    }

    if (step === 3) {
      return (
        <View style={styles.stepBlock}>
          <Text style={styles.question}>{t("survey.step3Title")}</Text>
          <View style={styles.counterRow}>
            <Pressable style={styles.counterButton} onPress={() => setDependents((prev) => Math.max(0, prev - 1))}>
              <Text style={styles.counterButtonText}>-</Text>
            </Pressable>
            <Text style={styles.bigNumber}>{dependents}</Text>
            <Pressable style={styles.counterButton} onPress={() => setDependents((prev) => prev + 1)}>
              <Text style={styles.counterButtonText}>+</Text>
            </Pressable>
          </View>
          <Text style={styles.hint}>{t("survey.justMyself")}</Text>
        </View>
      );
    }

    if (step === 4) {
      return (
        <View style={styles.stepBlock}>
          <Text style={styles.question}>{t("survey.step4Title")}</Text>
          <Text style={styles.bigNumber}>COP {fixedExpenses.toLocaleString("es-CO")}</Text>
          <Input
            label={t("survey.enterAmount")}
            value={String(fixedExpenses)}
            onChangeText={(value) => setFixedExpenses(Number(value) || 0)}
            keyboardType="numeric"
            style={styles.numericInput}
            placeholder=""
          />
        </View>
      );
    }

    return (
      <View style={styles.stepBlock}>
        <Text style={styles.question}>{t("survey.mainGoal")}</Text>
        {goalOptions.map((goal) => {
          const selected = financialGoal === goal;
          return (
            <Pressable
              key={goal}
              style={[styles.goalCard, selected && styles.optionCardSelected]}
              onPress={() => setFinancialGoal(goal)}
            >
              <Text style={styles.goalText}>{t(goal)}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressStyle]} />
      </View>
      <Text style={styles.stepIndicator}>{t("survey.stepOf", { current: step, total: 5 })}</Text>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        <Button variant="secondary" size="md" onPress={onBack} disabled={step === 1}>
          {t("survey.back")}
        </Button>
        <Button variant="primary" size="md" onPress={onNext} disabled={!canContinue}>
          {step === 5 ? t("survey.finish") : t("survey.next")}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.bgCardBorder,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  stepIndicator: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
  },
  scrollContent: {
    paddingVertical: spacing.lg,
    flexGrow: 1,
  },
  stepBlock: {
    gap: spacing.md,
  },
  question: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.headingSemiBold,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  optionCard: {
    width: "47%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    backgroundColor: colors.bgCard,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.xs,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  optionLabel: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.sm,
    textAlign: "center",
  },
  bigNumber: {
    color: colors.textSecondary,
    fontSize: 36,
    fontFamily: typography.fontFamily.mono,
    textAlign: "center",
  },
  numericInput: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    backgroundColor: colors.bgCard,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  counterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    backgroundColor: colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
  },
  counterButtonText: {
    color: colors.textPrimary,
    fontSize: 24,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  hint: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
  },
  goalCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    backgroundColor: colors.bgCard,
    padding: spacing.lg,
  },
  goalText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
});
