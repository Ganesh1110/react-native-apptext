/**
 * Centralized configuration constants for react-native-apptext.
 * All magic numbers should be sourced from here.
 */

/** Base device width used for responsive font scaling (iPhone 8/SE width) */
export const BASE_WIDTH = 375;

/** Default animation duration in milliseconds */
export const DEFAULT_ANIMATION_DURATION = 1000;

/** Default typewriter speed in milliseconds per character */
export const DEFAULT_TYPEWRITER_SPEED = 50;

/** Maximum entries in the translation LRU cache */
export const CACHE_MAX_SIZE = 1000;

/** Maximum entries in the NumberFormatter formatter cache */
export const NUMBER_FORMATTER_CACHE_MAX = 100;

/** Delay in milliseconds before the batch processor flushes */
export const BATCH_DELAY_MS = 10;

/** Maximum number of items in a single batch */
export const BATCH_SIZE = 50;

/** Debounce delay for language change events in milliseconds */
export const LANGUAGE_CHANGE_DEBOUNCE_MS = 150;

/** Minimum responsive font size in points */
export const RESPONSIVE_FONT_MIN = 10;

/** Maximum responsive font size in points */
export const RESPONSIVE_FONT_MAX = 48;
