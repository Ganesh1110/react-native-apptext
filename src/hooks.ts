import { useEffect, useCallback, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Dimensions,
  ScaledSize,
  PixelRatio,
  NativeModules,
  Platform,
} from "react-native";
import { AppTextTheme, ScriptCode } from "./types";
import { SCRIPT_CONFIGS } from "./scriptConfigs";
import {
  BASE_WIDTH,
  RESPONSIVE_FONT_MIN,
  RESPONSIVE_FONT_MAX,
} from "./constants";

// ============================================================================
// Shared Dimensions Singleton
// ============================================================================
// Instead of each AppText instance registering its own Dimensions listener,
// we maintain a single module-level listener and distribute updates via a
// subscriber set. This prevents O(n) listeners for n AppText components.

type DimensionListener = (dims: ScaledSize) => void;

let _currentDimensions: ScaledSize = Dimensions.get("window");
const _listeners = new Set<DimensionListener>();
let _subscription: any = null;

const registerDimensionListener = () => {
  if (!_subscription) {
    _subscription = Dimensions.addEventListener("change", ({ window }) => {
      _currentDimensions = window;
      _listeners.forEach((fn) => fn(window));
    });
  }
};

function subscribeToWindowDimensions(listener: DimensionListener): () => void {
  registerDimensionListener();
  _listeners.add(listener);

  return () => {
    _listeners.delete(listener);
    if (_listeners.size === 0 && _subscription) {
      if (_subscription.remove) {
        _subscription.remove();
      } else {
        // Fallback for older React Native versions
        (Dimensions as any).removeEventListener("change", _subscription);
      }
      _subscription = null;
    }
  };
}

// ============================================================================
// Hook for responsive font scaling
// ============================================================================

export const useResponsiveFont = (
  baseSize: number,
  minBound?: number,
  maxBound?: number,
) => {
  const [dimensions, setDimensions] = useState(() => _currentDimensions);

  useEffect(() => {
    const unsubscribe = subscribeToWindowDimensions(setDimensions);
    return unsubscribe;
  }, []);

  const roundedWidth = useMemo(
    () => Math.round(dimensions.width / 20) * 20,
    [dimensions.width],
  );

  return useMemo(() => {
    const scale = (roundedWidth / BASE_WIDTH) * PixelRatio.getFontScale();
    let scaledSize = Math.round(baseSize * scale * 100) / 100;

    const min = minBound ?? RESPONSIVE_FONT_MIN;
    const max = maxBound ?? RESPONSIVE_FONT_MAX;
    scaledSize = Math.max(scaledSize, min);
    scaledSize = Math.min(scaledSize, max);

    return scaledSize;
  }, [baseSize, roundedWidth, minBound, maxBound]);
};

// ============================================================================
// Hook for script detection
// ============================================================================
// Sorted script config entries (by Unicode range span, largest first) are
// computed once at module load time so the hot-path loop exits as early as
// possible for the most common scripts.

const SORTED_SCRIPT_ENTRIES = Object.entries(SCRIPT_CONFIGS).sort(
  ([, a], [, b]) => {
    // Sum the span of all Unicode ranges for each script
    const span = (ranges: [number, number][]) =>
      ranges.reduce((s, [lo, hi]) => s + (hi - lo + 1), 0);
    return span(b.unicodeRanges) - span(a.unicodeRanges);
  },
);

export const useScriptDetection = (text: string): ScriptCode => {
  return useMemo(() => {
    if (!text || text.length === 0) return "Unknown";

    const codePoint = text.codePointAt(0);
    if (!codePoint) return "Unknown";

    // Iterate sorted entries — exits on first match (early-exit optimisation)
    for (const [scriptCode, config] of SORTED_SCRIPT_ENTRIES) {
      if (
        config.unicodeRanges.some(
          ([start, end]) => codePoint >= start && codePoint <= end,
        )
      ) {
        return scriptCode as ScriptCode;
      }
    }
    return "Unknown";
  }, [text]);
};

// ============================================================================
// Hook for theme-aware styles
// ============================================================================

