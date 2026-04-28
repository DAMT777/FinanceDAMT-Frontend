import { colors as designColors } from "../constants/colors";

export const colors = {
  ...designColors,

  // Legacy aliases to keep current screens working during migration.
  background: designColors.bg,
  card: designColors.bgCard,
  border: designColors.bgCardBorder,
  accentSoft: designColors.primaryGlow,
  danger: designColors.expense,
} as const;
