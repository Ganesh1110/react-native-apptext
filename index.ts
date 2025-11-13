// Main Component
import AppText from "./src/AppText";
export default AppText;

// Named exports for tree-shaking and explicit imports
export { AppTextProvider, useAppTextTheme } from "./src/context";

// Hooks
export { useResponsiveFont, useThemedStyles } from "./src/hooks";

// Theme
export { DEFAULT_THEME } from "./src/theme";

// Scripts
export { SCRIPT_CONFIGS } from "./src/scriptConfigs";

// Lang functionality
export {
  LocaleProvider,
  useLang,
  TranslationManager,
  interpolate,
  getPluralForm,
  PLURAL_RULES,
  Translations,
  PluralTranslation,
  TranslationValue,
} from "./src/LangCore";

// Type exports for TypeScript users
export type {
  AppTextProps,
  AppTextTheme,
  TypographyVariant,
  SpacingProps,
  LocaleContextValue,
  LocaleProviderProps,
  PluralForm,
} from "./src/types";