export const useThemedStyles = (
  theme: AppTextTheme,
  colorScheme: "light" | "dark" | null | undefined,
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

// ============================================================================
// Hook for device locale auto-detection
// ============================================================================
// Note: This value is computed once per hook mount. It does not automatically
// update if the user changes system language while the app is in background.
// For full reactive localization support, consider react-native-localize.

export const useDeviceLocale = (): string => {
  return useMemo(() => {
    try {
      const locale =
        Platform.OS === "ios"
          ? NativeModules.SettingsManager.settings.AppleLocale ||
            NativeModules.SettingsManager.settings.AppleLanguages[0]
          : NativeModules.I18nManager.localeIdentifier;

      return locale ? locale.replace("_", "-") : "en";
    } catch (e) {
      return "en";
    }
  }, []);
};

// ============================================================================
// Dynamic Type category hook (iOS-first, Android-friendly fallback)
// ============================================================================

export type DynamicTypeCategory =
  | "xSmall"
  | "small"
  | "medium"
  | "large"
  | "xLarge"
  | "xxLarge"
  | "xxxLarge"
  | "accessibilityMedium"
  | "accessibilityLarge"
  | "accessibilityXLarge"
  | "accessibilityXXLarge"
  | "accessibilityXXXLarge";

/**
 * Returns the current Dynamic Type semantic category based on `PixelRatio.getFontScale()`.
 *
 * iOS maps its DynamicType size steps to font scale multipliers. This hook
 * approximates those steps, giving you the named category so you can adjust
 * layout beyond just font size (e.g. single/multi-column).
 *
 * ```tsx
 * const category = useDynamicTypeCategory();
 * const isLarge = category.startsWith('accessibility');
 * ```
 */
export const useDynamicTypeCategory = (): DynamicTypeCategory => {
  const [scale, setScale] = useState(() => PixelRatio.getFontScale());

  useEffect(() => {
    // AccessibilityInfo fires when the user changes text size in Settings
    const sub = AccessibilityInfo.addEventListener("boldTextChanged", () => {
      setScale(PixelRatio.getFontScale());
    });
    return () => sub?.remove?.();
  }, []);

  return useMemo((): DynamicTypeCategory => {
    if (scale <= 0.82) return "xSmall";
    if (scale <= 0.88) return "small";
    if (scale <= 0.95) return "medium";
    if (scale <= 1.00) return "large";        // default
    if (scale <= 1.12) return "xLarge";
    if (scale <= 1.24) return "xxLarge";
    if (scale <= 1.35) return "xxxLarge";
    if (scale <= 1.53) return "accessibilityMedium";
    if (scale <= 1.76) return "accessibilityLarge";
    if (scale <= 2.00) return "accessibilityXLarge";
    if (scale <= 2.35) return "accessibilityXXLarge";
    return "accessibilityXXXLarge";
  }, [scale]);
};

/**
 * Returns a font size scaled by the current Dynamic Type multiplier.
 * Equivalent to CSS `clamp(min, base * fontScale, max)`.
 *
 * ```tsx
 * const headingSize = useDynamicTypeFontSize(32, { min: 24, max: 52 });
 * ```
 */
export const useDynamicTypeFontSize = (
  baseSize: number,
  opts?: { min?: number; max?: number },
): number => {
  const [scale, setScale] = useState(() => PixelRatio.getFontScale());

  useEffect(() => {
    const sub = AccessibilityInfo.addEventListener("boldTextChanged", () => {
      setScale(PixelRatio.getFontScale());
    });
    return () => sub?.remove?.();
  }, []);

  return useMemo(() => {
    const scaled = Math.round(baseSize * scale * 100) / 100;
    const clamped = Math.min(
      Math.max(scaled, opts?.min ?? baseSize * 0.6),
      opts?.max ?? baseSize * 2.5,
    );
    return clamped;
  }, [baseSize, scale, opts?.min, opts?.max]);
};

// ============================================================================
// Text-to-speech — zero external dependencies
// ============================================================================

/**
 * Wrapper around `AccessibilityInfo.announceForAccessibility`.
 * Works on both iOS and Android without any external package.
 *
 * On iOS the system voice (VoiceOver) reads the text;
 * on Android TalkBack handles it. No TTS engine is launched independently.
 *
 * Returns a `speak(text)` callback safe to call conditionally.
 */
export const useSpeech = () => {
  const speak = useCallback((text: string) => {
    if (!text) return;
    try {
      AccessibilityInfo.announceForAccessibility(text);
    } catch (e) {
      if (__DEV__) console.warn("[useSpeech] announceForAccessibility failed:", e);
    }
  }, []);

  return { speak };
};

/**
 * Standalone `speak()` utility (non-hook, can be used outside components).
 *
 * ```ts
 * import { speak } from 'react-native-apptext';
 * speak('Hello world');
 * ```
 */
export const speak = (text: string): void => {
  try {
    AccessibilityInfo.announceForAccessibility(text);
  } catch (e) {
    if (__DEV__) console.warn("[speak] announceForAccessibility failed:", e);
  }
};
