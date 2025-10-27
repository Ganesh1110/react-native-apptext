import { useEffect, useMemo, useState } from "react";
import { Dimensions, PixelRatio } from "react-native";
import { AppTextTheme } from "./types";

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