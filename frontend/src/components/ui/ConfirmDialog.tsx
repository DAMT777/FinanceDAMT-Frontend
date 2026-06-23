import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const overlayOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.9);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 200 });
      cardScale.value = withSpring(1, { damping: 18, stiffness: 260 });
      cardOpacity.value = withTiming(1, { duration: 180 });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 160 });
      cardScale.value = withTiming(0.9, { duration: 160 });
      cardOpacity.value = withTiming(0, { duration: 160 });
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <Pressable style={styles.backdrop} onPress={onCancel} />
      <Animated.View style={[styles.card, cardStyle]}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.actions}>
          <Pressable style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>{cancelLabel}</Text>
          </Pressable>
          <Pressable
            style={[styles.confirmBtn, destructive && styles.confirmBtnDestructive]}
            onPress={onConfirm}
          >
            <Text style={[styles.confirmText, destructive && styles.confirmTextDestructive]}>
              {confirmLabel}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: "82%",
    maxWidth: 360,
    backgroundColor: colors.bgElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    padding: spacing.xl,
    gap: spacing.sm,
    zIndex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: 18,
  },
  message: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.sm,
  },
  confirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnDestructive: {
    backgroundColor: "rgba(255,71,87,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,71,87,0.4)",
  },
  confirmText: {
    color: colors.textInverse,
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: typography.fontSize.sm,
  },
  confirmTextDestructive: {
    color: colors.expense,
  },
});
