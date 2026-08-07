import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { useSubscriptions } from "../hooks/useSubscriptions";
import { AppStackParams } from "../navigation/types";
import { makeStyles } from "../theme/styles";

function formatCurrency(value: number): string {
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${Math.round(value)}`;
  }
}

/**
 * Compact Dashboard card summarising active subscriptions: monthly total,
 * active count and the next payment due (highlighted). Taps through to the full
 * Subscriptions screen. Reuses the same aggregation logic as SubscriptionsScreen.
 */
export default function SubscriptionsWidget() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParams>>();
  const { data } = useSubscriptions();

  const { totalMonthly, activeCount, next } = useMemo(() => {
    const active = (data ?? []).filter((s) => s.isActive);
    const monthly = active.reduce((acc, s) => acc + s.monthlyCost, 0);
    const upcoming = [...active].sort(
      (a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime(),
    )[0];
    return { totalMonthly: monthly, activeCount: active.length, next: upcoming ?? null };
  }, [data]);

  const daysLeft = next
    ? Math.ceil((new Date(next.nextBillingDate).getTime() - Date.now()) / 86400000)
    : null;
  const dueColor =
    daysLeft === null ? colors.textSecondary : daysLeft <= 3 ? colors.expense : daysLeft <= 7 ? colors.warning : colors.textSecondary;

  return (
    <Pressable
      style={styles.card}
      onPress={() => navigation.navigate("Subscriptions")}
      accessibilityRole="button"
      accessibilityLabel={t("subscriptions.title")}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconWrap}>
            <Ionicons name="repeat" size={16} color={colors.accent} />
          </View>
          <Text style={styles.title}>{t("subscriptions.title")}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>

      {activeCount > 0 ? (
        <>
          <View style={styles.mainRow}>
            <View>
              <Text style={styles.totalLabel}>{t("subscriptions.monthlyTotal")}</Text>
              <Text style={styles.totalValue}>{formatCurrency(totalMonthly)}</Text>
            </View>
            <View style={styles.countPill}>
              <Text style={styles.countText}>{t("subscriptions.activeCount", { count: activeCount })}</Text>
            </View>
          </View>

          {next ? (
            <View style={styles.nextRow}>
              <Text style={styles.nextEmoji}>{next.icon || "💳"}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.nextLabel}>{t("subscriptions.nextPayment")}</Text>
                <Text style={styles.nextName} numberOfLines={1}>{next.name}</Text>
              </View>
              <View style={styles.nextRight}>
                <Text style={styles.nextAmount}>{formatCurrency(next.amount)}</Text>
                <Text style={[styles.nextDue, { color: dueColor }]}>
                  {daysLeft !== null && daysLeft <= 0
                    ? t("subscriptions.dueNow")
                    : t("subscriptions.dueInDays", { count: daysLeft ?? 0 })}
                </Text>
              </View>
            </View>
          ) : null}
        </>
      ) : (
        <Text style={styles.empty}>{t("subscriptions.noneActive")}</Text>
      )}
    </Pressable>
  );
}

const styles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(108,99,255,0.12)",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: typography.fontFamily.headingSemiBold,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: typography.fontFamily.body,
  },
  totalValue: {
    marginTop: 2,
    color: colors.textPrimary,
    fontSize: 22,
    fontFamily: typography.fontFamily.monoExtraBold,
  },
  countPill: {
    borderWidth: 1,
    borderColor: "rgba(108,99,255,0.3)",
    backgroundColor: "rgba(108,99,255,0.1)",
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: {
    color: colors.accent,
    fontSize: 12,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  nextRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.bgCardBorder,
    paddingTop: 12,
  },
  nextEmoji: {
    fontSize: 20,
  },
  nextLabel: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 0.6,
    fontFamily: typography.fontFamily.bodyMedium,
    textTransform: "uppercase",
  },
  nextName: {
    marginTop: 1,
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  nextRight: {
    alignItems: "flex-end",
  },
  nextAmount: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: typography.fontFamily.monoSemiBold,
  },
  nextDue: {
    marginTop: 2,
    fontSize: 11,
    fontFamily: typography.fontFamily.body,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
  },
}));
