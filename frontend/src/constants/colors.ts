export const colors = {
  bg: "#080812",
  bgCard: "#0F0F1E",
  bgCardAlt: "#141426",
  bgElevated: "#141426",
  bgCardBorder: "#1E1E38",

  primary: "#00D68F",
  primaryDark: "#00B87A",
  primaryGlow: "rgba(0,214,143,0.15)",
  accent: "#6C63FF",
  accentGlow: "rgba(108,99,255,0.15)",

  income: "#00D68F",
  expense: "#FF4757",
  warning: "#FFB830",
  info: "#3ECFF8",

  textPrimary: "#F0F0FF",
  textSecondary: "#8080AA",
  textMuted: "#44445A",
  textInverse: "#080812",

  gradientPrimary: ["#00D68F", "#6C63FF"] as const,
  gradientAccent: ["#6C63FF", "#FF6B9D"] as const,
  gradientDark: ["#141426", "#080812"] as const,
  gradientCard: ["#0F0F1E", "#0F0F1E"] as const,
  gradientBalance: ["#0D2818", "#141426"] as const,

  gradientHero: ["#07271D", "#0B1A30", "#16113A"] as const,
  gradientBrand: ["#00E5A0", "#3ECFF8", "#7C5CFC"] as const,
  glass: "rgba(255,255,255,0.05)",
  hairline: "rgba(255,255,255,0.10)",
  emeraldGlow: "rgba(0,230,160,0.20)",
} as const;

export type AppColors = typeof colors;
