import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Dimensions, Text, View } from "react-native";
import { LineChart as GiftedLineChart } from "react-native-gifted-charts";
import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import { MonthlyBalancePointDto } from "../../types/api";
import { makeStyles } from "../../theme/styles";

interface BalanceTrendChartProps {
  data: MonthlyBalancePointDto[];
  locale: string;
  currentLabel: string;
  changeLabel: string;
  formatMoney: (value: number) => string;
  formatShort: (value: number) => string;
}

function monthLabel(year: number, month: number, locale: string): string {
  return new Date(year, month - 1, 1)
    .toLocaleDateString(locale, { month: "short" })
    .replace(".", "");
}

// Single-series area line for net-worth trajectory. One brand color, no rainbow:
// the shape of the line is the message. The header pairs the latest value with
// its change over the window so the figure reads as progress, not a lone number.
export default function BalanceTrendChart({
  data,
  locale,
  currentLabel,
  changeLabel,
  formatMoney,
  formatShort,
}: BalanceTrendChartProps) {
  const screenWidth = Dimensions.get("window").width;

  const { points, current, change, positive } = useMemo(() => {
    const pts = data.map((p) => ({
      value: p.balance,
      label: monthLabel(p.year, p.month, locale),
    }));
    const last = data.length ? data[data.length - 1].balance : 0;
    const first = data.length ? data[0].balance : 0;
    const delta = last - first;
    return { points: pts, current: last, change: delta, positive: delta >= 0 };
  }, [data, locale]);

  const tone = positive ? colors.income : colors.expense;

  return (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.caption}>{currentLabel}</Text>
          <Text style={styles.value}>{formatMoney(current)}</Text>
        </View>
        <View style={[styles.chip, { backgroundColor: `${tone}1F`, borderColor: `${tone}40` }]}>
          <Ionicons name={positive ? "trending-up" : "trending-down"} size={12} color={tone} />
          <Text style={[styles.chipText, { color: tone }]}>
            {positive ? "+" : "-"}
            {formatShort(Math.abs(change))} {changeLabel}
          </Text>
        </View>
      </View>

      <GiftedLineChart
        data={points}
        curved
        areaChart
        thickness={2}
        color={colors.primary}
        startFillColor={colors.primary}
        endFillColor={colors.bgCard}
        startOpacity={0.25}
        endOpacity={0.02}
        hideDataPoints={false}
        dataPointsColor={colors.primary}
        dataPointsRadius={3}
        yAxisThickness={0}
        xAxisThickness={0}
        hideRules
        yAxisTextStyle={styles.axisLabel}
        xAxisLabelTextStyle={styles.axisLabel}
        formatYLabel={(label: string) => formatShort(Number(label))}
        noOfSections={3}
        width={screenWidth - 110}
        height={130}
        initialSpacing={12}
        endSpacing={8}
        isAnimated
        animationDuration={700}
      />
    </View>
  );
}

const styles = makeStyles((colors) => ({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  caption: {
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: typography.fontFamily.bodyMedium,
  },
  value: {
    marginTop: 4,
    color: colors.textPrimary,
    fontSize: 22,
    fontFamily: typography.fontFamily.monoExtraBold,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  chipText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.monoSemiBold,
  },
  axisLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontFamily: typography.fontFamily.body,
  },
}));
