// Main Component
import AppText from "./AppText";
export default AppText;

// Named exports for tree-shaking and explicit imports
export { AppTextProvider, useAppTextTheme } from "./context";
export { useResponsiveFont, useThemedStyles } from "./hooks";
export { DEFAULT_THEME } from "./theme";

// Type exports for TypeScript users
export type {
  AppTextProps,
  AppTextTheme, 
  TypographyVariant,
  SpacingProps,
} from "./types";