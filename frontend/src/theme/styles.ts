import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from "react-native";
import { ThemeColors, ThemeName, palettes } from "./palettes";

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

let activeTheme: ThemeName = "dark";

export function setActiveTheme(name: ThemeName): void {
  activeTheme = name;
}

/**
 * Drop-in replacement for StyleSheet.create that is theme-aware. The returned
 * object resolves each style lazily against the active theme at access time, so
 * module-level style declarations restyle when the app re-renders on a theme
 * change — no per-component wiring required.
 */
export function makeStyles<T extends NamedStyles<T> | NamedStyles<unknown>>(
  factory: (colors: ThemeColors) => T,
): T {
  const cache: Partial<Record<ThemeName, T>> = {};
  return new Proxy({} as T, {
    get(_target, prop) {
      let sheet = cache[activeTheme];
      if (!sheet) {
        sheet = StyleSheet.create(factory(palettes[activeTheme]));
        cache[activeTheme] = sheet;
      }
      return sheet[prop as keyof T];
    },
  });
}
