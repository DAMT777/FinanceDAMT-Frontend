import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { makeStyles } from "../theme/styles";

interface FixedVsVariableBarProps {
  // Monthly fixed expenses (subscriptions total).
  fixed: number;
  // Variable expenses for the month (one-off expense transactions).
  variable: number;
  formatMoney: (value: number) => string;
}

/**
 * Two-segment stacked bar contrasting fixed expenses (subscriptions) against
 * variable expenses so the user can see how much of their spending is committed
 * vs discretionary.
 */
export default function FixedVsVariableBar({ fixed, variable, formatMoney }: FixedVsVariableBarProps) {
  const { t } = useTranslation();
  const total = fixed + variable;
  const fixedPct = total > 0 ? Math.round((fixed / total) * 100) : 0;
  const variablePct = total > 0 ? 100 - fixedPct : 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t("dashboard.expenseSplitTitle")}</Text>
        <Text style={styles.total}>{formatMoney(total)}</Text>
      </View>

      <View style={styles.track}>
        {total > 0 ? (
          <>
            <View
              style={[styles.segment, styles.fixedSeg, { flex: fixed || 0.0001 }]}
            />
            <View
              style={[styles.segment, styles.variableSeg, { flex: variable || 0.0001 }]}
            />
          </>
        ) : (
          <View style={[styles.segment, styles.emptySeg, { flex: 1 }]} />
        )}
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.accent }]} />
          <View>
            <Text style={styles.legendLabel}>
              {t("dashboard.fixedExpenses")} · {fixedPct}%
            </Text>
            <Text style={styles.legendValue}>{formatMoney(fixed)}</Text>
          </View>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.expense }]} />
          <View>
            <Text style={styles.legendLabel}>
              {t("dashboard.variableExpenses")} · {variablePct}%
            </Text>
            <Text style={styles.legendValue}>{formatMoney(variable)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = makeStyles((colors) => ({
  wrap: {
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgCardBorder,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: colors.textSecondary,
    fontSize: 12,
    letterSpacing: 0.6,
    fontFamily: typography.fontFamily.bodyMedium,
    textTransform: "uppercase",
  },
  total: {
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: typography.fontFamily.monoSemiBold,
  },
  track: {
    flexDirection: "row",
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: colors.bgCardAlt,
    gap: 2,
  },
  segment: {
    height: "100%",
  },
  fixedSeg: {
    backgroundColor: colors.accent,
    borderRadius: 6,
  },
  variableSeg: {
    backgroundColor: colors.expense,
    borderRadius: 6,
  },
  emptySeg: {
    backgroundColor: colors.bgCardAlt,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: typography.fontFamily.body,
  },
  legendValue: {
    marginTop: 1,
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: typography.fontFamily.monoSemiBold,
  },
}));
