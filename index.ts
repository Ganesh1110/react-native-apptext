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

// Lang functionality
export {
  LocaleProvider,
  useLang,
  TranslationManager,
  interpolate,
  getPluralForm,
  PLURAL_RULES,
} from "./LangCore";

// Type exports for TypeScript users
export type {
  AppTextProps,
  AppTextTheme,
  TypographyVariant,
  SpacingProps,
  LocaleContextValue,
  LocaleProviderProps,
  Translations,
  PluralForm,
} from "./types";
