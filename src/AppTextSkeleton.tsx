/**
 * AppTextSkeleton — Animated shimmer placeholder for AppText variants
 *
 * Use during lazy translation loading to prevent layout shift.
 * Mirrors the exact dimensions of any Material Design 3 or legacy typography
 * variant so the skeleton slot perfectly matches the real text.
 *
 * Usage:
 *   import { AppTextSkeleton } from 'react-native-apptext';
 *
 *   // Match a specific variant
 *   <AppTextSkeleton variant="bodyMedium" width={220} />
 *
 *   // Multiple lines
 *   <AppTextSkeleton variant="bodyLarge" lines={3} />
 *
 *   // Custom colours (dark mode)
 *   <AppTextSkeleton variant="labelSmall" baseColor="#1e1e1e" shimmerColor="#2a2a2a" />
 */

import React, { memo, useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";
import { TypographyVariant } from "./types";

// ---------------------------------------------------------------------------
// Variant → line-height map (mirrors theme.ts values)
// ---------------------------------------------------------------------------

const VARIANT_LINE_HEIGHT: Record<TypographyVariant, number> = {
  displayLarge: 64,
  displayMedium: 52,
  displaySmall: 44,
  headlineLarge: 40,
  headlineMedium: 36,
  headlineSmall: 32,
  titleLarge: 28,
  titleMedium: 24,
  titleSmall: 20,
  bodyLarge: 24,
  bodyMedium: 20,
  bodySmall: 16,
  labelLarge: 20,
  labelMedium: 16,
  labelSmall: 16,
  // Legacy
  h1: 40, h2: 36, h3: 32, h4: 28, h5: 26, h6: 24,
  title: 30, subtitle1: 26, subtitle2: 24,
  body1: 24, body2: 22, caption: 18,
  overline: 16, button: 24, code: 22,
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AppTextSkeletonProps {
  /** Typography variant to match. Default: 'bodyMedium' */
  variant?: TypographyVariant;
  /** Explicit width of the skeleton bar. Default: '100%' */
  width?: number | `${number}%`;
  /** Number of lines to render. Default: 1 */
  lines?: number;
  /** Gap between lines when lines > 1. Default: 6 */
  lineGap?: number;
  /** Last line width when lines > 1 (usually shorter). Default: '60%' */
  lastLineWidth?: number | `${number}%`;
  /** Base background colour. Default: '#E2E8F0' */
  baseColor?: string;
  /** Shimmer highlight colour. Default: '#F8FAFC' */
  shimmerColor?: string;
  /** Border radius for each bar. Default: 4 */
  borderRadius?: number;
  /** Container style */
  style?: ViewStyle;
  /** Shimmer animation duration in ms. Default: 1200 */
  duration?: number;
}

// ---------------------------------------------------------------------------
// Single bar component
// ---------------------------------------------------------------------------

interface SkeletonBarProps {
  height: number;
  width: number | string;
  borderRadius: number;
  shimmerAnim: Animated.Value;
  baseColor: string;
  shimmerColor: string;
}

const SkeletonBar = memo<SkeletonBarProps>(
  ({ height, width, borderRadius, shimmerAnim, baseColor, shimmerColor }) => {
    const backgroundColor = shimmerAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [baseColor, shimmerColor, baseColor],
    });

    return (
      <Animated.View
        style={[
          styles.bar,
          { height, width: width as any, borderRadius, backgroundColor },
        ]}
        accessibilityLabel="Loading"
        accessibilityRole="progressbar"
      />
    );
  },
);
SkeletonBar.displayName = "SkeletonBar";

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const AppTextSkeleton = memo<AppTextSkeletonProps>(
  ({
    variant = "bodyMedium",
    width = "100%",
    lines = 1,
    lineGap = 6,
    lastLineWidth = "60%",
    baseColor = "#E2E8F0",
    shimmerColor = "#F8FAFC",
    borderRadius = 4,
    style,
    duration = 1200,
  }) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;
    const lineHeight = VARIANT_LINE_HEIGHT[variant] ?? 20;
    // Skeleton bar is slightly shorter than full line height
    const barHeight = Math.max(lineHeight - 6, 8);

    useEffect(() => {
      const loop = Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration,
          useNativeDriver: false, // backgroundColor not supported on native driver
        }),
      );
      loop.start();
      return () => loop.stop();
    }, [shimmerAnim, duration]);

    return (
      <View style={[styles.container, style]}>
        {Array.from({ length: lines }).map((_, i) => {
          const isLast = i === lines - 1 && lines > 1;
          return (
            <View
              key={i}
              style={i > 0 ? { marginTop: lineGap } : undefined}
            >
              <SkeletonBar
                height={barHeight}
                width={isLast ? lastLineWidth : width}
                borderRadius={borderRadius}
                shimmerAnim={shimmerAnim}
                baseColor={baseColor}
                shimmerColor={shimmerColor}
              />
            </View>
          );
        })}
      </View>
    );
  },
);

AppTextSkeleton.displayName = "AppTextSkeleton";

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  bar: {
    overflow: "hidden",
  },
});
