import { BarChart as GiftedBarChart } from "react-native-gifted-charts";
import { StyleSheet, View } from "react-native";
import { colors } from "../../constants/colors";
import { makeStyles } from "../../theme/styles";

interface BarChartPoint {
  value: number;
  label: string;
  color: string;
}

interface BarChartProps {
  data: BarChartPoint[];
}

export default function BarChart({ data }: BarChartProps) {
  return (
    <View style={styles.container}>
      <GiftedBarChart
        data={data}
        hideRules
        hideYAxisText
        hideAxesAndRules
        frontColor={colors.primary}
        roundedTop
      />
    </View>
  );
}

const styles = makeStyles((colors) => ({
  container: {
    backgroundColor: colors.bgCard,
    borderRadius: 20,
    padding: 12,
  },
}));
