/**
 * useTextMetrics — Text Layout Measurement Hook
 *
 * Measures text dimensions (width, height, line count, truncation state)
 * without rendering it visibly. Uses a hidden off-screen Text element whose
 * `onLayout` and `onTextLayout` events provide accurate pre-render metrics.
 *
 * Returns `{ metrics, GhostText }`:
 *  - `metrics` — the measured values (initially `{ measured: false }`)
 *  - `GhostText` — a React component you render *once* anywhere in the tree
 *                  (it is absolutely positioned, zero-opacity, pointer-events: none)
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { metrics, GhostText } = useTextMetrics({
 *     text: 'Hello, World!',
 *     variant: 'bodyLarge',
 *     maxWidth: 300,
 *     numberOfLines: 3,
 *   });
 *
 *   return (
 *     <View>
 *       <GhostText />                  // invisible — triggers measurement
 *       {metrics.measured && (
 *         <AppText>
 *           Lines: {metrics.lines}, truncated: {String(metrics.isTruncated)}
 *         </AppText>
 *       )}
 *     </View>
 *   );
 * }
 * ```
 */
import React, { memo, useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View, } from "react-native";
import { useAppTextTheme } from "./context";
const INITIAL_METRICS = {
    width: 0,
    height: 0,
    lines: 0,
    isTruncated: false,
    measured: false,
};
// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
/**
 * Measures a text string before rendering it visibly.
 * Returns current metrics and a `GhostText` component to place in your tree.
 */
export function useTextMetrics(opts) {
    var _a;
    const { text, variant = "body1", numberOfLines, maxWidth, style } = opts;
    const theme = useAppTextTheme();
    const [metrics, setMetrics] = useState(INITIAL_METRICS);
    const typographyStyle = (_a = theme.typography[variant]) !== null && _a !== void 0 ? _a : theme.typography.body1;
    const resolvedStyle = useMemo(() => ({
        fontSize: typographyStyle.fontSize,
        lineHeight: typographyStyle.lineHeight,
        fontWeight: typographyStyle.fontWeight,
        letterSpacing: typographyStyle.letterSpacing,
        fontFamily: typographyStyle.fontFamily,
        ...(StyleSheet.flatten(style) || {}),
    }), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [variant, style, theme]);
    const handleTextLayout = useCallback((e) => {
        const lineCount = e.nativeEvent.lines.length;
        const isTruncated = numberOfLines != null ? lineCount > numberOfLines : false;
        const measuredWidth = e.nativeEvent.lines.reduce((max, l) => Math.max(max, l.width), 0);
        const measuredHeight = e.nativeEvent.lines.reduce((sum, l) => sum + l.height, 0);
        setMetrics({
            width: measuredWidth,
            height: measuredHeight,
            lines: lineCount,
            isTruncated,
            measured: true,
        });
    }, [numberOfLines]);
    // Memoize GhostText so it doesn't cause child re-renders on every parent render
    // eslint-disable-next-line react/display-name
    const GhostText = useMemo(() => memo(() => (<View style={ghostStyles.container} pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants">
          <Text style={[
            resolvedStyle,
            ghostStyles.text,
            maxWidth != null ? { width: maxWidth } : undefined,
        ]} onTextLayout={handleTextLayout} accessible={false}>
            {text}
          </Text>
        </View>)), 
    // Re-create GhostText only when key inputs change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, resolvedStyle, maxWidth, handleTextLayout]);
    return { metrics, GhostText };
}
// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const ghostStyles = StyleSheet.create({
    container: {
        position: "absolute",
        top: -9999,
        left: -9999,
        opacity: 0,
        overflow: "hidden",
    },
    text: {
    // No numberOfLines here — we want the FULL line count
    // The consumer compares: lines > numberOfLines
    },
});
