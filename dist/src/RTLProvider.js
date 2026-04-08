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
import React, { createContext, memo, useCallback, useContext, useEffect, useMemo, useState, } from "react";
import { I18nManager, Platform, View, StyleSheet } from "react-native";
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
export function isRTLLanguage(language) {
    if (!language)
        return false;
    const code = language.split("-")[0].toLowerCase();
    return RTL_LANGUAGE_CODES.has(code);
}
const RTLContext = createContext({
    isRTL: false,
    setRTL: () => { },
    restartRequired: false,
    mode: "native",
});
export const RTLProvider = memo(({ language, forceRTL, autoApply = true, mode = "native", children }) => {
    const detectedRTL = isRTLLanguage(language);
    const targetRTL = forceRTL !== undefined ? forceRTL : detectedRTL;
    const [isRTL, setIsRTLState] = useState(() => (mode === "native" ? I18nManager.isRTL : false) || targetRTL);
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
                    console.warn(`[RTLProvider] RTL changed to ${targetRTL}. ` +
                        "A full app reload is needed for native layout mirroring to take effect. " +
                        "Use mode='css' to avoid this requirement.");
                }
            }
        }
        else {
            setIsRTLState(targetRTL);
        }
    }, [targetRTL, autoApply, mode]);
    const setRTL = useCallback((rtl) => {
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
    }, [mode]);
    const value = useMemo(() => ({ isRTL, setRTL, restartRequired, mode: mode !== null && mode !== void 0 ? mode : "native" }), [isRTL, setRTL, restartRequired, mode]);
    return <RTLContext.Provider value={value}>{children}</RTLContext.Provider>;
});
RTLProvider.displayName = "RTLProvider";
// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
/**
 * Returns RTL context: `{ isRTL, setRTL, restartRequired, mode }`.
 * Must be used inside `<RTLProvider>`.
 */
export function useRTL() {
    return useContext(RTLContext);
}
/**
 * Helper: returns a flexDirection value based on RTL context.
 * Usage: `style={{ flexDirection: useRTLDirection('row') }}`
 */
export function useRTLFlexDirection(ltrDirection = "row") {
    const { isRTL } = useRTL();
    if (ltrDirection === "column")
        return "column";
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
export function useRTLStyle() {
    const { isRTL } = useRTL();
    return useMemo(() => ({
        row: { flexDirection: isRTL ? "row-reverse" : "row" },
        rowReverse: { flexDirection: isRTL ? "row" : "row-reverse" },
        textAlign: { textAlign: isRTL ? "right" : "left" },
        textAlignReverse: { textAlign: isRTL ? "left" : "right" },
        start: { alignItems: isRTL ? "flex-end" : "flex-start" },
        end: { alignItems: isRTL ? "flex-start" : "flex-end" },
        paddingStart: (v) => isRTL ? { paddingRight: v } : { paddingLeft: v },
        paddingEnd: (v) => isRTL ? { paddingLeft: v } : { paddingRight: v },
        marginStart: (v) => isRTL ? { marginRight: v } : { marginLeft: v },
        marginEnd: (v) => isRTL ? { marginLeft: v } : { marginRight: v },
    }), [isRTL]);
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
export const RTLView = memo(({ children, style, forceRTL, ...props }) => {
    const { isRTL } = useRTL();
    const rtl = forceRTL !== undefined ? forceRTL : isRTL;
    const resolvedStyle = useMemo(() => {
        const flat = StyleSheet.flatten(style) || {};
        const base = flat.flexDirection === "column"
            ? {}
            : {
                flexDirection: (rtl
                    ? "row-reverse"
                    : "row"),
            };
        return { ...base, ...flat };
    }, [style, rtl]);
    return (<View style={resolvedStyle} {...props}>
        {children}
      </View>);
});
RTLView.displayName = "RTLView";
