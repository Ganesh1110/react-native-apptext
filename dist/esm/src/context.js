import React, { useCallback, useContext, useMemo, useState } from "react";
import { DEFAULT_THEME } from "./theme";
const AppTextContext = React.createContext(null);
function deepMerge(target, source) {
    const result = {
        colors: { ...target.colors },
        typography: { ...target.typography },
        spacing: { ...target.spacing },
    };
    if (source.colors) {
        result.colors = { ...result.colors, ...source.colors };
    }
    if (source.typography) {
        result.typography = { ...result.typography, ...source.typography };
    }
    if (source.spacing) {
        result.spacing = { ...result.spacing, ...source.spacing };
    }
    return result;
}
export const AppTextProvider = ({ theme: customTheme, children }) => {
    const [theme, setTheme] = useState(() => deepMerge(DEFAULT_THEME, customTheme !== null && customTheme !== void 0 ? customTheme : {}));
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
