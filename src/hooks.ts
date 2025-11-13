import { useEffect, useMemo, useState } from "react";
import { Dimensions, PixelRatio } from "react-native";
import { AppTextTheme, ScriptCode } from "./types";
import { SCRIPT_CONFIGS } from "./scriptConfigs";

// Hook for responsive font scaling
export const useResponsiveFont = (
  baseSize: number,
  bounds?: { min?: number; max?: number }
) => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get("window"));

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) =>
      setDimensions(window)
    );
    return () => subscription?.remove();
  }, []);

  return useMemo(() => {
    const { width } = dimensions;
    const BASE_WIDTH = 375;
    const scale = (width / BASE_WIDTH) * PixelRatio.getFontScale();
    let scaledSize = Math.round(baseSize * scale * 100) / 100;

    if (bounds?.min) scaledSize = Math.max(scaledSize, bounds.min);
    if (bounds?.max) scaledSize = Math.min(scaledSize, bounds.max);

    return scaledSize;
  }, [baseSize, dimensions, bounds?.min, bounds?.max]);
};

// Hook for script detection
export const useScriptDetection = (text: string): ScriptCode => {
  return useMemo(() => {
    if (!text || text.length === 0) return "Unknown";

    const codePoint = text.codePointAt(0);
    if (!codePoint) return "Unknown";

    for (const [scriptCode, config] of Object.entries(SCRIPT_CONFIGS)) {
      if (
        config.unicodeRanges.some(
          ([start, end]) => codePoint >= start && codePoint <= end
        )
      ) {
        return scriptCode as ScriptCode;
      }
    }
    return "Unknown";
  }, [text]);
};

// Hook for theme-aware styles
export const useThemedStyles = (
  theme: AppTextTheme,
  colorScheme: "light" | "dark" | null | undefined
) => {
  return useMemo(() => {
    const isDark = colorScheme === "dark";
    return {
      defaultTextColor: isDark ? "#FFFFFF" : theme.colors.text,
      secondaryTextColor: isDark ? "#CCCCCC" : theme.colors.textSecondary,
      backgroundColor: isDark ? "#000000" : theme.colors.background,
    };
  }, [theme, colorScheme]);
};
