import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { colors } from "../../constants/colors";
import { makeStyles } from "../../theme/styles";

interface SkeletonCardProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export default function SkeletonCard({
  width,
  height = 120,
  borderRadius = 20,
  style,
}: SkeletonCardProps) {
  const progress = useSharedValue(0);

  progress.value = withRepeat(
    withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
    -1,
    true,
  );

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 0.5, 1],
      [colors.bgCardBorder, colors.textMuted, colors.bgCardBorder],
    );

    return { backgroundColor };
  });

  return (
    <Animated.View
      style={[
        styles.base,
        styles.fullWidth,
        { height, borderRadius },
        typeof width === "number" ? { width } : null,
        animatedStyle,
        style,
      ]}
    />
  );
}

const styles = makeStyles((colors) => ({
  base: {
    overflow: "hidden",
  },
  fullWidth: {
    width: "100%",
  },
}));
