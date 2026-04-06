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
// ---------------------------------------------------------------------------
// Platform locale readers
// ---------------------------------------------------------------------------
function readiOSLocale() {
    var _a, _b, _c;
    try {
        const settings = (_a = NativeModules === null || NativeModules === void 0 ? void 0 : NativeModules.SettingsManager) === null || _a === void 0 ? void 0 : _a.settings;
        if (!settings)
            return null;
        const locale = settings.AppleLocale || ((_c = (_b = settings.AppleLanguages) === null || _b === void 0 ? void 0 : _b[0]) !== null && _c !== void 0 ? _c : "");
        return locale.replace("_", "-") || null;
    }
    catch (_d) {
        return null;
    }
}
function readAndroidLocale() {
    var _a, _b;
    try {
        const identifier = (_b = (_a = NativeModules === null || NativeModules === void 0 ? void 0 : NativeModules.I18nManager) === null || _a === void 0 ? void 0 : _a.localeIdentifier) !== null && _b !== void 0 ? _b : "";
        return identifier.replace("_", "-") || null;
    }
    catch (_c) {
        return null;
    }
}
function readDeviceLocale() {
    if (Platform.OS === "ios")
        return readiOSLocale();
    if (Platform.OS === "android")
        return readAndroidLocale();
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
function bestMatch(deviceLocale, supported) {
    const normalized = deviceLocale.toLowerCase();
    const langPrefix = normalized.split("-")[0];
    for (const s of supported) {
        if (s.toLowerCase() === normalized)
            return s;
    }
    for (const s of supported) {
        if (s.toLowerCase() === langPrefix)
            return s;
        if (s.toLowerCase().startsWith(langPrefix + "-"))
            return s;
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
export function useAutoLocale(options = {}) {
    const { supportedLocales, fallback = "en" } = options;
    return useMemo(() => {
        var _a;
        const deviceLocale = readDeviceLocale();
        if (!deviceLocale)
            return fallback;
        if (supportedLocales && supportedLocales.length > 0) {
            return (_a = bestMatch(deviceLocale, supportedLocales)) !== null && _a !== void 0 ? _a : fallback;
        }
        return deviceLocale;
    }, []); // intentionally empty — value is computed once at mount
}
/**
 * Returns the raw device locale string (no filtering / matching).
 * Equivalent to the internal `useDeviceLocale` hook, now part of public API.
 */
export function useDeviceLocale() {
    return useMemo(() => {
        var _a;
        return (_a = readDeviceLocale()) !== null && _a !== void 0 ? _a : "en";
    }, []);
}
