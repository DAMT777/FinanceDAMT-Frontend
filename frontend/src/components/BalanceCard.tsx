import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import AnimatedNumber from "./AnimatedNumber";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { makeStyles } from "../theme/styles";

interface BalanceCardProps {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  monthChange: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function BalanceCard({
  totalBalance,
  totalIncome,
  totalExpenses,
  monthChange,
}: BalanceCardProps) {
  const { t } = useTranslation();
  const isPositive = monthChange >= 0;

  return (
    <View style={styles.shadow}>
      <LinearGradient colors={["#0A1F14", "#0D1228"]} style={styles.card}>
        <View style={styles.orb} />

        <Text style={styles.label}>{t("dashboard.totalBalance")}</Text>

        <AnimatedNumber
          value={totalBalance}
          formatter={formatCurrency}
          style={styles.balance}
          duration={1000}
        />

        <View style={styles.changeRow}>
          <Ionicons
            name={isPositive ? "arrow-up" : "arrow-down"}
            size={13}
            color={isPositive ? colors.income : colors.expense}
          />
          <Text style={[styles.changeText, { color: isPositive ? colors.income : colors.expense }]}>
            {formatCurrency(Math.abs(monthChange))} {t("dashboard.thisMonth")}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <View style={styles.summaryIconRow}>
              <Ionicons name="arrow-up-circle-outline" size={15} color={colors.income} />
              <Text style={styles.summaryLabel}>{t("dashboard.income")}</Text>
            </View>
            <AnimatedNumber
              value={totalIncome}
              formatter={formatCurrency}
              style={[styles.summaryValue, { color: colors.income }]}
              duration={900}
            />
          </View>

          <View style={styles.vertDivider} />

          <View style={styles.summaryItem}>
            <View style={styles.summaryIconRow}>
              <Ionicons name="arrow-down-circle-outline" size={15} color={colors.expense} />
              <Text style={styles.summaryLabel}>{t("dashboard.expenses")}</Text>
            </View>
            <AnimatedNumber
              value={totalExpenses}
              formatter={formatCurrency}
              style={[styles.summaryValue, { color: colors.expense }]}
              duration={900}
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = makeStyles((colors) => ({
  shadow: {
    borderRadius: 24,
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(0,214,143,0.2)",
    overflow: "hidden",
    padding: spacing.xl,
  },
  orb: {
    position: "absolute",
    right: -20,
    bottom: -20,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(0,214,143,0.08)",
  },
  label: {
    color: "rgba(255,255,255,0.5)",
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    letterSpacing: 1.5,
  },
  balance: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.mono,
    fontSize: 38,
    fontWeight: "800",
  },
  changeRow: {
    marginTop: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  changeText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
  },
  divider: {
    marginTop: spacing.md,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  summaryRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    gap: 4,
  },
  summaryIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.5)",
    fontFamily: typography.fontFamily.body,
    fontSize: 11,
  },
  summaryValue: {
    fontFamily: typography.fontFamily.mono,
    fontSize: 15,
    fontWeight: "600",
  },
  vertDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: spacing.md,
  },
}));
