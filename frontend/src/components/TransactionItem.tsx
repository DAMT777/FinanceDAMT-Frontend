import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { TransactionDto } from "../types/api";
import { getCategoryDisplay } from "../utils/categoryIcons";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";

interface TransactionItemProps {
  transaction: TransactionDto;
  onPress?: () => void;
}

function formatAmount(amount: number, type: TransactionDto["type"]): string {
  const value = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);

  return type === "Expense" ? `-${value}` : `+${value}`;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const amountColor = transaction.type === "Expense" ? colors.expense : colors.income;
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.container, animStyle]}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 20 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 20 }); }}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: `${transaction.categoryColor}26` },
        ]}
      >
        <Text style={styles.iconText}>
          {getCategoryDisplay(transaction.categoryName, transaction.categoryColor).emoji}
        </Text>
      </View>

      <View style={styles.mainInfo}>
        <Text style={styles.title} numberOfLines={1}>
          {transaction.description || transaction.categoryName}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {transaction.accountName} · {transaction.categoryName}
        </Text>
      </View>

      <View style={styles.rightInfo}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {formatAmount(transaction.amount, transaction.type)}
        </Text>
        <Text style={styles.time}>
          {new Date(transaction.date).toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    backgroundColor: colors.bgCard,
    padding: spacing.md,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 20,
  },
  mainInfo: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 14,
  },
  subtitle: {
    marginTop: 2,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
  },
  rightInfo: {
    alignItems: "flex-end",
  },
  amount: {
    fontFamily: typography.fontFamily.mono,
    fontSize: 15,
    fontWeight: "700",
  },
  time: {
    marginTop: 2,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.body,
    fontSize: 11,
  },
});
