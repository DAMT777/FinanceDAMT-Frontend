import { LineChart as GiftedLineChart } from "react-native-gifted-charts";
import { StyleSheet, View } from "react-native";
import { colors } from "../../constants/colors";

interface LineChartPoint {
  value: number;
  label: string;
}

interface LineChartProps {
  data: LineChartPoint[];
}

export default function LineChart({ data }: LineChartProps) {
  return (
    <View style={styles.container}>
      <GiftedLineChart
        data={data}
        curved
        areaChart
        hideDataPoints
        startFillColor={colors.primary}
        endFillColor={colors.primaryGlow}
        hideRules
        hideYAxisText
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard,
    borderRadius: 20,
    padding: 12,
  },
});
