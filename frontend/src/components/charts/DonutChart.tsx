import { PieChart } from "react-native-gifted-charts";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";

interface DonutChartItem {
  value: number;
  color: string;
  label: string;
}

interface DonutChartProps {
  data: DonutChartItem[];
  total: number;
}

export default function DonutChart({ data, total }: DonutChartProps) {
  return (
    <View style={styles.container}>
      <PieChart
        data={data.map((item) => ({ value: item.value, color: item.color }))}
        donut
        radius={90}
        innerRadius={60}
      />
      <View style={styles.centerLabel}>
        <Text style={styles.total}>{total.toLocaleString("es-CO")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerLabel: {
    position: "absolute",
  },
  total: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.mono,
    fontSize: 20,
  },
});
