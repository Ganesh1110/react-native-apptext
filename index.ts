// ============================================================================
// react-native-apptext — Public API
// Version 4.4.0
// ============================================================================

// ---------------------------------------------------------------------------
// Main Component (default export)
// ---------------------------------------------------------------------------
import AppText from "./src/AppText";
export default AppText;

// ---------------------------------------------------------------------------
// Trans Component (rich JSX interpolation)
// ---------------------------------------------------------------------------
export { Trans } from "./src/AppText";

// ---------------------------------------------------------------------------
// Theme Provider + Runtime Theme Update
// ---------------------------------------------------------------------------
export {
  AppTextProvider,
  useAppTextTheme,
  useUpdateAppTheme,        // NEW: hot-patch theme tokens at runtime
} from "./src/context";

export type { AppTextContextValue } from "./src/context";

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
export {
  useResponsiveFont,
  useThemedStyles,
} from "./src/hooks";

// NEW: System locale detection hooks (previously internal-only)
export {
  useAutoLocale,    // Reads + filters against supportedLocales
  useDeviceLocale,  // Raw device locale string (public API)
} from "./src/useAutoLocale";

export type { UseAutoLocaleOptions } from "./src/useAutoLocale";

// ---------------------------------------------------------------------------
// Theme Tokens
// ---------------------------------------------------------------------------
export { DEFAULT_THEME } from "./src/theme";

// ---------------------------------------------------------------------------
// Script Configuration Database (50+ scripts)
// ---------------------------------------------------------------------------
export { SCRIPT_CONFIGS } from "./src/scriptConfigs";

// ---------------------------------------------------------------------------
// Internationalization (i18n)
// ---------------------------------------------------------------------------
export {
  LocaleProvider,
  useLang,
  useNamespace,           // NEW: hook equivalent to loadNamespace in a useEffect
  TranslationManager,
  interpolate,
  getPluralForm,
  PLURAL_RULES,
  Translations,
  PluralTranslation,
  TranslationValue,
} from "./src/LangCore";

// ---------------------------------------------------------------------------
// Lazy Loading & Code Splitting
// ---------------------------------------------------------------------------
export {
  LazyLocaleProvider,
  useLazyLocale,
  withLazyTranslations,   // FIXED: now accepts loadingFallback option
  useTranslationReady,    // NEW: { ready, progress } for loading UI
  NamespaceLoader,
} from "./src/LazyTranslations";

export type {
  LazyTranslationConfig,
  LazyLocaleContextValue,
} from "./src/LazyTranslations";

// ---------------------------------------------------------------------------
// Markdown-like Rich Text
// ---------------------------------------------------------------------------
export {
  default as MarkdownTrans,
  useMarkdownTranslation,
} from "./src/MarkdownTrans";

export type {
  MarkdownTransProps,
  MarkdownToken,
  ParsedNode, // backward-compat alias for MarkdownToken
} from "./src/MarkdownTrans";

// ---------------------------------------------------------------------------
// Number & Ordinal Formatting
// ---------------------------------------------------------------------------
export {
  NumberFormatter,
  formatNumberICU,
  OrdinalFormatter,
} from "./src/NumberFormatter";

export type { NumberFormatterOptions } from "./src/NumberFormatter";

// ---------------------------------------------------------------------------
// Performance Primitives
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Developer Tools (no-op in production)
// ---------------------------------------------------------------------------
export {
  AppTextDevTools,           // NEW: floating overlay with cache/perf stats
} from "./src/AppTextDevTools";

export type { AppTextDevToolsProps, DevToolsPosition } from "./src/AppTextDevTools";

// ---------------------------------------------------------------------------
// Loading Placeholder
// ---------------------------------------------------------------------------
export {
  AppTextSkeleton,           // NEW: shimmer skeleton matching variant line-height
} from "./src/AppTextSkeleton";

export type { AppTextSkeletonProps } from "./src/AppTextSkeleton";

// ---------------------------------------------------------------------------
// RTL / Layout Mirroring
// ---------------------------------------------------------------------------
export {
  RTLProvider,               // NEW: calls I18nManager.forceRTL, exposes isRTL
  useRTL,                    // NEW: { isRTL, setRTL, restartRequired }
  useRTLFlexDirection,       // NEW: convenience helper
  isRTLLanguage,             // NEW: pure function — isRTLLanguage('ar') → true
  RTL_LANGUAGE_CODES,        // NEW: Set of RTL BCP-47 prefixes
} from "./src/RTLProvider";

export type { RTLContextValue, RTLProviderProps } from "./src/RTLProvider";

// ---------------------------------------------------------------------------
// TypeScript Type Surface
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Error Boundary
// ---------------------------------------------------------------------------
export { TranslationErrorBoundary } from "./src/ErrorBoundary";
