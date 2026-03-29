"use strict";
/**
 * Centralized configuration constants for react-native-apptext.
 * All magic numbers should be sourced from here.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESPONSIVE_FONT_MAX = exports.RESPONSIVE_FONT_MIN = exports.LANGUAGE_CHANGE_DEBOUNCE_MS = exports.BATCH_SIZE = exports.BATCH_DELAY_MS = exports.NUMBER_FORMATTER_CACHE_MAX = exports.CACHE_MAX_SIZE = exports.DEFAULT_TYPEWRITER_SPEED = exports.DEFAULT_ANIMATION_DURATION = exports.BASE_WIDTH = void 0;
/** Base device width used for responsive font scaling (iPhone 8/SE width) */
exports.BASE_WIDTH = 375;
/** Default animation duration in milliseconds */
exports.DEFAULT_ANIMATION_DURATION = 1000;
/** Default typewriter speed in milliseconds per character */
exports.DEFAULT_TYPEWRITER_SPEED = 50;
/** Maximum entries in the translation LRU cache */
exports.CACHE_MAX_SIZE = 1000;
/** Maximum entries in the NumberFormatter formatter cache */
exports.NUMBER_FORMATTER_CACHE_MAX = 100;
/** Delay in milliseconds before the batch processor flushes */
exports.BATCH_DELAY_MS = 10;
/** Maximum number of items in a single batch */
exports.BATCH_SIZE = 50;
/** Debounce delay for language change events in milliseconds */
exports.LANGUAGE_CHANGE_DEBOUNCE_MS = 150;
/** Minimum responsive font size in points */
exports.RESPONSIVE_FONT_MIN = 10;
/** Maximum responsive font size in points */
exports.RESPONSIVE_FONT_MAX = 48;
