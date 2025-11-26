// Main Component
import AppText from "./src/AppText";
export default AppText;

// Trans Component
export { Trans } from "./src/AppText";

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

// Lazy Loading & Code Splitting
export {
  LazyLocaleProvider,
  useLazyLocale,
  withLazyTranslations,
  NamespaceLoader,
} from "./src/LazyTranslations";

export type {
  LazyTranslationConfig,
  LazyLocaleContextValue,
} from "./src/LazyTranslations";

// Enhanced Number Formatting
export {
  NumberFormatter,
  formatNumberICU,
  OrdinalFormatter,
} from "./src/NumberFormatter";

export type { NumberFormatterOptions } from "./src/NumberFormatter";

// Markdown Support
export {
  default as MarkdownTrans,
  useMarkdownTranslation,
} from "./src/MarkdownTrans";

export type { MarkdownTransProps, ParsedNode } from "./src/MarkdownTrans";

// Performance Optimizations
export {
  LRUCache,
  TranslationCache,
  TranslationBatcher,
  VirtualListHelper,
  PerformanceMonitor,
  MemoryManager,
  debounce,
  throttle,
  memoize,
  translationCache,
  performanceMonitor,
} from "./src/PerformanceOptimizations";

// Type exports for TypeScript users
export type {
  AppTextProps,
  AppTextTheme,
  TypographyVariant,
  SpacingProps,
  LocaleContextValue,
  LocaleProviderProps,
  PluralForm,
  TransProps,
  TranslationOptions,
  DeepKeyOf,
  TypedLocaleContextValue,
} from "./src/types";
