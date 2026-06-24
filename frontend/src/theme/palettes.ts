export type ThemeName = "dark" | "light";

export type Gradient = readonly [string, string, ...string[]];

export interface ThemeColors {
  bg: string;
  bgCard: string;
  bgCardAlt: string;
  bgElevated: string;
  bgCardBorder: string;

  primary: string;
  primaryDark: string;
  primaryGlow: string;
  accent: string;
  accentGlow: string;

  income: string;
  expense: string;
  warning: string;
  info: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  gradientPrimary: Gradient;
  gradientAccent: Gradient;
  gradientDark: Gradient;
  gradientCard: Gradient;
  gradientBalance: Gradient;
  gradientHero: Gradient;
  gradientBrand: Gradient;

  glass: string;
  hairline: string;
  emeraldGlow: string;
}

export const dark: ThemeColors = {
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

  gradientPrimary: ["#00D68F", "#6C63FF"],
  gradientAccent: ["#6C63FF", "#FF6B9D"],
  gradientDark: ["#141426", "#080812"],
  gradientCard: ["#0F0F1E", "#0F0F1E"],
  gradientBalance: ["#0D2818", "#141426"],
  gradientHero: ["#07271D", "#0B1A30", "#16113A"],
  gradientBrand: ["#00E5A0", "#3ECFF8", "#7C5CFC"],

  glass: "rgba(255,255,255,0.05)",
  hairline: "rgba(255,255,255,0.10)",
  emeraldGlow: "rgba(0,230,160,0.20)",
};

// Light theme: surfaces and text invert, while brand/semantic colors and the
// featured gradients (which carry white text) stay so the identity is preserved.
export const light: ThemeColors = {
  bg: "#F3F5FA",
  bgCard: "#FFFFFF",
  bgCardAlt: "#EAEDF4",
  bgElevated: "#FFFFFF",
  bgCardBorder: "#E1E5EE",

  primary: "#00B87A",
  primaryDark: "#009E68",
  primaryGlow: "rgba(0,184,122,0.12)",
  accent: "#6C63FF",
  accentGlow: "rgba(108,99,255,0.12)",

  income: "#00A86B",
  expense: "#E5384A",
  warning: "#D98200",
  info: "#1697BC",

  textPrimary: "#13152B",
  textSecondary: "#5C5F77",
  textMuted: "#9A9DB2",
  textInverse: "#FFFFFF",

  gradientPrimary: ["#00D68F", "#6C63FF"],
  gradientAccent: ["#6C63FF", "#FF6B9D"],
  gradientDark: ["#141426", "#080812"],
  gradientCard: ["#FFFFFF", "#FFFFFF"],
  gradientBalance: ["#0D2818", "#141426"],
  gradientHero: ["#07271D", "#0B1A30", "#16113A"],
  gradientBrand: ["#00E5A0", "#3ECFF8", "#7C5CFC"],

  glass: "rgba(15,18,40,0.04)",
  hairline: "rgba(15,18,40,0.08)",
  emeraldGlow: "rgba(0,184,122,0.16)",
};

export const palettes: Record<ThemeName, ThemeColors> = { dark, light };
