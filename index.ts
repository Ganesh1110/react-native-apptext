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

// ============================================================================
// NEW: Lazy Loading & Code Splitting
// ============================================================================
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

// ============================================================================
// NEW: Enhanced Number Formatting
// ============================================================================
export {
  NumberFormatter,
  formatNumberICU,
  OrdinalFormatter,
} from "./src/NumberFormatter";

export type { NumberFormatterOptions } from "./src/NumberFormatter";

// ============================================================================
// NEW: Markdown Support
// ============================================================================
export {
  default as MarkdownTrans,
  useMarkdownTranslation,
} from "./src/MarkdownTrans";

export type { MarkdownTransProps, ParsedNode } from "./src/MarkdownTrans";

// ============================================================================
// NEW: Performance Optimizations
// ============================================================================
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

// ============================================================================
// CLI Tool (for package.json bin)
// ============================================================================
// The CLI tool is available at: bin/extract-translations.js

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

/**
 * Usage Examples:
 *
 * 1. Basic Usage:
 * ```tsx
 * import AppText, { LocaleProvider } from 'react-native-apptext';
 *
 * <LocaleProvider translations={translations} defaultLanguage="en">
 *   <AppText>{t("welcome")}</AppText>
 * </LocaleProvider>
 * ```
 *
 * 2. Lazy Loading:
 * ```tsx
 * import { LazyLocaleProvider } from 'react-native-apptext';
 *
 * <LazyLocaleProvider
 *   loaders={{
 *     en: () => import('./locales/en.json'),
 *     es: () => import('./locales/es.json'),
 *   }}
 *   defaultLanguage="en"
 *   preloadLanguages={['es']}
 * >
 *   <App />
 * </LazyLocaleProvider>
 * ```
 *
 * 3. Markdown Support:
 * ```tsx
 * import { MarkdownTrans } from 'react-native-apptext';
 *
 * <MarkdownTrans
 *   i18nKey="welcome"
 *   onLinkPress={(url) => Linking.openURL(url)}
 * />
 *
 * // Translation: "Hello **{{name}}**! Visit [our site](https://example.com)"
 * ```
 *
 * 4. Enhanced Number Formatting:
 * ```tsx
 * import { NumberFormatter } from 'react-native-apptext';
 *
 * NumberFormatter.formatCurrency(1299.99, 'en-US', 'USD');
 * // Output: "$1,299.99"
 *
 * NumberFormatter.formatCompact(1500000, 'en-US');
 * // Output: "1.5M"
 * ```
 *
 * 5. Performance Optimization:
 * ```tsx
 * import { translationCache, performanceMonitor } from 'react-native-apptext';
 *
 * // Check cache stats
 * console.log(translationCache.getStats());
 *
 * // Monitor performance
 * performanceMonitor.measure('translation', () => {
 *   t('some.key');
 * });
 * ```
 *
 * 6. CLI Extraction:
 * ```bash
 * npx extract-translations --src ./src --output ./locales/en.json --sort
 * ```
 */
