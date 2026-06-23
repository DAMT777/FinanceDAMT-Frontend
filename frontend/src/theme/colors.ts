import { colors as designColors } from "../constants/colors";

export const colors = {
  ...designColors,

  background: designColors.bg,
  card: designColors.bgCard,
  border: designColors.bgCardBorder,
  accentSoft: designColors.primaryGlow,
  danger: designColors.expense,
} as const;
