import React, { useCallback, useContext, useMemo, useState } from "react";
import { AppTextTheme } from "./types";
import { DEFAULT_THEME } from "./theme";

interface AppTextContextType {
  theme: AppTextTheme;
  updateTheme: (theme: Partial<AppTextTheme>) => void;
}

const AppTextContext = React.createContext<AppTextContextType | null>(null);

export const AppTextProvider: React.FC<{
  theme?: Partial<AppTextTheme>;
  children: React.ReactNode;
}> = ({ theme: customTheme, children }) => {
  const [theme, setTheme] = useState<AppTextTheme>(() => ({
    ...DEFAULT_THEME,
    ...customTheme,
  }));

  const updateTheme = useCallback((newTheme: Partial<AppTextTheme>) => {
    setTheme((prevTheme) => ({ ...prevTheme, ...newTheme }));
  }, []);

  const contextValue = useMemo(
    () => ({ theme, updateTheme }),
    [theme, updateTheme]
  );

  return (
    <AppTextContext.Provider value={contextValue}>
      {children}
    </AppTextContext.Provider>
  );
};

export const useAppTextTheme = () => {
  const context = useContext(AppTextContext);
  return context?.theme ?? DEFAULT_THEME;
};
