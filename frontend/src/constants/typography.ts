export const fontFamily = {
  heading: "Sora_800ExtraBold",
  headingSemiBold: "Sora_600SemiBold",
  headingBold: "Sora_700Bold",
  body: "DMSans_400Regular",
  bodyMedium: "DMSans_500Medium",
  mono: "DMMono_700Bold",
  monoSemiBold: "DMMono_600SemiBold",
  monoExtraBold: "DMMono_700Bold",
  monoRegular: "DMMono_400Regular",
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  display: 40,
  displayLarge: 56,
} as const;

export const lineHeight = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 26,
  xl: 28,
  xxl: 32,
  display: 48,
  displayLarge: 64,
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semiBold: "600",
  bold: "700",
  extraBold: "800",
} as const;

export const typography = {
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
} as const;

export type Typography = typeof typography;
