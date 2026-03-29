"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationErrorBoundary = exports.translationCache = exports.memoize = exports.throttle = exports.debounce = exports.TranslationBatcher = exports.TranslationCache = exports.LRUCache = exports.useMarkdownTranslation = exports.MarkdownTrans = exports.OrdinalFormatter = exports.formatNumberICU = exports.NumberFormatter = exports.NamespaceLoader = exports.withLazyTranslations = exports.useLazyLocale = exports.LazyLocaleProvider = exports.PLURAL_RULES = exports.getPluralForm = exports.interpolate = exports.TranslationManager = exports.useLang = exports.LocaleProvider = exports.SCRIPT_CONFIGS = exports.DEFAULT_THEME = exports.useDynamicTypeScale = exports.useReducedMotion = exports.useThemedStyles = exports.useResponsiveFont = exports.useAppTextTheme = exports.AppTextProvider = exports.Trans = void 0;
// Main Component
const AppText_1 = __importDefault(require("./src/AppText"));
exports.default = AppText_1.default;
// Trans Component
var AppText_2 = require("./src/AppText");
Object.defineProperty(exports, "Trans", { enumerable: true, get: function () { return AppText_2.Trans; } });
// Named exports for tree-shaking and explicit imports
var context_1 = require("./src/context");
Object.defineProperty(exports, "AppTextProvider", { enumerable: true, get: function () { return context_1.AppTextProvider; } });
Object.defineProperty(exports, "useAppTextTheme", { enumerable: true, get: function () { return context_1.useAppTextTheme; } });
// Hooks
var hooks_1 = require("./src/hooks");
Object.defineProperty(exports, "useResponsiveFont", { enumerable: true, get: function () { return hooks_1.useResponsiveFont; } });
Object.defineProperty(exports, "useThemedStyles", { enumerable: true, get: function () { return hooks_1.useThemedStyles; } });
Object.defineProperty(exports, "useReducedMotion", { enumerable: true, get: function () { return hooks_1.useReducedMotion; } });
Object.defineProperty(exports, "useDynamicTypeScale", { enumerable: true, get: function () { return hooks_1.useDynamicTypeScale; } });
// Theme
var theme_1 = require("./src/theme");
Object.defineProperty(exports, "DEFAULT_THEME", { enumerable: true, get: function () { return theme_1.DEFAULT_THEME; } });
// Scripts
var scriptConfigs_1 = require("./src/scriptConfigs");
Object.defineProperty(exports, "SCRIPT_CONFIGS", { enumerable: true, get: function () { return scriptConfigs_1.SCRIPT_CONFIGS; } });
// Lang functionality
var LangCore_1 = require("./src/LangCore");
Object.defineProperty(exports, "LocaleProvider", { enumerable: true, get: function () { return LangCore_1.LocaleProvider; } });
Object.defineProperty(exports, "useLang", { enumerable: true, get: function () { return LangCore_1.useLang; } });
Object.defineProperty(exports, "TranslationManager", { enumerable: true, get: function () { return LangCore_1.TranslationManager; } });
Object.defineProperty(exports, "interpolate", { enumerable: true, get: function () { return LangCore_1.interpolate; } });
Object.defineProperty(exports, "getPluralForm", { enumerable: true, get: function () { return LangCore_1.getPluralForm; } });
Object.defineProperty(exports, "PLURAL_RULES", { enumerable: true, get: function () { return LangCore_1.PLURAL_RULES; } });
// Lazy Loading & Code Splitting
var LazyTranslations_1 = require("./src/LazyTranslations");
Object.defineProperty(exports, "LazyLocaleProvider", { enumerable: true, get: function () { return LazyTranslations_1.LazyLocaleProvider; } });
Object.defineProperty(exports, "useLazyLocale", { enumerable: true, get: function () { return LazyTranslations_1.useLazyLocale; } });
Object.defineProperty(exports, "withLazyTranslations", { enumerable: true, get: function () { return LazyTranslations_1.withLazyTranslations; } });
Object.defineProperty(exports, "NamespaceLoader", { enumerable: true, get: function () { return LazyTranslations_1.NamespaceLoader; } });
// Enhanced Number Formatting
var NumberFormatter_1 = require("./src/NumberFormatter");
Object.defineProperty(exports, "NumberFormatter", { enumerable: true, get: function () { return NumberFormatter_1.NumberFormatter; } });
Object.defineProperty(exports, "formatNumberICU", { enumerable: true, get: function () { return NumberFormatter_1.formatNumberICU; } });
Object.defineProperty(exports, "OrdinalFormatter", { enumerable: true, get: function () { return NumberFormatter_1.OrdinalFormatter; } });
// Markdown Support
var MarkdownTrans_1 = require("./src/MarkdownTrans");
Object.defineProperty(exports, "MarkdownTrans", { enumerable: true, get: function () { return __importDefault(MarkdownTrans_1).default; } });
Object.defineProperty(exports, "useMarkdownTranslation", { enumerable: true, get: function () { return MarkdownTrans_1.useMarkdownTranslation; } });
// Performance Optimizations
var PerformanceOptimizations_1 = require("./src/PerformanceOptimizations");
Object.defineProperty(exports, "LRUCache", { enumerable: true, get: function () { return PerformanceOptimizations_1.LRUCache; } });
Object.defineProperty(exports, "TranslationCache", { enumerable: true, get: function () { return PerformanceOptimizations_1.TranslationCache; } });
Object.defineProperty(exports, "TranslationBatcher", { enumerable: true, get: function () { return PerformanceOptimizations_1.TranslationBatcher; } });
Object.defineProperty(exports, "debounce", { enumerable: true, get: function () { return PerformanceOptimizations_1.debounce; } });
Object.defineProperty(exports, "throttle", { enumerable: true, get: function () { return PerformanceOptimizations_1.throttle; } });
Object.defineProperty(exports, "memoize", { enumerable: true, get: function () { return PerformanceOptimizations_1.memoize; } });
Object.defineProperty(exports, "translationCache", { enumerable: true, get: function () { return PerformanceOptimizations_1.translationCache; } });
// Error Boundary
var ErrorBoundary_1 = require("./src/ErrorBoundary");
Object.defineProperty(exports, "TranslationErrorBoundary", { enumerable: true, get: function () { return ErrorBoundary_1.TranslationErrorBoundary; } });
