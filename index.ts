// Main Component
import AppText from "./AppText";
export default AppText;

// Named exports for tree-shaking and explicit imports
export { AppTextProvider, useAppTextTheme } from "./context";

// Hooks
export { useResponsiveFont, useThemedStyles } from "./hooks";

// Theme
export { DEFAULT_THEME } from "./theme";

// Scripts
export { SCRIPT_CONFIGS } from "./scriptConfigs";

// Type exports for TypeScript users
export type {
  AppTextProps,
  AppTextTheme,
  TypographyVariant,
  SpacingProps,
} from "./types";
