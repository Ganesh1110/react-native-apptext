/**
 * RTLProvider — App-wide RTL layout mirroring helper
 *
 * AppText automatically sets `writingDirection` on individual Text nodes,
 * but full RTL mirroring (reversing flex rows, icons, etc.) requires calling
 * `I18nManager.forceRTL(true)` at the app level.
 *
 * RTLProvider:
 *  - Calls `I18nManager.forceRTL()` when the locale is RTL
 *  - Exposes `isRTL`, `setRTL(bool)` via context
 *  - Warns in __DEV__ when a restart is needed for changes to take effect
 *
 * Usage:
 *   import { RTLProvider, useRTL } from 'react-native-apptext';
 *
 *   // Wrap your root
 *   <RTLProvider language={currentLanguage}>
 *     <App />
 *   </RTLProvider>
 *
 *   // Consume anywhere
 *   const { isRTL } = useRTL();
 *   <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
 */

import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { I18nManager, Platform } from "react-native";

// ---------------------------------------------------------------------------
// RTL language detection
// ---------------------------------------------------------------------------

/**
 * ISO 639-1 / BCP-47 language codes known to use RTL scripts.
 * Add entries here to extend support (e.g. Thaana: "dv", Adlam: "ff-Adlm").
 */
export const RTL_LANGUAGE_CODES = new Set([
  "ar", // Arabic
  "he", // Hebrew
  "fa", // Persian / Farsi
  "ur", // Urdu
  "ps", // Pashto
  "sd", // Sindhi
  "ku", // Kurdish (Sorani)
  "yi", // Yiddish
  "dv", // Thaana (Dhivehi/Maldivian)
  "ug", // Uyghur
  "arc", // Aramaic
  "az",  // Azerbaijani (Arabic script variant)
  "nqo", // N'Ko
]);

export function isRTLLanguage(language: string): boolean {
  if (!language) return false;
  const code = language.split("-")[0].toLowerCase();
  return RTL_LANGUAGE_CODES.has(code);
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface RTLContextValue {
  /** Whether the app is currently in RTL mode */
  isRTL: boolean;
  /**
   * Programmatically set RTL mode.
   * On iOS and Android, this calls `I18nManager.forceRTL()` and may require
   * a full app restart to take effect in the native layout engine.
   */
  setRTL: (rtl: boolean) => void;
  /**
   * Whether a restart is pending (i.e. `setRTL` was called but the native
   * engine has not yet picked up the change).
   */
  restartRequired: boolean;
}

const RTLContext = createContext<RTLContextValue>({
  isRTL: false,
  setRTL: () => {},
  restartRequired: false,
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface RTLProviderProps {
  /**
   * Current BCP-47 language code. When this changes, the provider
   * automatically updates `I18nManager.forceRTL`.
   */
  language: string;
  /**
   * Override the automatic RTL detection. Default: derived from `language`.
   */
  forceRTL?: boolean;
  /**
   * When true, the provider will call `I18nManager.forceRTL()` automatically
   * when a RTL language is detected. Default: true.
   */
  autoApply?: boolean;
  children: React.ReactNode;
}

export const RTLProvider = memo<RTLProviderProps>(
  ({ language, forceRTL, autoApply = true, children }) => {
    const detectedRTL = isRTLLanguage(language);
    const targetRTL = forceRTL !== undefined ? forceRTL : detectedRTL;

    const [isRTL, setIsRTLState] = useState<boolean>(
      () => I18nManager.isRTL || targetRTL,
    );
    const [restartRequired, setRestartRequired] = useState(false);

    // Sync when language changes
    useEffect(() => {
      if (autoApply && targetRTL !== I18nManager.isRTL) {
        I18nManager.forceRTL(targetRTL);
        setIsRTLState(targetRTL);

        // Native layout only respects isRTL after a restart on iOS/Android
        if (Platform.OS !== "web") {
          setRestartRequired(true);
          if (__DEV__) {
            console.warn(
              `[RTLProvider] RTL changed to ${targetRTL}. ` +
                "A full app reload is needed for native layout mirroring to take effect.",
            );
          }
        }
      } else {
        setIsRTLState(targetRTL);
      }
    }, [targetRTL, autoApply]);

    const setRTL = useCallback((rtl: boolean) => {
      I18nManager.forceRTL(rtl);
      setIsRTLState(rtl);
      if (rtl !== I18nManager.isRTL && Platform.OS !== "web") {
        setRestartRequired(true);
      }
    }, []);

    const value = useMemo<RTLContextValue>(
      () => ({ isRTL, setRTL, restartRequired }),
      [isRTL, setRTL, restartRequired],
    );

    return <RTLContext.Provider value={value}>{children}</RTLContext.Provider>;
  },
);

RTLProvider.displayName = "RTLProvider";

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Returns RTL context: `{ isRTL, setRTL, restartRequired }`.
 * Must be used inside `<RTLProvider>`.
 */
export function useRTL(): RTLContextValue {
  return useContext(RTLContext);
}

/**
 * Helper: returns a flexDirection value based on RTL context.
 * Usage: `style={{ flexDirection: useRTLDirection('row') }}`
 */
export function useRTLFlexDirection(
  ltrDirection: "row" | "column" = "row",
): "row" | "row-reverse" | "column" {
  const { isRTL } = useRTL();
  if (ltrDirection === "column") return "column";
  return isRTL ? "row-reverse" : "row";
}
