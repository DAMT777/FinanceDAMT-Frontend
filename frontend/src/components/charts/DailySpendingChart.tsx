import { useMemo } from "react";
import { Dimensions, Text, View } from "react-native";
import { BarChart as GiftedBarChart } from "react-native-gifted-charts";
import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import { DailySpendingPointDto } from "../../types/api";
import { makeStyles } from "../../theme/styles";

interface DailySpendingChartProps {
  data: DailySpendingPointDto[];
  avgLabel: string;
  peakLabel: string;
  formatShort: (value: number) => string;
}

function niceMax(value: number): number {
  if (value <= 0) return 1000;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

// Daily expense bars for the current month. Every bar shares one neutral tone;
// only the single highest-spend day is painted with the accent. That lone
// highlight is the insight — the day the budget took its biggest hit — without
// the reader having to scan every bar.
export default function DailySpendingChart({
  data,
  avgLabel,
  peakLabel,
  formatShort,
}: DailySpendingChartProps) {
  const screenWidth = Dimensions.get("window").width;

  const { bars, max, avg, peakDay } = useMemo(() => {
    const peak = data.reduce((m, d) => (d.amount > m ? d.amount : m), 0);
    const total = data.reduce((acc, d) => acc + d.amount, 0);
    const average = data.length ? total / data.length : 0;
    let peakDayNum = 0;

    const built = data.map((d) => {
      const isPeak = d.amount === peak && peak > 0;
      if (isPeak) peakDayNum = d.day;
      return {
        value: d.amount,
        // Keep the axis readable: label only every 5th day, plus the peak.
        label: d.day % 5 === 0 || isPeak ? String(d.day) : "",
        labelTextStyle: styles.axisLabel,
        frontColor: isPeak ? colors.accent : colors.textMuted,
      };
    });

    return { bars: built, max: niceMax(peak), avg: average, peakDay: peakDayNum };
  }, [data]);

  const barWidth = data.length > 20 ? 5 : data.length > 12 ? 8 : 12;
  const spacing = data.length > 20 ? 4 : data.length > 12 ? 7 : 12;

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.avg}>
          {avgLabel} <Text style={styles.avgValue}>{formatShort(avg)}</Text>
        </Text>
        {peakDay > 0 ? (
          <View style={styles.peakChip}>
            <View style={styles.peakDot} />
            <Text style={styles.peakText}>
              {peakLabel} {peakDay}
            </Text>
          </View>
        ) : null}
      </View>

      <GiftedBarChart
        data={bars}
        barWidth={barWidth}
        spacing={spacing}
        initialSpacing={10}
        roundedTop
        barBorderTopLeftRadius={2}
        barBorderTopRightRadius={2}
        maxValue={max}
        noOfSections={3}
        yAxisThickness={0}
        xAxisThickness={0}
        rulesColor={colors.bgCardBorder}
        rulesType="dashed"
        yAxisTextStyle={styles.axisLabel}
        formatYLabel={(label: string) => formatShort(Number(label))}
        width={screenWidth - 110}
        height={140}
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
    alignItems: "center",
    marginBottom: 14,
  },
  avg: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: typography.fontFamily.body,
  },
  avgValue: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.monoSemiBold,
  },
  peakChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: `${colors.accent}40`,
    backgroundColor: `${colors.accent}1F`,
    borderRadius: 99,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  peakDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  peakText: {
    color: colors.accent,
    fontSize: 11,
    fontFamily: typography.fontFamily.monoSemiBold,
  },
  axisLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontFamily: typography.fontFamily.body,
    textAlign: "center",
  },
}));
