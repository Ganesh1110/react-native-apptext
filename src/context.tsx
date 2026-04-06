import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import { AppTextTheme } from "./types";
import { DEFAULT_THEME } from "./theme";

// ---------------------------------------------------------------------------
// Analytics callbacks
// ---------------------------------------------------------------------------

export interface AppTextAnalyticsCallbacks {
  /**
   * Called after every successful translation lookup.
   * @param key       The translation key
   * @param locale    The active locale code (e.g. "en", "fr")
   * @param durationMs  Lookup time in milliseconds (from LRU/ICU)
   */
  onTranslate?: (key: string, locale: string, durationMs: number) => void;
  /**
   * Called when an AppText component starts an animation.
   * @param type    Animation type (e.g. "bounceIn", "wave", "typewriter")
   * @param variant Typography variant of the component
   */
  onAnimationStart?: (type: string, variant: string) => void;
  /**
   * Called when a translation key is missing from the active locale.
   * Fires in addition to any `onMissingTranslation` on `<LocaleProvider>`.
   */
  onMissingTranslation?: (key: string, locale: string) => void;
  /**
   * Called when a plugin transform throws an error.
   */
  onPluginError?: (pluginName: string, error: Error) => void;
}

// ---------------------------------------------------------------------------
// Context value
// ---------------------------------------------------------------------------

export interface AppTextContextValue {
  theme: AppTextTheme;
  updateTheme: (theme: Partial<AppTextTheme>) => void;
  analytics: AppTextAnalyticsCallbacks;
}

const AppTextContext = React.createContext<AppTextContextValue | null>(null);

// ---------------------------------------------------------------------------
// Analytics context (lighter, for consumers that only need callbacks)
// ---------------------------------------------------------------------------

const AppTextAnalyticsContext = createContext<AppTextAnalyticsCallbacks>({});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>,
): T {
  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
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

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface AppTextProviderProps {
  theme?: Partial<AppTextTheme>;
  children: React.ReactNode;
  // Analytics callbacks
  onTranslate?: AppTextAnalyticsCallbacks["onTranslate"];
  onAnimationStart?: AppTextAnalyticsCallbacks["onAnimationStart"];
  onMissingTranslation?: AppTextAnalyticsCallbacks["onMissingTranslation"];
  onPluginError?: AppTextAnalyticsCallbacks["onPluginError"];
}

export const AppTextProvider: React.FC<AppTextProviderProps> = ({
  theme: customTheme,
  children,
  onTranslate,
  onAnimationStart,
  onMissingTranslation,
  onPluginError,
}) => {
  const [theme, setTheme] = useState<AppTextTheme>(() =>
    deepMerge(DEFAULT_THEME, customTheme || {}),
  );

  useEffect(() => {
    if (customTheme) {
      setTheme((prevTheme) => deepMerge(prevTheme, customTheme));
    }
  }, [customTheme]);

  const updateTheme = useCallback((newTheme: Partial<AppTextTheme>) => {
    setTheme((prevTheme) => deepMerge(prevTheme, newTheme));
  }, []);

  // Stable analytics object — only recreates when callbacks change
  const analytics = useMemo<AppTextAnalyticsCallbacks>(
    () => ({
      onTranslate,
      onAnimationStart,
      onMissingTranslation,
      onPluginError,
    }),
    [onTranslate, onAnimationStart, onMissingTranslation, onPluginError],
  );

  const contextValue = useMemo(
    () => ({ theme, updateTheme, analytics }),
    [theme, updateTheme, analytics],
  );

  return (
    <AppTextContext.Provider value={contextValue}>
      <AppTextAnalyticsContext.Provider value={analytics}>
        {children}
      </AppTextAnalyticsContext.Provider>
    </AppTextContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Returns the current AppText theme object.
 * Falls back to DEFAULT_THEME when used outside AppTextProvider.
 */
export const useAppTextTheme = (): AppTextTheme => {
  const context = useContext(AppTextContext);
  return context?.theme ?? DEFAULT_THEME;
};

/**
 * Returns the `updateTheme` function that deep-merges partial theme overrides
 * into the current theme at runtime — without remounting AppTextProvider.
 */
export const useUpdateAppTheme = (): ((patch: Partial<AppTextTheme>) => void) => {
  const context = useContext(AppTextContext);
  if (!context) {
    if (__DEV__) {
      console.warn(
        "useUpdateAppTheme: called outside <AppTextProvider>. " +
          "Theme updates will have no effect.",
      );
    }
    return () => {};
  }
  return context.updateTheme;
};

/**
 * Returns the current analytics callbacks from `<AppTextProvider>`.
 * Safe to call — returns empty object when outside a provider.
 */
export const useAppTextAnalytics = (): AppTextAnalyticsCallbacks => {
  return useContext(AppTextAnalyticsContext);
};
