import React, { useCallback, useContext, useMemo, useState } from "react";
import { AppTextTheme } from "./types";
import { DEFAULT_THEME } from "./theme";

interface AppTextContextType {
  theme: AppTextTheme;
  updateTheme: (theme: Partial<AppTextTheme>) => void;
}

const AppTextContext = React.createContext<AppTextContextType | null>(null);

function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        sourceValue &&
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === "object" &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(targetValue, sourceValue as any);
      } else if (sourceValue !== undefined) {
        result[key] = sourceValue as any;
      }
    }
  }

  return result;
}

export const AppTextProvider: React.FC<{
  theme?: Partial<AppTextTheme>;
  children: React.ReactNode;
}> = ({ theme: customTheme, children }) => {
  const [theme, setTheme] = useState<AppTextTheme>(() =>
    deepMerge(DEFAULT_THEME, customTheme || {})
  );

  const updateTheme = useCallback((newTheme: Partial<AppTextTheme>) => {
    setTheme((prevTheme) => deepMerge(prevTheme, newTheme));
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
