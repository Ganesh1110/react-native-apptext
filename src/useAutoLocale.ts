/**
 * useAutoLocale — System-locale auto-detection hook
 *
 * Reads the device's primary locale from platform native modules and returns
 * a normalized BCP-47 string (e.g. "en", "ar-SA", "fr-FR").
 *
 * Unlike the internal `useDeviceLocale` in hooks.ts, this version:
 *  - Is part of the public API
 *  - Handles RN New Architecture (no NativeModules on some preloads)
 *  - Supports an `options.preferredLocales` fallback list
 *  - Returns a stable reference (memoised, never re-evaluates after mount)
 *
 * Usage:
 *   import { useAutoLocale } from 'react-native-apptext';
 *
 *   const locale = useAutoLocale();
 *   // locale → "en-US"
 *
 *   // With fallback list (picks first that the OS reports or falls back to 'en')
 *   const locale = useAutoLocale({ supportedLocales: ['en', 'ar', 'fr'] });
 */

import { useMemo } from "react";
import { NativeModules, Platform } from "react-native";

export interface UseAutoLocaleOptions {
  /**
   * Whitelist of BCP-47 language codes your app supports.
   * When provided, the hook returns the first supported locale that matches
   * the device's preference list (language prefix match, e.g. "en" matches "en-GB").
   * Falls back to `fallback` if nothing matches.
   */
  supportedLocales?: string[];

  /**
   * Default locale to return when device locale cannot be read.
   * Defaults to "en".
   */
  fallback?: string;
}

// ---------------------------------------------------------------------------
// Platform locale readers
// ---------------------------------------------------------------------------

function readiOSLocale(): string | null {
  try {
    const settings = NativeModules?.SettingsManager?.settings;
    if (!settings) return null;
    const locale: string =
      settings.AppleLocale || (settings.AppleLanguages?.[0] ?? "");
    return locale.replace("_", "-") || null;
  } catch {
    return null;
  }
}

function readAndroidLocale(): string | null {
  try {
    const identifier: string =
      NativeModules?.I18nManager?.localeIdentifier ?? "";
    return identifier.replace("_", "-") || null;
  } catch {
    return null;
  }
}

function readDeviceLocale(): string | null {
  if (Platform.OS === "ios") return readiOSLocale();
  if (Platform.OS === "android") return readAndroidLocale();
  return null;
}

// ---------------------------------------------------------------------------
// Matching helper
// ---------------------------------------------------------------------------

/**
 * Given a device locale (e.g. "en-GB") and a list of supported locales
 * (e.g. ["en", "ar", "fr"]), return the best match:
 *  1. Exact match (case-insensitive)
 *  2. Language prefix match ("en" matches "en-GB")
 *  3. null if no match
 */
function bestMatch(
  deviceLocale: string,
  supported: string[],
): string | null {
  const normalized = deviceLocale.toLowerCase();
  const langPrefix = normalized.split("-")[0];

  for (const s of supported) {
    if (s.toLowerCase() === normalized) return s;
  }
  for (const s of supported) {
    if (s.toLowerCase() === langPrefix) return s;
    if (s.toLowerCase().startsWith(langPrefix + "-")) return s;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Returns the detected device locale as a BCP-47 string.
 * The value is stable after mount (memoised, does not subscribe to changes).
 *
 * To react to runtime locale changes (e.g. user changes system language while
 * app is running), integrate `react-native-localize` separately.
 */
export function useAutoLocale(options: UseAutoLocaleOptions = {}): string {
  const { supportedLocales, fallback = "en" } = options;

  return useMemo(() => {
    const deviceLocale = readDeviceLocale();

    if (!deviceLocale) return fallback;

    if (supportedLocales && supportedLocales.length > 0) {
      return bestMatch(deviceLocale, supportedLocales) ?? fallback;
    }

    return deviceLocale;
  }, []); // intentionally empty — value is computed once at mount
}

/**
 * Returns the raw device locale string (no filtering / matching).
 * Equivalent to the internal `useDeviceLocale` hook, now part of public API.
 */
export function useDeviceLocale(): string {
  return useMemo(() => {
    return readDeviceLocale() ?? "en";
  }, []);
}
