// ============================================================================
// react-native-text-kit — Public API
// Version 4.5.2
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
  useUpdateAppTheme,
  useAppTextAnalytics,       // NEW v4.5.0: read analytics callbacks
} from "./src/context";

export type {
  AppTextContextValue,
  AppTextProviderProps,
  AppTextAnalyticsCallbacks,
} from "./src/context";

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
export {
  useResponsiveFont,
  useThemedStyles,
  // Dynamic Type — iOS/Android font scale semantic mapping
  useDynamicTypeCategory,  // NEW: xSmall → accessibilityXXXLarge
  useDynamicTypeFontSize,  // NEW: clamp(base * fontScale, min, max)
  // Text-to-speech (no external package required)
  useSpeech,               // NEW: hook returning { speak(text) }
  speak,                   // NEW: standalone utility
} from "./src/hooks";

export type { DynamicTypeCategory } from "./src/hooks";

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
  useRTL,                    // NEW: { isRTL, setRTL, restartRequired, mode }
  useRTLFlexDirection,       // NEW: convenience helper
  useRTLStyle,               // NEW: full layout style map (row, textAlign, paddingStart…)
  RTLView,                   // NEW: drop-in RTL-aware View (works in 'css' mode)
  isRTLLanguage,             // NEW: pure function — isRTLLanguage('ar') → true
  RTL_LANGUAGE_CODES,        // NEW: Set of RTL BCP-47 prefixes
} from "./src/RTLProvider";

export type { RTLContextValue, RTLProviderProps, RTLViewProps } from "./src/RTLProvider";

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

// ---------------------------------------------------------------------------
// Text Selection Context Menu
// ---------------------------------------------------------------------------
export { AppTextContextMenu } from "./src/AppTextContextMenu";

export type {
  AppTextContextMenuProps,
  ContextMenuAction,
} from "./src/AppTextContextMenu";

// ---------------------------------------------------------------------------
// Plugin System (v4.5.0)
// ---------------------------------------------------------------------------
export {
  pluginRegistry,
  registerAppTextPlugin,
  unregisterAppTextPlugin,
  getRegisteredPlugins,
} from "./src/PluginRegistry";

export type {
  AppTextPlugin,
  PluginRegisterOptions,
  PluginTransformContext,
  PluginAnimationDefinition,
} from "./src/PluginRegistry";

// ---------------------------------------------------------------------------
// Remote Translation Sync (v4.5.0)
// ---------------------------------------------------------------------------
export {
  RemoteLocaleProvider,
  useRemoteLocales,
  clearRemoteLocaleCache,
  clearAllRemoteLocaleCaches,
} from "./src/RemoteLocaleProvider";

export type {
  RemoteLocaleProviderProps,
  RemoteLocaleContextValue,
  RemoteCacheStrategy,
  RemoteStorageAdapter,
  RemoteLocaleStatus,
} from "./src/RemoteLocaleProvider";

// ---------------------------------------------------------------------------
// Text Metrics API (v4.5.0)
// ---------------------------------------------------------------------------
export { useTextMetrics } from "./src/useTextMetrics";

export type {
  TextMetricsOptions,
  TextMetrics,
} from "./src/useTextMetrics";
