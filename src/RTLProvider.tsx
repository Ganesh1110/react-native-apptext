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
 *   import { RTLProvider, useRTL } from 'react-native-typography';
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
import { I18nManager, Platform, View, StyleSheet } from "react-native";
import type { FlexStyle, ViewStyle } from "react-native";

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
  "az", // Azerbaijani (Arabic script variant)
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
  /**
   * RTL mode: 'native' uses I18nManager (needs restart),
   * 'css' uses only flex/textAlign mirroring (instant, no restart).
   */
  mode: "native" | "css";
}

const RTLContext = createContext<RTLContextValue>({
  isRTL: false,
  setRTL: () => {},
  restartRequired: false,
  mode: "native",
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
  /**
   * 'native'  → calls `I18nManager.forceRTL()` (requires restart on iOS/Android)
   * 'css'     → uses only flex/textAlign mirroring, takes effect immediately
   *
   * Default: 'native'
   */
  mode?: "native" | "css";
  children: React.ReactNode;
}

export const RTLProvider = memo<RTLProviderProps>(
  ({ language, forceRTL, autoApply = true, mode = "native", children }) => {
    const detectedRTL = isRTLLanguage(language);
    const targetRTL = forceRTL !== undefined ? forceRTL : detectedRTL;

    const [isRTL, setIsRTLState] = useState<boolean>(
      () => (mode === "native" ? I18nManager.isRTL : false) || targetRTL,
    );
    const [restartRequired, setRestartRequired] = useState(false);

    // Sync when language changes
    useEffect(() => {
      if (mode === "css") {
        // CSS-only mode: just flip the state — no I18nManager, no restart needed
        setIsRTLState(targetRTL);
        setRestartRequired(false);
        return;
      }

      // Native mode
      if (autoApply && targetRTL !== I18nManager.isRTL) {
        I18nManager.forceRTL(targetRTL);
        setIsRTLState(targetRTL);

        // Native layout only respects isRTL after a restart on iOS/Android
        if (Platform.OS !== "web") {
          setRestartRequired(true);
          if (__DEV__) {
            console.warn(
              `[RTLProvider] RTL changed to ${targetRTL}. ` +
                "A full app reload is needed for native layout mirroring to take effect. " +
                "Use mode='css' to avoid this requirement.",
            );
          }
        }
      } else {
        setIsRTLState(targetRTL);
      }
    }, [targetRTL, autoApply, mode]);

    const setRTL = useCallback(
      (rtl: boolean) => {
        if (mode === "css") {
          setIsRTLState(rtl);
          setRestartRequired(false);
          return;
        }
        I18nManager.forceRTL(rtl);
        setIsRTLState(rtl);
        if (rtl !== I18nManager.isRTL && Platform.OS !== "web") {
          setRestartRequired(true);
        }
      },
      [mode],
    );

    const value = useMemo<RTLContextValue>(
      () => ({ isRTL, setRTL, restartRequired, mode: mode ?? "native" }),
      [isRTL, setRTL, restartRequired, mode],
    );

    return <RTLContext.Provider value={value}>{children}</RTLContext.Provider>;
  },
);

RTLProvider.displayName = "RTLProvider";

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Returns RTL context: `{ isRTL, setRTL, restartRequired, mode }`.
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

/**
 * Returns a complete set of RTL-aware layout styles based on RTL context.
 *
 * Example:
 * ```tsx
 * const rtl = useRTLStyle();
 * <View style={rtl.row}><Text style={rtl.text}>Hello</Text></View>
 * ```
 */
export function useRTLStyle(): {
  row: ViewStyle;
  rowReverse: ViewStyle;
  textAlign: { textAlign: "left" | "right" };
  textAlignReverse: { textAlign: "left" | "right" };
  start: { alignItems: FlexStyle["alignItems"] };
  end: { alignItems: FlexStyle["alignItems"] };
  paddingStart: (v: number) => ViewStyle;
  paddingEnd: (v: number) => ViewStyle;
  marginStart: (v: number) => ViewStyle;
  marginEnd: (v: number) => ViewStyle;
} {
  const { isRTL } = useRTL();
  return useMemo(
    () => ({
      row: { flexDirection: isRTL ? "row-reverse" : "row" },
      rowReverse: { flexDirection: isRTL ? "row" : "row-reverse" },
      textAlign: { textAlign: isRTL ? "right" : "left" },
      textAlignReverse: { textAlign: isRTL ? "left" : "right" },
      start: { alignItems: isRTL ? "flex-end" : "flex-start" },
      end: { alignItems: isRTL ? "flex-start" : "flex-end" },
      paddingStart: (v: number) =>
        isRTL ? { paddingRight: v } : { paddingLeft: v },
      paddingEnd: (v: number) =>
        isRTL ? { paddingLeft: v } : { paddingRight: v },
      marginStart: (v: number) =>
        isRTL ? { marginRight: v } : { marginLeft: v },
      marginEnd: (v: number) =>
        isRTL ? { marginLeft: v } : { marginRight: v },
    }),
    [isRTL],
  );
}

// ---------------------------------------------------------------------------
// RTLView — drop-in replacement for View that auto-mirrors flex direction
// ---------------------------------------------------------------------------

export interface RTLViewProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  /** Overrides the RTL context for this subtree only */
  forceRTL?: boolean;
  [key: string]: any;
}

/**
 * A `<View>` that automatically applies `flexDirection: 'row-reverse'`
 * when the app is in RTL mode (from `RTLProvider` context).
 *
 * In CSS mode this works immediately without a restart.
 *
 * ```tsx
 * <RTLView style={{ gap: 8 }}>
 *   <Icon /><Label />
 * </RTLView>
 * ```
 */
export const RTLView = memo<RTLViewProps>(
  ({ children, style, forceRTL, ...props }) => {
    const { isRTL } = useRTL();
    const rtl = forceRTL !== undefined ? forceRTL : isRTL;
    const resolvedStyle = useMemo<ViewStyle>(() => {
      const flat = StyleSheet.flatten(style) || {};
      const base =
        flat.flexDirection === "column"
          ? {}
          : {
              flexDirection: (rtl
                ? "row-reverse"
                : "row") as FlexStyle["flexDirection"],
            };
      return { ...base, ...flat };
    }, [style, rtl]);

    return (
      <View style={resolvedStyle} {...props}>
        {children}
      </View>
    );
  },
);

RTLView.displayName = "RTLView";
