import { useEffect, useMemo, useState } from "react";
import { Dimensions, PixelRatio, NativeModules, Platform, } from "react-native";
import { SCRIPT_CONFIGS } from "./scriptConfigs";
import { BASE_WIDTH, RESPONSIVE_FONT_MIN, RESPONSIVE_FONT_MAX, } from "./constants";
let _currentDimensions = Dimensions.get("window");
const _listeners = new Set();
let _subscription = null;
function subscribeToWindowDimensions(listener) {
    if (_listeners.size === 0) {
        _subscription = Dimensions.addEventListener("change", ({ window }) => {
            _currentDimensions = window;
            _listeners.forEach((fn) => fn(window));
        });
    }
    _listeners.add(listener);
    return () => {
        _listeners.delete(listener);
        if (_listeners.size === 0 && _subscription) {
            _subscription.remove();
            _subscription = null;
        }
    };
}
// ============================================================================
// Hook for responsive font scaling
// ============================================================================
export const useResponsiveFont = (baseSize, bounds) => {
    const [dimensions, setDimensions] = useState(() => _currentDimensions);
    useEffect(() => {
        // Subscribe to the shared singleton listener with a threshold filter
        const unsubscribe = subscribeToWindowDimensions((newDims) => {
            setDimensions((prev) => {
                // Only trigger re-render if width changes by more than 2 pixels
                // This prevents excessive updates during smooth window resizing
                if (Math.abs(prev.width - newDims.width) > 2) {
                    return newDims;
                }
                return prev;
            });
        });
        return unsubscribe;
    }, []);
    return useMemo(() => {
        var _a, _b;
        const { width } = dimensions;
        const scale = (width / BASE_WIDTH) * PixelRatio.getFontScale();
        let scaledSize = Math.round(baseSize * scale * 100) / 100;
        const min = (_a = bounds === null || bounds === void 0 ? void 0 : bounds.min) !== null && _a !== void 0 ? _a : RESPONSIVE_FONT_MIN;
        const max = (_b = bounds === null || bounds === void 0 ? void 0 : bounds.max) !== null && _b !== void 0 ? _b : RESPONSIVE_FONT_MAX;
        scaledSize = Math.max(scaledSize, min);
        scaledSize = Math.min(scaledSize, max);
        return scaledSize;
    }, [baseSize, dimensions, bounds === null || bounds === void 0 ? void 0 : bounds.min, bounds === null || bounds === void 0 ? void 0 : bounds.max]);
};
// ============================================================================
// Hook for script detection
// ============================================================================
// Sorted script config entries (by Unicode range span, largest first) are
// computed once at module load time so the hot-path loop exits as early as
// possible for the most common scripts.
const SORTED_SCRIPT_ENTRIES = Object.entries(SCRIPT_CONFIGS).sort(([, a], [, b]) => {
    // Sum the span of all Unicode ranges for each script
    const span = (ranges) => ranges.reduce((s, [lo, hi]) => s + (hi - lo + 1), 0);
    return span(b.unicodeRanges) - span(a.unicodeRanges);
});
export const useScriptDetection = (text) => {
    return useMemo(() => {
        if (!text || text.length === 0)
            return "Unknown";
        const codePoint = text.codePointAt(0);
        if (!codePoint)
            return "Unknown";
        // Iterate sorted entries — exits on first match (early-exit optimisation)
        for (const [scriptCode, config] of SORTED_SCRIPT_ENTRIES) {
            if (config.unicodeRanges.some(([start, end]) => codePoint >= start && codePoint <= end)) {
                return scriptCode;
            }
        }
        return "Unknown";
    }, [text]);
};
// ============================================================================
// Hook for theme-aware styles
// ============================================================================
export const useThemedStyles = (theme, colorScheme) => {
    return useMemo(() => {
        const isDark = colorScheme === "dark";
        return {
            defaultTextColor: isDark ? "#FFFFFF" : theme.colors.text,
            secondaryTextColor: isDark ? "#CCCCCC" : theme.colors.textSecondary,
            backgroundColor: isDark ? "#000000" : theme.colors.background,
        };
    }, [theme, colorScheme]);
};
// ============================================================================
// Hook for device locale auto-detection
// ============================================================================
export const useDeviceLocale = () => {
    return useMemo(() => {
        try {
            const locale = Platform.OS === "ios"
                ? NativeModules.SettingsManager.settings.AppleLocale ||
                    NativeModules.SettingsManager.settings.AppleLanguages[0]
                : NativeModules.I18nManager.localeIdentifier;
            return locale ? locale.replace("_", "-") : "en";
        }
        catch (e) {
            return "en";
        }
    }, []);
};
