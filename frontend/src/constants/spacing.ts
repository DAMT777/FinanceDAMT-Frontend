export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  xxxxl: 48,
} as const;

export const spacingScale = [4, 8, 12, 16, 20, 24, 32, 40, 48] as const;

export type SpacingScale = typeof spacing;
