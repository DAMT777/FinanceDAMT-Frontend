import { useMemo } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { BarChart as GiftedBarChart } from "react-native-gifted-charts";
import { useTranslation } from "react-i18next";
import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import { MonthlyTrendDto } from "../../types/api";

interface IncomeExpenseChartProps {
  data: MonthlyTrendDto[];
  /** Short axis label for each month (already localized). */
  monthLabel: (point: MonthlyTrendDto) => string;
  /** Compact currency formatter for the tooltip / reference values. */
  formatShort: (value: number) => string;
}

/** Rounds a value up to a "nice" axis maximum so bars never touch the top. */
function niceMax(value: number): number {
  if (value <= 0) return 1000;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

export default function IncomeExpenseChart({ data, monthLabel, formatShort }: IncomeExpenseChartProps) {
  const { t } = useTranslation();
  const screenWidth = Dimensions.get("window").width;

  const { barData, maxValue, totalIncome, totalExpenses } = useMemo(() => {
    const points = data.slice(-6);
    let max = 0;
    let income = 0;
    let expenses = 0;

    const bars = points.flatMap((point) => {
      max = Math.max(max, point.income, point.expenses);
      income += point.income;
      expenses += point.expenses;

      return [
        {
          value: point.income,
          label: monthLabel(point),
          spacing: 3,
          labelWidth: 38,
          labelTextStyle: styles.axisLabel,
          frontColor: colors.income,
        },
        {
          value: point.expenses,
          frontColor: colors.expense,
        },
      ];
    });

    return { barData: bars, maxValue: niceMax(max), totalIncome: income, totalExpenses: expenses };
  }, [data, monthLabel]);

  // Width budget: each month = 2 bars (~9px) + inner gap + group gap.
  const groupCount = Math.max(1, barData.length / 2);
  const spacing = groupCount > 5 ? 18 : 26;

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={t("dashboard.chartA11y", {
        income: formatShort(totalIncome),
        expenses: formatShort(totalExpenses),
        count: groupCount,
      })}
    >
      {/* Legend — establishes meaning before the chart (proximity + hierarchy) */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.income }]} />
          <Text style={styles.legendText}>{t("dashboard.income")}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.expense }]} />
          <Text style={styles.legendText}>{t("dashboard.expenses")}</Text>
        </View>
      </View>

      <GiftedBarChart
        data={barData}
        barWidth={9}
        spacing={spacing}
        initialSpacing={14}
        roundedTop
        barBorderTopLeftRadius={3}
        barBorderTopRightRadius={3}
        maxValue={maxValue}
        noOfSections={4}
        yAxisThickness={0}
        xAxisThickness={0}
        rulesColor={colors.bgCardBorder}
        rulesType="dashed"
        yAxisTextStyle={styles.yAxisLabel}
        formatYLabel={(label: string) => formatShort(Number(label))}
        width={screenWidth - 120}
        height={150}
        isAnimated
        animationDuration={700}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  axisLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: typography.fontFamily.body,
    textAlign: "center",
  },
  yAxisLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontFamily: typography.fontFamily.body,
  },
});
