import { Dimensions, PixelRatio } from "react-native";

const GUIDELINE_BASE_WIDTH = 375;
const GUIDELINE_BASE_HEIGHT = 812;

const { width, height } = Dimensions.get("window");

const shortDimension = Math.min(width, height);
const longDimension = Math.max(width, height);

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const widthRatio = clamp(shortDimension / GUIDELINE_BASE_WIDTH, 0.85, 1.3);
const heightRatio = clamp(longDimension / GUIDELINE_BASE_HEIGHT, 0.85, 1.4);

export const scale = (size: number) =>
  PixelRatio.roundToNearestPixel(size * widthRatio);

export const verticalScale = (size: number) =>
  PixelRatio.roundToNearestPixel(size * heightRatio);

export const moderateScale = (size: number, factor = 0.5) =>
  PixelRatio.roundToNearestPixel(size + (size * widthRatio - size) * factor);

export const isTablet = shortDimension >= 600;

export const screen = { width, height, shortDimension, longDimension };
