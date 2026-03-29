import React, { useCallback, useContext, useMemo, useState } from "react";
import { DEFAULT_THEME } from "./theme";
const AppTextContext = React.createContext(null);
function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
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
    const updateTheme = useCallback((newTheme) => {
        setTheme((prevTheme) => deepMerge(prevTheme, newTheme));
    }, []);
    const contextValue = useMemo(() => ({ theme, updateTheme }), [theme, updateTheme]);
    return (<AppTextContext.Provider value={contextValue}>
      {children}
    </AppTextContext.Provider>);
};
export const useAppTextTheme = () => {
    var _a;
    const context = useContext(AppTextContext);
    return (_a = context === null || context === void 0 ? void 0 : context.theme) !== null && _a !== void 0 ? _a : DEFAULT_THEME;
};
