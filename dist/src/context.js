import React, { createContext, useCallback, useContext, useMemo, useState, useEffect, } from "react";
import { DEFAULT_THEME } from "./theme";
const AppTextContext = React.createContext(null);
// ---------------------------------------------------------------------------
// Analytics context (lighter, for consumers that only need callbacks)
// ---------------------------------------------------------------------------
const AppTextAnalyticsContext = createContext({});
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            const sourceValue = source[key];
            const targetValue = result[key];
            if (sourceValue &&
                typeof sourceValue === "object" &&
                !Array.isArray(sourceValue) &&
                targetValue &&
                typeof targetValue === "object" &&
                !Array.isArray(targetValue)) {
                result[key] = deepMerge(targetValue, sourceValue);
            }
            else if (sourceValue !== undefined) {
                result[key] = sourceValue;
            }
        }
    }
    return result;
}
export const AppTextProvider = ({ theme: customTheme, children, onTranslate, onAnimationStart, onMissingTranslation, onPluginError, }) => {
    const [theme, setTheme] = useState(() => deepMerge(DEFAULT_THEME, customTheme || {}));
    useEffect(() => {
        if (customTheme) {
            setTheme((prevTheme) => deepMerge(prevTheme, customTheme));
        }
    }, [customTheme]);
    const updateTheme = useCallback((newTheme) => {
        setTheme((prevTheme) => deepMerge(prevTheme, newTheme));
    }, []);
    // Stable analytics object — only recreates when callbacks change
    const analytics = useMemo(() => ({
        onTranslate,
        onAnimationStart,
        onMissingTranslation,
        onPluginError,
    }), [onTranslate, onAnimationStart, onMissingTranslation, onPluginError]);
    const contextValue = useMemo(() => ({ theme, updateTheme, analytics }), [theme, updateTheme, analytics]);
    return (<AppTextContext.Provider value={contextValue}>
      <AppTextAnalyticsContext.Provider value={analytics}>
        {children}
      </AppTextAnalyticsContext.Provider>
    </AppTextContext.Provider>);
};
// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
/**
 * Returns the current AppText theme object.
 * Falls back to DEFAULT_THEME when used outside AppTextProvider.
 */
export const useAppTextTheme = () => {
    var _a;
    const context = useContext(AppTextContext);
    return (_a = context === null || context === void 0 ? void 0 : context.theme) !== null && _a !== void 0 ? _a : DEFAULT_THEME;
};
/**
 * Returns the `updateTheme` function that deep-merges partial theme overrides
 * into the current theme at runtime — without remounting AppTextProvider.
 */
export const useUpdateAppTheme = () => {
    const context = useContext(AppTextContext);
    if (!context) {
        if (__DEV__) {
            console.warn("useUpdateAppTheme: called outside <AppTextProvider>. " +
                "Theme updates will have no effect.");
        }
        return () => { };
    }
    return context.updateTheme;
};
/**
 * Returns the current analytics callbacks from `<AppTextProvider>`.
 * Safe to call — returns empty object when outside a provider.
 */
export const useAppTextAnalytics = () => {
    return useContext(AppTextAnalyticsContext);
};
