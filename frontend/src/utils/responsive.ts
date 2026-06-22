import { Dimensions, PixelRatio } from "react-native";

// Guideline sizes are based on a standard ~5.8" reference device (iPhone X/11),
// the canvas the current UI was designed against.
const GUIDELINE_BASE_WIDTH = 375;
const GUIDELINE_BASE_HEIGHT = 812;

const { width, height } = Dimensions.get("window");

// The app is locked to portrait, so the short side is normally the width.
// Compute both anyway so scaling stays correct regardless of orientation.
const shortDimension = Math.min(width, height);
const longDimension = Math.max(width, height);

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

// Clamp the raw ratios so small phones stay legible and large phones / tablets
// don't blow the layout up disproportionately.
const widthRatio = clamp(shortDimension / GUIDELINE_BASE_WIDTH, 0.85, 1.3);
const heightRatio = clamp(longDimension / GUIDELINE_BASE_HEIGHT, 0.85, 1.4);

/** Scales a size proportionally to the device width. Best for spacing/sizing. */
export const scale = (size: number) =>
  PixelRatio.roundToNearestPixel(size * widthRatio);

/** Scales a size proportionally to the device height. */
export const verticalScale = (size: number) =>
  PixelRatio.roundToNearestPixel(size * heightRatio);

/**
 * Scales a size but dampens the effect with `factor` (0–1, default 0.5).
 * Best for fonts and radii, where full proportional scaling feels too strong.
 */
export const moderateScale = (size: number, factor = 0.5) =>
  PixelRatio.roundToNearestPixel(size + (size * widthRatio - size) * factor);

/** True for tablet-class devices — handy for max-width / column tweaks. */
export const isTablet = shortDimension >= 600;

export const screen = { width, height, shortDimension, longDimension };
