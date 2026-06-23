import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import AnimatedNumber from "../../components/AnimatedNumber";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useDeleteSubscription, useSubscriptions } from "../../hooks/useSubscriptions";
import { useUIStore } from "../../store/uiStore";
import { AppStackParams } from "../../navigation/types";
import { BillingCycle, SubscriptionDto } from "../../types/api";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SubscriptionsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParams>>();
  const subscriptionsQuery = useSubscriptions();
  const deleteSubscription = useDeleteSubscription();
  const showToast = useUIStore((state) => state.showToast);
  const [pendingDelete, setPendingDelete] = useState<SubscriptionDto | null>(null);

  const subscriptions = subscriptionsQuery.data ?? [];
  const activeSubs = subscriptions.filter((s) => s.isActive);
  const totalMonthly = activeSubs.reduce((acc, item) => acc + item.monthlyCost, 0);
  const totalYearly = totalMonthly * 12;

  const cycleLabel = (cycle: BillingCycle): string =>
    t(`subscriptions.cycle.${cycle.toLowerCase()}`);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 280 });
    translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
  }, []);
  const rootStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleDelete = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    try {
      await deleteSubscription.mutateAsync(target.id);
      showToast(t("subscriptions.deleted"), "success");
    } catch {
      showToast(t("subscriptions.couldNotDelete"), "error");
    }
  };

  return (
    <>
      <Animated.View style={[{ flex: 1, backgroundColor: colors.bg }, rootStyle]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            </Pressable>
            <Text style={styles.title}>{t("subscriptions.title")}</Text>
            <View style={styles.backBtn} />
          </View>

          <LinearGradient colors={["#1A1430", "#0D1228"]} style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{t("subscriptions.monthlyTotal")}</Text>
            <AnimatedNumber
              value={totalMonthly}
              formatter={formatCurrency}
              style={styles.summaryValue}
              duration={1000}
            />
            <View style={styles.summaryFooter}>
              <Text style={styles.summarySubtext}>
                {t("subscriptions.activeCount", { count: activeSubs.length })}
              </Text>
              <Text style={styles.summarySubtext}>
                {t("subscriptions.yearlyTotal", { amount: formatCurrency(totalYearly) })}
              </Text>
            </View>
          </LinearGradient>

          {subscriptions.length ? (
            <View style={styles.list}>
              {subscriptions.map((sub) => {
                const daysLeft = Math.ceil(
                  (new Date(sub.nextBillingDate).getTime() - Date.now()) / 86400000,
                );
                const dueColor =
                  daysLeft <= 3 ? colors.expense : daysLeft <= 7 ? colors.warning : colors.textSecondary;

                return (
                  <View key={sub.id} style={[styles.card, !sub.isActive && styles.cardInactive]}>
                    <View style={styles.cardIcon}>
                      <Text style={styles.cardEmoji}>{sub.icon || "💳"}</Text>
                    </View>

                    <View style={styles.cardBody}>
                      <View style={styles.cardTopRow}>
                        <Text style={styles.cardName} numberOfLines={1}>
                          {sub.name}
                        </Text>
                        <Text style={styles.cardAmount}>{formatCurrency(sub.amount)}</Text>
                      </View>
                      <View style={styles.cardBottomRow}>
                        <Text style={styles.cardCycle}>{cycleLabel(sub.billingCycle)}</Text>
                        {sub.isActive ? (
                          <Text style={[styles.cardDue, { color: dueColor }]}>
                            {daysLeft <= 0
                              ? t("subscriptions.dueNow")
                              : t("subscriptions.dueInDays", { count: daysLeft })}
                          </Text>
                        ) : (
                          <Text style={styles.cardPaused}>{t("subscriptions.paused")}</Text>
                        )}
                      </View>
                    </View>

                    <Pressable
                      style={styles.deleteBtn}
                      onPress={() => setPendingDelete(sub)}
                      hitSlop={8}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          ) : (
            <EmptyState
              icon="🔁"
              title={t("subscriptions.empty")}
              subtitle={t("subscriptions.emptySubtitle")}
              actionLabel={t("subscriptions.addFirst")}
            />
          )}

          <Pressable style={styles.addBtn} onPress={() => navigation.navigate("AddSubscription")}>
            <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
            <Text style={styles.addText}>{t("subscriptions.add")}</Text>
          </Pressable>
        </ScrollView>
      </Animated.View>

      <ConfirmDialog
        visible={pendingDelete !== null}
        title={t("subscriptions.delete")}
        message={t("subscriptions.deleteConfirm", { name: pendingDelete?.name ?? "" })}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        destructive
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    padding: spacing.lg,
    paddingBottom: 130,
    gap: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontFamily: typography.fontFamily.heading,
    fontWeight: "700",
  },
  summaryCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(108,99,255,0.25)",
    padding: spacing.lg,
    gap: 4,
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.5)",
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    letterSpacing: 1.2,
  },
  summaryValue: {
    color: colors.accent,
    fontFamily: typography.fontFamily.mono,
    fontSize: 30,
    fontWeight: "800",
  },
  summaryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  summarySubtext: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.body,
    fontSize: 12,
  },
  list: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 16,
    padding: spacing.md,
  },
  cardInactive: {
    opacity: 0.55,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgCardAlt,
  },
  cardEmoji: {
    fontSize: 22,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardName: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: 15,
  },
  cardAmount: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.mono,
    fontSize: 14,
    fontWeight: "700",
    marginLeft: spacing.sm,
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardCycle: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.body,
    fontSize: 12,
  },
  cardDue: {
    fontFamily: typography.fontFamily.body,
    fontSize: 12,
  },
  cardPaused: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.body,
    fontSize: 12,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: "rgba(108,99,255,0.3)",
    borderRadius: 14,
    height: 48,
    backgroundColor: "rgba(108,99,255,0.06)",
  },
  addText: {
    color: colors.accent,
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: 15,
  },
});
