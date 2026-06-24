import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { BudgetDto } from "../types/api";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { makeStyles } from "../theme/styles";

interface BudgetBarProps {
  budget: BudgetDto;
}

function getGradientColors(percentage: number): [string, string] {
  if (percentage >= 100) return ["#FF4757", "#FF0033"];
  if (percentage >= 80) return ["#FFB830", "#FF8C00"];
  return ["#00D68F", "#00B4D8"];
}

function getPercentageBadgeColor(percentage: number): string {
  if (percentage >= 100) return colors.expense;
  if (percentage >= 80) return colors.warning;
  return colors.primary;
}

export default function BudgetBar({ budget }: BudgetBarProps) {
  const percentage = Math.min(100, Math.max(0, budget.percentage));
  const gradColors = getGradientColors(percentage);
  const badgeColor = getPercentageBadgeColor(percentage);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <View style={[styles.iconCircle, { backgroundColor: `${badgeColor}22` }]}>
            <Ionicons name="stats-chart-outline" size={16} color={badgeColor} />
          </View>
          <View>
            <Text style={styles.title}>{budget.categoryName}</Text>
            <Text style={styles.limitText}>Limit: {budget.monthlyLimit.toLocaleString("es-CO")}</Text>
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: `${badgeColor}22`, borderColor: `${badgeColor}55` }]}>
          <Text style={[styles.badgeText, { color: badgeColor }]}>{percentage.toFixed(0)}%</Text>
        </View>
      </View>

      <View style={styles.track}>
        <LinearGradient
          colors={gradColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${percentage}%` as unknown as number }]}
        />
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.value}>
          <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.mono }}>
            {budget.spentAmount.toLocaleString("es-CO")}
          </Text>
          <Text style={{ color: colors.textMuted }}>
            {" "}of {budget.monthlyLimit.toLocaleString("es-CO")}
          </Text>
        </Text>
        <Text style={styles.daysLeft}>Budget tracker</Text>
      </View>
    </View>
  );
}

const styles = makeStyles((colors) => ({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    backgroundColor: colors.bgCard,
    padding: spacing.md,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.sm,
  },
  limitText: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.body,
    fontSize: 11,
    marginTop: 1,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  badgeText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: 12,
    fontWeight: "600",
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.bgCardBorder,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  value: {
    fontFamily: typography.fontFamily.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  daysLeft: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.body,
    fontSize: 11,
  },
}));
