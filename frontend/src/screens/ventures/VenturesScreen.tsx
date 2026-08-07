import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import EmptyState from "../../components/ui/EmptyState";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useVentures } from "../../hooks/useVentures";
import { AppStackParams } from "../../navigation/types";
import { VentureDto } from "../../types/api";
import { makeStyles } from "../../theme/styles";

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

function roiColor(roi: number): string {
  return roi > 0 ? colors.income : roi < 0 ? colors.expense : colors.textSecondary;
}

export default function VenturesScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParams>>();
  const { data } = useVentures();
  const ventures = data ?? [];

  const totals = useMemo(() => {
    const invested = ventures.reduce((a, v) => a + v.totalInvestment, 0);
    const income = ventures.reduce((a, v) => a + v.totalRevenue, 0);
    const net = income - invested;
    const roi = invested > 0 ? Math.round((net / invested) * 100) : 0;
    return { invested, income, net, roi };
  }, [ventures]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.title}>{t("ventures.title")}</Text>
        <Pressable onPress={() => navigation.navigate("AddVenture")} style={styles.iconBtn}>
          <Ionicons name="add" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <LinearGradient colors={["#07271D", "#0B1A30", "#16113A"]} style={styles.heroCard}>
        <Text style={styles.heroLabel}>{t("ventures.totalRoi")}</Text>
        <Text style={[styles.heroRoi, { color: roiColor(totals.roi) }]}>
          {totals.roi > 0 ? "+" : ""}{totals.roi}%
        </Text>
        <View style={styles.heroFooter}>
          <View>
            <Text style={styles.heroMetaLabel}>{t("ventures.invested")}</Text>
            <Text style={styles.heroMetaValue}>{formatCurrency(totals.invested)}</Text>
          </View>
          <View>
            <Text style={styles.heroMetaLabel}>{t("ventures.income")}</Text>
            <Text style={styles.heroMetaValue}>{formatCurrency(totals.income)}</Text>
          </View>
          <View>
            <Text style={styles.heroMetaLabel}>{t("ventures.netBalance")}</Text>
            <Text style={[styles.heroMetaValue, { color: roiColor(totals.net) }]}>
              {formatCurrency(totals.net)}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {ventures.length ? (
        <View style={styles.list}>
          {ventures.map((v) => (
            <VentureCard key={v.id} venture={v} onPress={() => navigation.navigate("VentureDetail", { ventureId: v.id })} />
          ))}
        </View>
      ) : (
        <EmptyState
          icon="🚀"
          title={t("ventures.empty")}
          subtitle={t("ventures.emptySubtitle")}
          actionLabel={t("ventures.addVenture")}
          onAction={() => navigation.navigate("AddVenture")}
        />
      )}

      <Pressable style={styles.addBtn} onPress={() => navigation.navigate("AddVenture")}>
        <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
        <Text style={styles.addText}>{t("ventures.addVenture")}</Text>
      </Pressable>
    </ScrollView>
  );
}

function VentureCard({ venture, onPress }: { venture: VentureDto; onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardIcon}>
        <Text style={styles.cardEmoji}>{venture.icon || "🚀"}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardName} numberOfLines={1}>{venture.name}</Text>
          <View style={[styles.roiPill, { borderColor: roiColor(venture.roiPercentage) }]}>
            <Text style={[styles.roiPillText, { color: roiColor(venture.roiPercentage) }]}>
              {venture.roiPercentage > 0 ? "+" : ""}{Math.round(venture.roiPercentage)}%
            </Text>
          </View>
        </View>
        <Text style={styles.cardMeta}>
          {t("ventures.batchCount", { count: venture.batchCount })} · {t("ventures.netBalance")}{" "}
          <Text style={{ color: roiColor(venture.netBalance) }}>{formatCurrency(venture.netBalance)}</Text>
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 130, gap: spacing.lg },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
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
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.lg,
    gap: 4,
  },
  heroLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    letterSpacing: 1.4,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  heroRoi: {
    fontSize: 40,
    fontFamily: typography.fontFamily.monoExtraBold,
  },
  heroFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  heroMetaLabel: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 10,
    fontFamily: typography.fontFamily.body,
  },
  heroMetaValue: {
    marginTop: 2,
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: typography.fontFamily.monoSemiBold,
  },
  list: { gap: spacing.sm },
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
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgCardAlt,
  },
  cardEmoji: { fontSize: 22 },
  cardBody: { flex: 1, gap: 4 },
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
  roiPill: {
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: spacing.sm,
  },
  roiPillText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.monoSemiBold,
  },
  cardMeta: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.body,
    fontSize: 12,
  },
  addBtn: {
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
  addText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: 15,
  },
}));
