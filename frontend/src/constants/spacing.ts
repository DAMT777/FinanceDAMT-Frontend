import { scale } from "../utils/responsive";

export const spacing = {
  xxs: scale(4),
  xs: scale(8),
  sm: scale(12),
  md: scale(16),
  lg: scale(20),
  xl: scale(24),
  xxl: scale(32),
  xxxl: scale(40),
  xxxxl: scale(48),
} as const;

export const spacingScale = [
  spacing.xxs,
  spacing.xs,
  spacing.sm,
  spacing.md,
  spacing.lg,
  spacing.xl,
  spacing.xxl,
  spacing.xxxl,
  spacing.xxxxl,
] as const;

export type SpacingScale = typeof spacing;
