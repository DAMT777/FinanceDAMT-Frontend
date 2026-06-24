import { dark, ThemeColors } from "../theme/palettes";

// Live, mutable active palette. The theme store swaps these values in place (via
// applyTheme) so every module that imported `colors` reflects the active theme.
// Module-level StyleSheets read the theme through `makeStyles`; inline JSX
// usages update on the app re-render the theme store triggers.
export const colors: ThemeColors = { ...dark };

export type AppColors = ThemeColors;
