import React, { useCallback, useContext, useMemo, useState } from "react";
import { DEFAULT_THEME } from "./theme";
const AppTextContext = React.createContext(null);
export const AppTextProvider = ({ theme: customTheme, children }) => {
    const [theme, setTheme] = useState(() => ({
        ...DEFAULT_THEME,
        ...customTheme,
    }));
    const updateTheme = useCallback((newTheme) => {
        setTheme((prevTheme) => ({ ...prevTheme, ...newTheme }));
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
