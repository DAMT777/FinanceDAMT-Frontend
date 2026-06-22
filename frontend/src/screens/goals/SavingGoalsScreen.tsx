import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import AnimatedNumber from "../../components/AnimatedNumber";
import GoalCard from "../../components/GoalCard";
import ProgressRing from "../../components/ProgressRing";
import EmptyState from "../../components/ui/EmptyState";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useGoals } from "../../hooks/useGoals";
import { AppStackParams } from "../../navigation/types";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function safePercentage(currentAmount?: number, targetAmount?: number): number {
  const current = currentAmount ?? 0;
  const target = targetAmount ?? 0;
  if (target <= 0) return 0;
  const pct = Math.round((current / target) * 100);
  if (Number.isNaN(pct)) return 0;
  return Math.min(100, Math.max(0, pct));
}

export default function SavingGoalsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParams>>();
  const goalsQuery = useGoals();
  const goals = goalsQuery.data ?? [];
  const totalSaved = goals.reduce((acc, item) => acc + item.currentAmount, 0);
  const totalTarget = goals.reduce((acc, item) => acc + item.targetAmount, 0);
  const overallProgress = safePercentage(totalSaved, totalTarget);

  // Screen entrance
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 280 });
    translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const rootStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[{ flex: 1, backgroundColor: colors.bg }, rootStyle]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t("goals.title")}</Text>

        {/* Summary card */}
        <LinearGradient colors={["#0D1F14", "#0D1228"]} style={styles.summaryCard}>
          <View style={styles.summaryInner}>
            <View style={styles.summaryLeft}>
              <Text style={styles.summaryLabel}>{t("goals.totalSaved")}</Text>
              <AnimatedNumber
                value={totalSaved}
                formatter={formatCurrency}
                style={styles.summaryValue}
                duration={1000}
              />
              <Text style={styles.summarySubtext}>
                {t("goals.acrossGoals", { count: goals.length })}
              </Text>
            </View>
            <ProgressRing
              size={72}
              strokeWidth={7}
              progress={overallProgress}
              color={colors.primary}
            />
          </View>
        </LinearGradient>

        {/* Goal list */}
        {goals.length ? (
          <View style={styles.goalList}>
            {goals.map((goal) => {
              const progress = safePercentage(goal.currentAmount, goal.targetAmount);
              const daysLeft = goal.deadline
                ? Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000))
                : null;
              const daysColor =
                daysLeft === null ? colors.textMuted :
                daysLeft > 30 ? colors.primary :
                daysLeft > 10 ? colors.warning :
                colors.expense;

              return (
                <View key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalTopRow}>
                    <View style={styles.goalTitleWrap}>
                        <View style={styles.goalIconWrap}>
                          <Ionicons name="trophy-outline" size={16} color={colors.warning} />
                        </View>
                      <Text style={styles.goalName}>{goal.name}</Text>
                    </View>
                    {daysLeft !== null ? (
                      <View style={[styles.daysBadge, { borderColor: `${daysColor}55`, backgroundColor: `${daysColor}15` }]}>
                        <Text style={[styles.daysText, { color: daysColor }]}>
                          {t("goals.leftDaysShort", { count: daysLeft })}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Progress bar */}
                  <View style={styles.track}>
                    <LinearGradient
                      colors={
                        progress >= 100 ? ["#00D68F", "#7C5CFC"] :
                        daysLeft !== null && daysLeft < 30 ? ["#FFB830", "#FF8C00"] :
                        ["#00D68F", "#00B4D8"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.fill, { width: `${progress}%` }]}
                    />
                  </View>

                  <View style={styles.goalAmountRow}>
                    <View style={styles.goalAmountLeft}>
                      <AnimatedNumber
                        value={goal.currentAmount}
                        formatter={formatCurrency}
                        style={styles.currentAmount}
                        duration={800}
                      />
                      <Text style={styles.targetAmount}> / {formatCurrency(goal.targetAmount)}</Text>
                    </View>
                    <Text style={styles.goalPercent}>{progress}%</Text>
                  </View>

                  <Pressable
                    style={styles.contributeBtn}
                    onPress={() => navigation.navigate("GoalContribution", { goalId: goal.id, goalName: goal.name })}
                  >
                    <Text style={styles.contributeBtnText}>{t("goals.contribute")}</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        ) : (
          <EmptyState
            icon="🎯"
            title={t("goals.noGoalsSet")}
            subtitle={t("goals.savingFor")}
            actionLabel={t("goals.createFirst")}
          />
        )}

        <Pressable style={styles.addGoalBtn} onPress={() => navigation.navigate("AddGoal")}>
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.addGoalText}>{t("goals.addNewGoal")}</Text>
        </Pressable>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    padding: spacing.lg,
    paddingBottom: 130,
    gap: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontFamily: typography.fontFamily.heading,
    fontWeight: "700",
  },
  // Summary card
  summaryCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0,214,143,0.2)",
    padding: spacing.lg,
  },
  summaryInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLeft: {
    gap: 4,
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.5)",
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    letterSpacing: 1.2,
  },
  summaryValue: {
    color: colors.primary,
    fontFamily: typography.fontFamily.mono,
    fontSize: 28,
    fontWeight: "800",
  },
  summarySubtext: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.body,
    fontSize: 12,
  },
  // Goal list
  goalList: {
    gap: spacing.md,
  },
  goalCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  goalTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  goalIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,184,48,0.14)",
  },
  goalName: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: 16,
    flex: 1,
  },
  daysBadge: {
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  daysText: {
    fontFamily: typography.fontFamily.body,
    fontSize: 11,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bgCardBorder,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
  },
  goalAmountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalAmountLeft: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currentAmount: {
    color: colors.primary,
    fontFamily: typography.fontFamily.mono,
    fontSize: 16,
    fontWeight: "700",
  },
  targetAmount: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.body,
    fontSize: 14,
  },
  goalPercent: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.mono,
    fontSize: 14,
    fontWeight: "600",
  },
  contributeBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  contributeBtnText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: 13,
  },
  // Add button
  addGoalBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: "rgba(0,214,143,0.3)",
    borderRadius: 14,
    height: 48,
    backgroundColor: "rgba(0,214,143,0.06)",
  },
  addGoalText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: 15,
  },
});
