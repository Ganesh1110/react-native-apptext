import { useEffect, useMemo, useState } from "react";
import { Dimensions, PixelRatio } from "react-native";
import { SCRIPT_CONFIGS } from "./scriptConfigs";
// Hook for responsive font scaling
export const useResponsiveFont = (baseSize, bounds) => {
    const [dimensions, setDimensions] = useState(() => Dimensions.get("window"));
    useEffect(() => {
        const subscription = Dimensions.addEventListener("change", ({ window }) => setDimensions(window));
        return () => subscription === null || subscription === void 0 ? void 0 : subscription.remove();
    }, []);
    return useMemo(() => {
        const { width } = dimensions;
        const BASE_WIDTH = 375;
        const scale = (width / BASE_WIDTH) * PixelRatio.getFontScale();
        let scaledSize = Math.round(baseSize * scale * 100) / 100;
        if (bounds === null || bounds === void 0 ? void 0 : bounds.min)
            scaledSize = Math.max(scaledSize, bounds.min);
        if (bounds === null || bounds === void 0 ? void 0 : bounds.max)
            scaledSize = Math.min(scaledSize, bounds.max);
        return scaledSize;
    }, [baseSize, dimensions, bounds === null || bounds === void 0 ? void 0 : bounds.min, bounds === null || bounds === void 0 ? void 0 : bounds.max]);
};
// Hook for script detection
export const useScriptDetection = (text) => {
    return useMemo(() => {
        if (!text || text.length === 0)
            return "Unknown";
        const codePoint = text.codePointAt(0);
        if (!codePoint)
            return "Unknown";
        for (const [scriptCode, config] of Object.entries(SCRIPT_CONFIGS)) {
            if (config.unicodeRanges.some(([start, end]) => codePoint >= start && codePoint <= end)) {
                return scriptCode;
            }
        }
        return "Unknown";
    }, [text]);
};
// Hook for theme-aware styles
export const useThemedStyles = (theme, colorScheme) => {
    return useMemo(() => {
        const isDark = colorScheme === "dark";
        return {
            defaultTextColor: isDark ? "#FFFFFF" : theme.colors.text,
            secondaryTextColor: isDark ? "#CCCCCC" : theme.colors.textSecondary,
            backgroundColor: isDark ? "#000000" : theme.colors.background,
        };
    }, [theme, colorScheme]);
};
