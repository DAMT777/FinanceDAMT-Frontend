import * as Haptics from "expo-haptics";
import { ReactNode } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  children: ReactNode;
  style?: ViewStyle;
}

const HEIGHT_BY_SIZE: Record<ButtonSize, number> = {
  sm: 40,
  md: 48,
  lg: 56,
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  onPress,
  children,
  style,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 18, stiffness: 260 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 16, stiffness: 220 });
  };

  const handlePress = async () => {
    if (disabled || loading || !onPress) {
      return;
    }

    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        style={[
          styles.base,
          styles[variant],
          { height: HEIGHT_BY_SIZE[size] },
          (disabled || loading) && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={variant === "primary" ? colors.textInverse : colors.primary} />
        ) : (
          typeof children === "string" ? (
            <Text style={[styles.label, styles[`label_${variant}`]]}>{children}</Text>
          ) : (
            children
          )
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  danger: {
    backgroundColor: colors.expense,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  label_primary: {
    color: colors.textInverse,
  },
  label_secondary: {
    color: colors.primary,
  },
  label_ghost: {
    color: colors.primary,
  },
  label_danger: {
    color: colors.textPrimary,
  },
});
