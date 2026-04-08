/**
 * react-native-typography/reanimated
 *
 * Optional Reanimated v3+ integration for AppText animations.
 *
 * ⚠️  Sub-entry point — import ONLY if react-native-reanimated is installed:
 *
 *     import { ReanimatedAppText, useReanimatedText } from 'react-native-typography/reanimated';
 *
 * The main bundle (`react-native-typography`) is completely unaffected.
 * This file contains DIRECT imports from 'react-native-reanimated' — users who
 * import this sub-entry MUST have Reanimated ≥ 3 properly set up.
 *
 * Supported animations (Reanimated-native, runs on UI thread):
 *   fade | slideInRight | slideInLeft | slideInUp | slideInDown |
 *   bounceIn | pulse | shake | bounce | zoomIn
 */

import React, { memo, useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  withSpring,
  runOnJS,
  Easing,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import type { StyleProp, TextStyle } from "react-native";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ReanimatedAnimationType =
  | "fade"
  | "slideInRight"
  | "slideInLeft"
  | "slideInUp"
  | "slideInDown"
  | "bounceIn"
  | "pulse"
  | "shake"
  | "bounce"
  | "zoomIn";

export interface ReanimatedTextConfig {
  /** Animation type */
  animation: ReanimatedAnimationType;
  /** Duration in ms. Default: 600 */
  duration?: number;
  /** Initial delay in ms. Default: 0 */
  delay?: number;
  /** Loop the animation. Default: false */
  loop?: boolean;
  /** Called when the animation starts (runs on JS thread) */
  onStart?: () => void;
  /** Called when the animation completes (runs on JS thread) */
  onComplete?: () => void;
}

export interface ReanimatedTextProps extends ReanimatedTextConfig {
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
  testID?: string;
}

// ---------------------------------------------------------------------------
// Hook: useReanimatedText
// ---------------------------------------------------------------------------

/**
 * Returns a Reanimated-driven `animatedStyle` for AppText using `useSharedValue`.
 * All animation worklets run on the UI thread — zero JS-thread drops.
 *
 * ```tsx
 * const animatedStyle = useReanimatedText({
 *   animation: 'bounceIn',
 *   duration: 500,
 *   delay: 200,
 * });
 * ```
 */
export function useReanimatedText(config: ReanimatedTextConfig) {
  const {
    animation,
    duration = 600,
    delay = 0,
    loop = false,
    onStart,
    onComplete,
  } = config;

  const progress = useSharedValue(0);
  const slideX = useSharedValue(0);
  const slideY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    const timing = (toValue: number) =>
      withTiming(toValue, {
        duration,
        easing: Easing.out(Easing.cubic),
      });

    const startFn = onStart ? () => runOnJS(onStart)() : undefined;
    const doneFn = onComplete ? () => runOnJS(onComplete)() : undefined;

    const runAnim = () => {
      switch (animation) {
        case "fade":
          progress.value = withTiming(1, { duration }, doneFn);
          break;

        case "slideInRight":
          slideX.value = -60;
          progress.value = 0;
          slideX.value = withDelay(delay, timing(0));
          progress.value = withDelay(delay, timing(1));
          break;

        case "slideInLeft":
          slideX.value = 60;
          progress.value = 0;
          slideX.value = withDelay(delay, timing(0));
          progress.value = withDelay(delay, timing(1));
          break;

        case "slideInUp":
          slideY.value = 40;
          progress.value = 0;
          slideY.value = withDelay(delay, timing(0));
          progress.value = withDelay(delay, timing(1));
          break;

        case "slideInDown":
          slideY.value = -40;
          progress.value = 0;
          slideY.value = withDelay(delay, timing(0));
          progress.value = withDelay(delay, timing(1));
          break;

        case "bounceIn":
          scale.value = 0.3;
          progress.value = 0;
          scale.value = withDelay(
            delay,
            withSpring(1, { damping: 8, stiffness: 100 }),
          );
          progress.value = withDelay(delay, timing(1));
          break;

        case "zoomIn":
          scale.value = 0;
          progress.value = 0;
          scale.value = withDelay(delay, timing(1));
          progress.value = withDelay(delay, timing(1));
          break;

        case "pulse":
          if (loop) {
            scale.value = withRepeat(
              withSequence(
                withTiming(1.1, { duration: duration / 2 }),
                withTiming(1.0, { duration: duration / 2 }),
              ),
              -1,
              true,
            );
          } else {
            scale.value = withSequence(
              withTiming(1.1, { duration: duration / 2 }),
              withTiming(1.0, { duration: duration / 2 }, doneFn),
            );
          }
          progress.value = 1;
          break;

        case "shake":
          slideX.value = withRepeat(
            withSequence(
              withTiming(-8, { duration: duration / 6 }),
              withTiming(8, { duration: duration / 6 }),
              withTiming(-4, { duration: duration / 6 }),
              withTiming(4, { duration: duration / 6 }),
              withTiming(0, { duration: duration / 6 }),
            ),
            loop ? -1 : 1,
            false,
            doneFn,
          );
          progress.value = 1;
          break;

        case "bounce":
          slideY.value = withRepeat(
            withSequence(
              withTiming(-16, { duration: duration / 2 }),
              withTiming(0, { duration: duration / 2 }),
            ),
            loop ? -1 : 1,
            false,
            doneFn,
          );
          progress.value = 1;
          break;
      }
    };

    if (
      delay &&
      animation !== "shake" &&
      animation !== "bounce" &&
      animation !== "pulse"
    ) {
      const timer = setTimeout(runAnim, delay);
      return () => clearTimeout(timer);
    } else {
      runAnim();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animation, duration, delay, loop]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0, 1],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      opacity:
        animation === "pulse" || animation === "shake" || animation === "bounce"
          ? 1
          : opacity,
      transform: [
        { translateX: slideX.value },
        { translateY: slideY.value },
        { scale: scale.value },
      ],
    };
  });

  return animatedStyle;
}

// ---------------------------------------------------------------------------
// Component: ReanimatedAppText
// ---------------------------------------------------------------------------

/**
 * Drop-in replacement for `AppText` using Reanimated v3 for animations.
 * All animations run on the UI thread — eliminates JS-thread frame drops.
 *
 * ```tsx
 * import { ReanimatedAppText } from 'react-native-typography/reanimated';
 *
 * <ReanimatedAppText animation="bounceIn" duration={500} style={{ fontSize: 24 }}>
 *   Hello, Reanimated!
 * </ReanimatedAppText>
 * ```
 */
export const ReanimatedAppText = memo<ReanimatedTextProps>(
  ({
    animation,
    duration,
    delay,
    loop,
    onStart,
    onComplete,
    children,
    style,
    testID,
  }) => {
    const animatedStyle = useReanimatedText({
      animation,
      duration,
      delay,
      loop,
      onStart,
      onComplete,
    });

    return (
      <Animated.Text style={[style, animatedStyle]} testID={testID}>
        {children}
      </Animated.Text>
    );
  },
);

ReanimatedAppText.displayName = "ReanimatedAppText";

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Returns true if react-native-reanimated v3+ is available.
 * This function must be called from the main entry if you need to guard
 * Reanimated usage — however users of the `./reanimated` sub-entry implicitly
 * confirm they have Reanimated installed.
 */
export function isReanimatedAvailable(): boolean {
  return true; // If this file loads, Reanimated is available
}
