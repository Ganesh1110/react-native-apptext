"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDynamicTypeScale = exports.useReducedMotion = exports.useDeviceLocale = exports.useThemedStyles = exports.useScriptDetection = exports.useResponsiveFont = void 0;
const react_1 = require("react");
const react_native_1 = require("react-native");
const scriptConfigs_1 = require("./scriptConfigs");
const constants_1 = require("./constants");
let _currentDimensions = react_native_1.Dimensions.get("window");
const _listeners = new Set();
let _subscription = null;
function subscribeToWindowDimensions(listener) {
    if (_listeners.size === 0) {
        _subscription = react_native_1.Dimensions.addEventListener("change", ({ window }) => {
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
const useResponsiveFont = (baseSize, bounds) => {
    const [dimensions, setDimensions] = (0, react_1.useState)(() => _currentDimensions);
    (0, react_1.useEffect)(() => {
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
    return (0, react_1.useMemo)(() => {
        var _a, _b;
        const { width } = dimensions;
        const scale = (width / constants_1.BASE_WIDTH) * react_native_1.PixelRatio.getFontScale();
        let scaledSize = Math.round(baseSize * scale * 100) / 100;
        const min = (_a = bounds === null || bounds === void 0 ? void 0 : bounds.min) !== null && _a !== void 0 ? _a : constants_1.RESPONSIVE_FONT_MIN;
        const max = (_b = bounds === null || bounds === void 0 ? void 0 : bounds.max) !== null && _b !== void 0 ? _b : constants_1.RESPONSIVE_FONT_MAX;
        scaledSize = Math.max(scaledSize, min);
        scaledSize = Math.min(scaledSize, max);
        return scaledSize;
    }, [baseSize, dimensions, bounds === null || bounds === void 0 ? void 0 : bounds.min, bounds === null || bounds === void 0 ? void 0 : bounds.max]);
};
exports.useResponsiveFont = useResponsiveFont;
// ============================================================================
// Hook for script detection
// ============================================================================
// Sorted script config entries (by Unicode range span, largest first) are
// computed once at module load time so the hot-path loop exits as early as
// possible for the most common scripts.
const SORTED_SCRIPT_ENTRIES = Object.entries(scriptConfigs_1.SCRIPT_CONFIGS).sort(([, a], [, b]) => {
    // Sum the span of all Unicode ranges for each script
    const span = (ranges) => ranges.reduce((s, [lo, hi]) => s + (hi - lo + 1), 0);
    return span(b.unicodeRanges) - span(a.unicodeRanges);
});
const useScriptDetection = (text) => {
    return (0, react_1.useMemo)(() => {
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
exports.useScriptDetection = useScriptDetection;
// ============================================================================
// Hook for theme-aware styles
// ============================================================================
const useThemedStyles = (theme, colorScheme) => {
    return (0, react_1.useMemo)(() => {
        const isDark = colorScheme === "dark";
        return {
            defaultTextColor: isDark ? "#FFFFFF" : theme.colors.text,
            secondaryTextColor: isDark ? "#CCCCCC" : theme.colors.textSecondary,
            backgroundColor: isDark ? "#000000" : theme.colors.background,
        };
    }, [theme, colorScheme]);
};
exports.useThemedStyles = useThemedStyles;
// ============================================================================
// Hook for device locale auto-detection
// ============================================================================
const useDeviceLocale = () => {
    return (0, react_1.useMemo)(() => {
        var _a, _b, _c, _d, _e, _f;
        try {
            const locale = react_native_1.Platform.OS === "ios"
                ? ((_b = (_a = react_native_1.NativeModules.SettingsManager) === null || _a === void 0 ? void 0 : _a.settings) === null || _b === void 0 ? void 0 : _b.AppleLocale) ||
                    ((_e = (_d = (_c = react_native_1.NativeModules.SettingsManager) === null || _c === void 0 ? void 0 : _c.settings) === null || _d === void 0 ? void 0 : _d.AppleLanguages) === null || _e === void 0 ? void 0 : _e[0])
                : (_f = react_native_1.NativeModules.I18nManager) === null || _f === void 0 ? void 0 : _f.localeIdentifier;
            return locale ? locale.replace("_", "-") : "en";
        }
        catch (e) {
            return "en";
        }
    }, []);
};
exports.useDeviceLocale = useDeviceLocale;
// ============================================================================
// Hook for reduced motion preference (Accessibility)
// ============================================================================
const useReducedMotion = () => {
    const [reducedMotion, setReducedMotion] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        let subscription = null;
        const checkReducedMotion = async () => {
            try {
                const isReduced = await react_native_1.AccessibilityInfo.isReduceMotionEnabled();
                setReducedMotion(isReduced);
            }
            catch (_a) {
                setReducedMotion(false);
            }
        };
        checkReducedMotion();
        subscription = react_native_1.AccessibilityInfo.addEventListener("reduceMotionChanged", (isReduced) => {
            setReducedMotion(isReduced);
        });
        return () => {
            subscription === null || subscription === void 0 ? void 0 : subscription.remove();
        };
    }, []);
    return reducedMotion;
};
exports.useReducedMotion = useReducedMotion;
const useDynamicTypeScale = (allowFontScaling, minimumFontScale, maxFontSizeMultiplier) => {
    return {
        allowFontScaling: allowFontScaling !== false,
        minimumFontScale: minimumFontScale !== null && minimumFontScale !== void 0 ? minimumFontScale : 0.5,
        maxFontSizeMultiplier: maxFontSizeMultiplier !== null && maxFontSizeMultiplier !== void 0 ? maxFontSizeMultiplier : 3,
    };
};
exports.useDynamicTypeScale = useDynamicTypeScale;
