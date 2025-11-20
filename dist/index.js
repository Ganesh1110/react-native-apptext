// Main Component
import AppText from "./src/AppText";
export default AppText;
// Trans Component
export { default as Trans } from "./src/Trans";
// Named exports for tree-shaking and explicit imports
export { AppTextProvider, useAppTextTheme } from "./src/context";
// Hooks
export { useResponsiveFont, useThemedStyles } from "./src/hooks";
// Theme
export { DEFAULT_THEME } from "./src/theme";
// Scripts
export { SCRIPT_CONFIGS } from "./src/scriptConfigs";
// Lang functionality
export { LocaleProvider, useLang, TranslationManager, interpolate, getPluralForm, PLURAL_RULES, } from "./src/LangCore";
