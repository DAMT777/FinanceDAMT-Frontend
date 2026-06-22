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

import { moderateScale } from "../utils/responsive";

// Font sizes and line heights are moderately scaled to the device width so text
// shrinks on compact phones and grows on large ones without becoming oversized.
export const fontSize = {
  xs: moderateScale(12),
  sm: moderateScale(14),
  md: moderateScale(16),
  lg: moderateScale(18),
  xl: moderateScale(20),
  xxl: moderateScale(24),
  display: moderateScale(40),
  displayLarge: moderateScale(56),
} as const;

export const lineHeight = {
  xs: moderateScale(16),
  sm: moderateScale(20),
  md: moderateScale(24),
  lg: moderateScale(26),
  xl: moderateScale(28),
  xxl: moderateScale(32),
  display: moderateScale(48),
  displayLarge: moderateScale(64),
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
