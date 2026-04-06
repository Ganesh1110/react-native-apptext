import React, { useCallback, useContext, useMemo, useState, useEffect, } from "react";
import { DEFAULT_THEME } from "./theme";
const AppTextContext = React.createContext(null);
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
export const AppTextProvider = ({ theme: customTheme, children }) => {
    const [theme, setTheme] = useState(() => deepMerge(DEFAULT_THEME, customTheme || {}));
    useEffect(() => {
        if (customTheme) {
            setTheme((prevTheme) => deepMerge(prevTheme, customTheme));
        }
    }, [customTheme]);
    const updateTheme = useCallback((newTheme) => {
        setTheme((prevTheme) => deepMerge(prevTheme, newTheme));
    }, []);
    const contextValue = useMemo(() => ({ theme, updateTheme }), [theme, updateTheme]);
    return (<AppTextContext.Provider value={contextValue}>
      {children}
    </AppTextContext.Provider>);
};
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
 *
 * Must be used inside `<AppTextProvider>`.
 *
 * @example
 * const updateTheme = useUpdateAppTheme();
 * // Switch primary colour to brand red at runtime
 * updateTheme({ colors: { primary: '#E53E3E' } });
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
