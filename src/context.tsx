import React, { useCallback, useContext, useMemo, useState } from "react";
import { AppTextTheme } from "./types";
import { DEFAULT_THEME } from "./theme";

interface AppTextContextType {
  theme: AppTextTheme;
  updateTheme: (theme: Partial<AppTextTheme>) => void;
}

const AppTextContext = React.createContext<AppTextContextType | null>(null);

function deepMerge(
  target: AppTextTheme,
  source: Partial<AppTextTheme>,
): AppTextTheme {
  const result: AppTextTheme = {
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

export const AppTextProvider: React.FC<{
  theme?: Partial<AppTextTheme>;
  children: React.ReactNode;
}> = ({ theme: customTheme, children }) => {
  const [theme, setTheme] = useState<AppTextTheme>(() =>
    deepMerge(DEFAULT_THEME, customTheme ?? {}),
  );

  const updateTheme = useCallback((newTheme: Partial<AppTextTheme>) => {
    setTheme((prevTheme) => deepMerge(prevTheme, newTheme));
  }, []);

  const contextValue = useMemo(
    () => ({ theme, updateTheme }),
    [theme, updateTheme],
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
