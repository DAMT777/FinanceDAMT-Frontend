import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PieChart } from "react-native-gifted-charts";
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AnimatedNumber from "../../components/AnimatedNumber";
import BudgetBar from "../../components/BudgetBar";
import IncomeExpenseChart from "../../components/charts/IncomeExpenseChart";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SkeletonCard from "../../components/ui/SkeletonCard";
import { budgetsApi } from "../../api/budgets";
import { savingGoalsApi } from "../../api/savingGoals";
import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import { useDashboard } from "../../hooks/useDashboard";
import { useUnreadCount } from "../../hooks/useNotifications";
import { useTransactions } from "../../hooks/useTransactions";
import { AppStackParams } from "../../navigation/types";
import { getCategoryDisplay } from "../../utils/categoryIcons";
import {
  CHART_RANGES,
  CHART_RANGE_LABELS,
  ChartRange,
  buildTrendBuckets,
  rangeStart,
} from "../../utils/trendBuckets";
import { useAuthStore } from "../../store/authStore";

const QUICK_ACTIONS = [
  {
    key: "income",
    labelKey: "dashboard.addIncome",
    icon: "arrow-up-outline" as const,
    bg: "rgba(0,214,143,0.12)",
    border: "rgba(0,214,143,0.2)",
    color: colors.primary,
  },
  {
    key: "expense",
    labelKey: "dashboard.addExpense",
    icon: "arrow-down-outline" as const,
    bg: "rgba(255,71,87,0.12)",
    border: "rgba(255,71,87,0.2)",
    color: colors.expense,
  },
  {
    key: "transfer",
    labelKey: "dashboard.transfer",
    icon: "swap-vertical-outline" as const,
    bg: "rgba(62,207,248,0.12)",
    border: "rgba(62,207,248,0.2)",
    color: colors.info,
  },
  {
    key: "ai",
    labelKey: "dashboard.aiChat",
    icon: "sparkles-outline" as const,
    bg: "rgba(108,99,255,0.12)",
    border: "rgba(108,99,255,0.2)",
    color: colors.accent,
  },
];

