import { useMemo } from "react";
import { Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import { getCategoryDisplay } from "../../utils/categoryIcons";
import { CategoryExpenseDto } from "../../types/api";
import { makeStyles } from "../../theme/styles";

interface CategoryDonutChartProps {
  data: CategoryExpenseDto[];
  centerLabel: string;
  othersLabel: string;
  topLabel: string;
  formatShort: (value: number) => string;
}

const MAX_SLICES = 5;
// Rank-encoded opacity ramp over a single accent hue. Distinct rainbow colors
// would add no information here; instead the darkest slice = the biggest
// expense, so the eye lands on where the money actually goes.
const RAMP_ALPHA = [1, 0.72, 0.52, 0.38, 0.28];
const OTHERS_ALPHA = 0.18;

function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${a}`;
}

export default function CategoryDonutChart({
  data,
  centerLabel,
  othersLabel,
  topLabel,
  formatShort,
}: CategoryDonutChartProps) {
  const { slices, total, top } = useMemo(() => {
    const positive = data.filter((d) => d.amount > 0).sort((a, b) => b.amount - a.amount);
    const sum = positive.reduce((acc, d) => acc + d.amount, 0);

    const head = positive.slice(0, MAX_SLICES);
    const rest = positive.slice(MAX_SLICES);
    const restTotal = rest.reduce((acc, d) => acc + d.amount, 0);

    const built = head.map((d, i) => ({
      name: d.categoryName,
      emoji: getCategoryDisplay(d.categoryName).emoji,
      amount: d.amount,
      pct: sum > 0 ? Math.round((d.amount / sum) * 100) : 0,
      color: withAlpha(colors.accent, RAMP_ALPHA[i] ?? OTHERS_ALPHA),
    }));

    if (restTotal > 0) {
      built.push({
        name: othersLabel,
        emoji: "•••",
        amount: restTotal,
        pct: sum > 0 ? Math.round((restTotal / sum) * 100) : 0,
        color: withAlpha(colors.accent, OTHERS_ALPHA),
      });
    }

    return { slices: built, total: sum, top: built[0] ?? null };
  }, [data, othersLabel]);

  const pieData =
    slices.length > 0
      ? slices.map((s) => ({ value: s.amount, color: s.color }))
      : [{ value: 1, color: colors.bgCardBorder }];

  return (
    <View style={styles.row}>
      <View style={styles.chartCol}>
        <PieChart
          key={colors.bgCard}
          data={pieData}
          donut
          radius={62}
          innerRadius={44}
          innerCircleColor={colors.bgCard}
          centerLabelComponent={() => (
            <View style={{ alignItems: "center" }}>
              <Text style={styles.centerAmount}>{formatShort(total)}</Text>
              <Text style={styles.centerLabel}>{centerLabel}</Text>
            </View>
          )}
        />
      </View>

      <View style={styles.legend}>
        {top ? (
          <View style={styles.topBanner}>
            <Text style={styles.topBadge}>{topLabel}</Text>
            <Text style={styles.topName} numberOfLines={1}>
              {top.emoji} {top.name}
            </Text>
            <Text style={styles.topPct}>{top.pct}%</Text>
          </View>
        ) : null}

        {slices.slice(top ? 1 : 0).map((s) => (
          <View key={s.name} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: s.color }]} />
            <Text style={styles.legendName} numberOfLines={1}>
              {s.name}
            </Text>
            <Text style={styles.legendPct}>{s.pct}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = makeStyles((colors) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  chartCol: {
    width: 124,
    alignItems: "center",
    justifyContent: "center",
  },
  centerAmount: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: typography.fontFamily.monoSemiBold,
  },
  centerLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: typography.fontFamily.body,
  },
  legend: {
    flex: 1,
    marginLeft: 16,
    gap: 8,
  },
  topBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgCardBorder,
  },
  topBadge: {
    color: colors.accent,
    fontSize: 9,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    fontFamily: typography.fontFamily.bodyMedium,
    backgroundColor: `${colors.accent}22`,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: "hidden",
  },
  topName: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  topPct: {
    color: colors.accent,
    fontSize: 13,
    fontFamily: typography.fontFamily.monoSemiBold,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendName: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
  },
  legendPct: {
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: typography.fontFamily.mono,
  },
}));
