import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import ProgressRing from "./ProgressRing";
import { SavingGoalDto } from "../types/api";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { makeStyles } from "../theme/styles";

interface GoalCardProps {
  goal: SavingGoalDto;
  onContribute?: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function GoalCard({ goal, onContribute }: GoalCardProps) {
  const progress = Math.max(0, Math.min(100, goal.progressPercentage));
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={animStyle}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 20 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 20 }); }}
    >
      <LinearGradient colors={["#0D1F14", "#101028"]} style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.iconWrap}>
            <Ionicons name="trophy-outline" size={18} color={colors.warning} />
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {goal.name}
          </Text>
        </View>

        <View style={styles.ringWrap}>
          <ProgressRing size={64} strokeWidth={6} progress={progress} color={colors.primary} />
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.current}>{formatCurrency(goal.currentAmount)}</Text>
          <Text style={styles.target}> / {formatCurrency(goal.targetAmount)}</Text>
        </View>

        {onContribute ? (
          <Pressable style={styles.contributeBtn} onPress={onContribute}>
            <Text style={styles.contributeBtnText}>+ Contribute</Text>
          </Pressable>
        ) : null}
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = makeStyles((colors) => ({
  card: {
    width: 160,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0,214,143,0.2)",
    padding: spacing.md,
    gap: spacing.sm,
  },
  topRow: {
    gap: 4,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,184,48,0.12)",
  },
  name: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.sm,
  },
  ringWrap: {
    alignSelf: "center",
    marginVertical: spacing.xs,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  current: {
    color: colors.primary,
    fontFamily: typography.fontFamily.mono,
    fontSize: 13,
    fontWeight: "600",
  },
  target: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.body,
    fontSize: 11,
  },
  contributeBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 6,
    alignItems: "center",
  },
  contributeBtnText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: 13,
  },
}));