function formatMoney(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatShortMoney(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return formatMoney(value);
}

/** Time-aware greeting key for a friendlier, more human header. */
function greetingKey(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "dashboard.greeting";
  if (hour < 19) return "dashboard.greetingAfternoon";
  return "dashboard.greetingEvening";
}

export default function DashboardScreen() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language || "es";
  const [chartRange, setChartRange] = useState<ChartRange>("6m");
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParams>>();
  const user = useAuthStore((state) => state.user);
  const { data, refetch, isRefetching } = useDashboard();
  const { data: unreadCount = 0 } = useUnreadCount();
  const transactions = useTransactions({ page: 1, pageSize: 5 });
  const { data: budgets = [] } = useQuery({
    queryKey: ["budget-status"],
    queryFn: () => budgetsApi.getBudgetStatus(),
  });
  const { data: goals = [] } = useQuery({
    queryKey: ["saving-goals"],
    queryFn: savingGoalsApi.getSavingGoals,
  });

  // Chart data is computed from dated transactions so any window (day → year)
  // can be bucketed by day, week or month as appropriate.
  const chartDateFrom = useMemo(() => rangeStart(chartRange).toISOString(), [chartRange]);
  const chartTxQuery = useTransactions({ dateFrom: chartDateFrom, pageSize: 1000 });

  const trend = useMemo(() => {
    const items = chartTxQuery.data?.items ?? [];
    const buckets = buildTrendBuckets(items, chartRange, locale);
    const income = buckets.reduce((sum, b) => sum + b.income, 0);
    const expenses = buckets.reduce((sum, b) => sum + b.expenses, 0);
    const net = income - expenses;
    const rate = income > 0 ? Math.round((net / income) * 100) : 0;
    const hasData = buckets.some((b) => b.income > 0 || b.expenses > 0);
    return { buckets, income, expenses, net, rate, hasData };
  }, [chartTxQuery.data?.items, chartRange, locale]);

  if (!data) {
    return (
      <View style={styles.loadingWrap}>
        <SkeletonCard height={180} />
        <SkeletonCard height={240} />
        <SkeletonCard height={220} />
      </View>
    );
  }

  const categories = data?.expenseByCategory ?? [];
  const recentTransactions = transactions.data?.items ?? [];

  const initials = (user?.name ?? "Juan Luis")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const monthTotal = categories.reduce((sum, item) => sum + item.amount, 0);

  const currentMonthShort = new Date()
    .toLocaleString(locale, { month: "short" })
    .replace(".", "")
    .toUpperCase();

  const savingsPositive = trend.net >= 0;

  const pieData = categories.map((item) => ({
    value: Math.max(1, item.amount),
    color: item.categoryColor || colors.accent,
  }));

  try {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarRing}>
            <LinearGradient colors={colors.gradientBrand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.greetSmall}>{t(greetingKey())}</Text>
            <Text style={styles.greetName}>{user?.name ?? "FinanceDAMT"}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.bellBtn}
          accessibilityRole="button"
          accessibilityLabel={t("profile.notifications")}
          onPress={() => navigation.navigate("Notifications")}
        >
          <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
          {unreadCount > 0 ? <View style={styles.unreadDot} /> : null}
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={colors.gradientHero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.balanceCard}
      >
        <View style={styles.balanceGlow} pointerEvents="none" />

        <View style={styles.balanceTopRow}>
          <Text style={styles.balanceCaption}>{t("accounts.netWorth").toUpperCase()}</Text>
          <View
            style={[
              styles.savingsPill,
              {
                borderColor: savingsPositive ? "rgba(0,230,160,0.35)" : "rgba(255,71,87,0.35)",
                backgroundColor: savingsPositive ? "rgba(0,230,160,0.12)" : "rgba(255,71,87,0.12)",
              },
            ]}
          >
            <Ionicons
              name={savingsPositive ? "trending-up" : "trending-down"}
              size={12}
              color={savingsPositive ? colors.income : colors.expense}
            />
            <Text style={[styles.savingsPillText, { color: savingsPositive ? colors.income : colors.expense }]}>
              {trend.rate}%
            </Text>
          </View>
        </View>

        <AnimatedNumber
          value={data?.currentBalance ?? 0}
          formatter={formatMoney}
          style={styles.balanceValue}
          duration={1000}
        />

        <View style={styles.balanceDivider} />

        <View style={styles.balanceRow}>
          <View style={styles.balanceMetric}>
            <View style={[styles.metricIcon, { backgroundColor: "rgba(0,230,160,0.14)" }]}>
              <Ionicons name="arrow-up" size={13} color={colors.income} />
            </View>
            <View>
              <Text style={styles.metricLabel}>{t("dashboard.income")}</Text>
              <Text style={[styles.metricValue, { color: colors.income }]}>{formatMoney(data?.totalIncome ?? 0)}</Text>
            </View>
          </View>

          <View style={styles.metricSeparator} />

          <View style={styles.balanceMetric}>
            <View style={[styles.metricIcon, { backgroundColor: "rgba(255,71,87,0.14)" }]}>
              <Ionicons name="arrow-down" size={13} color={colors.expense} />
            </View>
            <View>
              <Text style={styles.metricLabel}>{t("dashboard.expenses")}</Text>
              <Text style={[styles.metricValue, { color: colors.expense }]}>{formatMoney(data?.totalExpenses ?? 0)}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.quickActionsWrap}>
        {QUICK_ACTIONS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.quickActionItem}
            accessibilityRole="button"
            accessibilityLabel={t(item.labelKey)}
            onPress={() => {
              if (item.key === "income") {
                navigation.navigate("Tabs", { screen: "AddTransaction", params: { preSelectedType: "Income" } });
                return;
              }
              if (item.key === "expense") {
                navigation.navigate("Tabs", { screen: "AddTransaction", params: { preSelectedType: "Expense" } });
                return;
              }
              if (item.key === "transfer") {
                navigation.navigate("Accounts");
                return;
              }
              navigation.navigate("Chat");
            }}
          >
            <View style={[styles.quickCircle, { backgroundColor: item.bg, borderColor: item.border }]}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <Text style={styles.quickLabel}>{t(item.labelKey)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Income vs Expenses ─────────────────────────────────────────── */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{t("dashboard.incomeVsExpenses")}</Text>
        </View>

        {/* Period selector — full set of windows (1D · 1S · 1M · 3M · 6M · 1A) */}
        <View style={styles.periodToggle} accessibilityRole="tablist">
          {CHART_RANGES.map((range) => {
            const active = chartRange === range;
            return (
              <TouchableOpacity
                key={range}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={CHART_RANGE_LABELS[range]}
                style={[styles.periodPill, active && styles.periodPillActive]}
                onPress={() => setChartRange(range)}
              >
                <Text style={[styles.periodText, active && styles.periodTextActive]}>
                  {CHART_RANGE_LABELS[range]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.chartCard}>
          {/* Net savings headline — strongest element in the card (hierarchy) */}
          <View style={styles.ieTopRow}>
            <View>
              <Text style={styles.ieNetLabel}>{t("dashboard.netSavings")}</Text>
              <Text
                style={[
                  styles.ieNetValue,
                  { color: savingsPositive ? colors.income : colors.expense },
                ]}
              >
                {savingsPositive ? "+" : "-"}
                {formatMoney(Math.abs(trend.net))}
              </Text>
            </View>

            <View
              style={[
                styles.savingsChip,
                {
                  backgroundColor: savingsPositive ? "rgba(0,214,143,0.12)" : "rgba(255,71,87,0.12)",
                  borderColor: savingsPositive ? "rgba(0,214,143,0.3)" : "rgba(255,71,87,0.3)",
                },
              ]}
            >
              <Ionicons
                name={savingsPositive ? "trending-up" : "trending-down"}
                size={13}
                color={savingsPositive ? colors.income : colors.expense}
              />
              <Text
                style={[
                  styles.savingsChipText,
                  { color: savingsPositive ? colors.income : colors.expense },
                ]}
              >
                {t("dashboard.savingsRate")} {trend.rate}%
              </Text>
            </View>
          </View>

          {trend.hasData ? (
            <IncomeExpenseChart
              points={trend.buckets}
              formatShort={formatShortMoney}
            />
          ) : (
            <View style={styles.chartEmptyBox}>
              <Ionicons name="bar-chart-outline" size={28} color={colors.textMuted} />
              <Text style={styles.chartEmptyText}>{t("dashboard.chartEmpty")}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.sectionWrap}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{t("dashboard.spendingOverview")}</Text>
          <View style={styles.monthPill}>
            <Text style={styles.monthText}>{currentMonthShort}</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartRow}>
            <View style={styles.chartLeft}>
              <PieChart
                data={pieData.length ? pieData : [{ value: 1, color: colors.bgCardBorder }]}
                donut
                radius={60}
                innerRadius={40}
                centerLabelComponent={() => (
                  <View style={{ alignItems: "center" }}>
                    <Text style={styles.chartCenterAmount}>{formatShortMoney(monthTotal)}</Text>
                    <Text style={styles.chartCenterMonth}>{currentMonthShort}</Text>
                  </View>
                )}
              />
            </View>

            <View style={styles.legendWrap}>
              {categories.slice(0, 4).map((item) => (
                <View key={item.categoryId} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: item.categoryColor || colors.accent }]} />
                  <Text style={styles.legendName}>{item.categoryName}</Text>
                  <Text style={styles.legendPct}>{`${Math.round(item.percentage)}%`}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.sectionWrap}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{t("dashboard.budgetStatus")}</Text>
          {!!budgets.length ? (
            <TouchableOpacity onPress={() => navigation.navigate("AddBudget")}>
              <Text style={styles.viewAllText}>{t("dashboard.seeAll")}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={{ marginTop: 10, gap: 8 }}>
          {budgets.slice(0, 3).map((budget) => (
            <BudgetBar key={budget.id} budget={budget} />
          ))}

          {!budgets.length ? (
            <TouchableOpacity style={styles.emptyBox} onPress={() => navigation.navigate("AddBudget")}>
              <Text style={styles.emptyTitle}>{t("dashboard.noActiveBudgets")}</Text>
              <Text style={styles.viewAllText}>{t("dashboard.setBudgetCTA")}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.sectionWrap}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{t("dashboard.myGoals")}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Tabs", { screen: "Goals" })}>
            <Text style={styles.viewAllText}>{t("dashboard.seeAllGoals")}</Text>
          </TouchableOpacity>
        </View>

        {goals.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.goalMiniRow}>
            {goals.slice(0, 3).map((goal) => (
              <View key={goal.id} style={styles.goalMiniCard}>
                <Text style={styles.goalMiniEmoji}>{goal.icon || "💰"}</Text>
                <Text style={styles.goalMiniName} numberOfLines={1}>{goal.name}</Text>
                <View style={styles.goalMiniTrack}>
                  <View style={[styles.goalMiniFill, { width: `${Math.min(100, Math.max(0, goal.progressPercentage))}%` as unknown as number }]} />
                </View>
                <Text style={styles.goalMiniAmount}>
                  {formatShortMoney(goal.currentAmount)} / {formatShortMoney(goal.targetAmount)}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <TouchableOpacity style={styles.emptyBox} onPress={() => navigation.navigate("AddGoal")}>
            <Text style={styles.emptyTitle}>{t("dashboard.defineFirstGoalCTA")}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.sectionWrap}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>{t("dashboard.recentTransactions")}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Tabs", { screen: "Transactions" })}>
            <Text style={styles.viewAllText}>{t("dashboard.seeAll")}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 8, gap: 2 }}>
          {recentTransactions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.txItem}
              onPress={() => navigation.navigate("TransactionDetail", { transaction: item })}
            >
              <View style={[styles.txIconBox, { backgroundColor: `${item.categoryColor}26` }]}>
                <Text style={styles.txIcon}>{getCategoryDisplay(item.categoryName, item.categoryColor).emoji}</Text>
              </View>

              <View style={styles.txMain}>
                <Text style={styles.txTitle}>{item.description || item.categoryName}</Text>
                <Text style={styles.txMeta}>{`${item.categoryName} · ${new Date(item.date).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}`}</Text>
              </View>

              <Text style={[styles.txAmount, { color: item.type === "Income" ? colors.income : colors.expense }]}>
                {item.type === "Income" ? "+" : "-"}
                {formatMoney(item.amount)}
              </Text>
            </TouchableOpacity>
          ))}

          {!recentTransactions.length ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>{t("dashboard.noRecentTransactions")}</Text>
              <Text style={styles.emptySub}>{t("dashboard.addFirstMovementDesc")}</Text>
            </View>
          ) : null}
        </View>
      </View>
      </ScrollView>
    );
  } catch {
    return (
      <View style={styles.loadingWrap}>
        <SkeletonCard height={180} />
        <SkeletonCard height={240} />
        <SkeletonCard height={220} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarRing: {
    padding: 2,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: typography.fontFamily.headingBold,
  },
  greetSmall: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: typography.fontFamily.body,
  },
  greetName: {
    marginTop: 1,
    color: colors.textPrimary,
    fontSize: 17,
    fontFamily: typography.fontFamily.headingSemiBold,
  },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.glass,
  },
  unreadDot: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.expense,
    borderWidth: 1.5,
    borderColor: colors.bg,
  },
  balanceCard: {
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.hairline,
    overflow: "hidden",
  },
  balanceGlow: {
    position: "absolute",
    top: -50,
    right: -40,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: colors.emeraldGlow,
  },
  balanceTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceCaption: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    fontFamily: typography.fontFamily.bodyMedium,
    letterSpacing: 1.6,
  },
  savingsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  savingsPillText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.monoSemiBold,
  },
  balanceValue: {
    marginTop: 10,
    color: "#FFFFFF",
    fontSize: 38,
    fontFamily: typography.fontFamily.monoExtraBold,
  },
  balanceDivider: {
    height: 1,
    backgroundColor: colors.hairline,
    marginVertical: 16,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceMetric: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  metricIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  metricSeparator: {
    width: 1,
    height: 30,
    backgroundColor: colors.hairline,
    marginHorizontal: 12,
  },
  metricLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontFamily: typography.fontFamily.body,
  },
  metricValue: {
    marginTop: 2,
    fontSize: 15,
    fontFamily: typography.fontFamily.monoSemiBold,
  },
  quickActionsWrap: {
    marginTop: 22,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActionItem: {
    width: "22%",
    alignItems: "center",
  },
  quickCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  sectionWrap: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: typography.fontFamily.headingSemiBold,
  },
  monthPill: {
    backgroundColor: colors.bgCardAlt,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  monthText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  chartCard: {
    marginTop: 12,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 16,
    padding: 16,
  },
  // Period selector (progressive disclosure)
  periodToggle: {
    flexDirection: "row",
    backgroundColor: colors.bgCardAlt,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 99,
    padding: 3,
    gap: 2,
    marginTop: 12,
  },
  periodPill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 99,
    alignItems: "center",
  },
  periodPillActive: {
    backgroundColor: colors.primary,
  },
  periodText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  periodTextActive: {
    color: colors.textInverse,
    fontFamily: typography.fontFamily.headingSemiBold,
  },
  // Income vs Expenses card internals
  ieTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  ieNetLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: typography.fontFamily.bodyMedium,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  ieNetValue: {
    marginTop: 4,
    fontSize: 24,
    fontFamily: typography.fontFamily.monoExtraBold,
  },
  savingsChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  savingsChipText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  chartEmptyBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 28,
  },
  chartEmptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  chartLeft: {
    width: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  chartCenterAmount: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: typography.fontFamily.monoSemiBold,
  },
  chartCenterMonth: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: typography.fontFamily.body,
  },
  legendWrap: {
    flex: 1,
    marginLeft: 16,
    gap: 8,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendName: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
    flex: 1,
  },
  legendPct: {
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: typography.fontFamily.mono,
  },
  viewAllText: {
    color: colors.primary,
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
  },
  txItem: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  txIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  txIcon: {
    fontSize: 18,
  },
  txMain: {
    flex: 1,
    marginLeft: 12,
  },
  txTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  txMeta: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: typography.fontFamily.body,
  },
  txAmount: {
    fontSize: 14,
    fontFamily: typography.fontFamily.monoSemiBold,
  },
  emptyBox: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 12,
    padding: 16,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  emptySub: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: typography.fontFamily.body,
  },
  goalMiniRow: {
    marginTop: 12,
    paddingRight: 8,
    gap: 10,
  },
  goalMiniCard: {
    width: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    backgroundColor: colors.bgCard,
    padding: 12,
  },
  goalMiniEmoji: {
    fontSize: 18,
  },
  goalMiniName: {
    marginTop: 6,
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  goalMiniTrack: {
    marginTop: 8,
    height: 6,
    backgroundColor: colors.bgCardBorder,
    borderRadius: 4,
    overflow: "hidden",
  },
  goalMiniFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  goalMiniAmount: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: typography.fontFamily.mono,
  },
});
