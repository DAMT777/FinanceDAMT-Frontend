import { colors } from "../constants/colors";
import { ThemeName, palettes } from "./palettes";
import { setActiveTheme } from "./styles";

export { makeStyles, setActiveTheme } from "./styles";
export { palettes } from "./palettes";
export type { ThemeColors, ThemeName } from "./palettes";

/** Activates a theme: updates the live `colors` object and the style resolver. */
export function applyTheme(name: ThemeName): void {
  setActiveTheme(name);
  Object.assign(colors, palettes[name]);
}
