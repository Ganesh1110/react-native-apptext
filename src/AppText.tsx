import React, {
  forwardRef,
  memo,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Text,
  Animated,
  useColorScheme,
  View,
  NativeSyntheticEvent,
  TextLayoutEventData,
  AccessibilityRole,
  GestureResponderEvent,
  StyleSheet,
} from "react-native";

import {
  AppTextProps,
  AppTextTheme,
  TypographyVariant,
  TextStyle,
  StyleProp,
} from "./types";
import { SCRIPT_CONFIGS } from "./scriptConfigs";
import { DEFAULT_THEME } from "./theme";
import {
  useResponsiveFont,
  useScriptDetection,
  useThemedStyles,
} from "./hooks";
import { AppTextProvider, useAppTextTheme } from "./context";
import { createSpacingStyles } from "./utils";
import TransComponent from "./Trans";
import { ANIMATION_REGISTRY, AnimationValues } from "./animations";

const PRESET_ANIMATION_DURATIONS: Record<string, number> = {
  rubberBand: 1000,
  tada: 1000,
  swing: 2000,
  wobble: 2000,
  pulse: 1500,
  bounce: 1000,
  shake: 500,
};

/* ========== Animation Hook ========== */
type AnimationConfig = {
  type?:
    | "fade"
    | "fadeIn"
    | "slideInRight"
    | "slideInLeft"
    | "slideInUp"
    | "slideInDown"
    | "bounceIn"
    | "zoomIn"
    | "flipInX"
    | "flipInY"
    | "rotateIn"
    | "pulse"
    | "bounce"
    | "shake"
    | "swing"
    | "wobble"
    | "rubberBand"
    | "tada"
    | "fadeOut"
    | "slideOutRight"
    | "slideOutLeft"
    | "slideOutUp"
    | "slideOutDown"
    | "bounceOut"
    | "zoomOut"
    | "flipOutX"
    | "flipOutY"
    | "rotateOut"
    | "blink"
    | "glow"
    | "neon"
    | "gradientShift"
    | "wave"
    | "typewriter"
    | "none";
  duration?: number;
  delay?: number;
  speed?: number;
};

const useTextAnimation = (
  animated: boolean,
  animation: AnimationConfig | boolean | undefined,
  animationDelay: number = 0,
  animationDuration: number = 1000,
  animationSpeed: number = 50,
  cursor: boolean = false,
) => {
  const opacityValue = useRef(new Animated.Value(0)).current;
  const translateYValue = useRef(new Animated.Value(50)).current;
  const translateXValue = useRef(new Animated.Value(100)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  const shakeValue = useRef(new Animated.Value(0)).current;
  const glowValue = useRef(new Animated.Value(0)).current;
  const neonValue = useRef(new Animated.Value(0)).current;
  const gradientValue = useRef(new Animated.Value(0)).current;
  const currentAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const hasAnimated = useRef(false);
  const prevAnimationType = useRef<string | null>(null);

  // Derived type - used for branching in the parent component
  const animationType = useMemo(() => {
    if (!animation) return "fade";
    if (typeof animation === "string") return animation;
    if (typeof animation === "object") return animation.type || "fade";
    return "fade";
  }, [animation]);

  const isSpecialAnimation =
    animationType === "typewriter" || animationType === "wave";

  const effectiveDuration =
    PRESET_ANIMATION_DURATIONS[animationType] ?? animationDuration;

  useEffect(() => {
    // Return early if not enabled, or if it's a special animation handled by separate components
    if (!animated || !animation || isSpecialAnimation) return;
    // Skip if the same animation type has already played (but allow re-triggering on type change)
    if (hasAnimated.current && prevAnimationType.current === animationType) return;
    prevAnimationType.current = animationType;
    hasAnimated.current = true;

    const config = typeof animation === "object" ? animation : {};
    const type = animationType;
    const duration = config.duration || animationDuration;
    const delay = config.delay || animationDelay;

    // Stop previous animation safely
    if (currentAnimation.current) {
      currentAnimation.current.stop();
    }

    // Reset values only if they are likely used by this animation type
    // to minimize bridge traffic and potential "frozen object" issues
    opacityValue.setValue(0);
    if (type.includes("slide")) {
      translateYValue.setValue(type.includes("Down") ? -50 : 50);
      translateXValue.setValue(type.includes("Left") ? -100 : 100);
    } else {
      translateYValue.setValue(0);
      translateXValue.setValue(0);
    }

    if (type.includes("zoom") || type === "bounceIn") {
      scaleValue.setValue(0.8);
    } else {
      scaleValue.setValue(1);
    }

    if (type.includes("flip") || type.includes("rotate")) {
      rotateValue.setValue(0);
    }

    const values: AnimationValues = {
      opacity: opacityValue,
      translateY: translateYValue,
      translateX: translateXValue,
      scale: scaleValue,
      rotate: rotateValue,
      shake: shakeValue,
      glow: glowValue,
      neon: neonValue,
      gradient: gradientValue,
    };

    const generator = ANIMATION_REGISTRY[type] || ANIMATION_REGISTRY.fade;
    const animationPromise: Animated.CompositeAnimation = generator(values, {
      duration,
      delay,
      effectiveDuration,
    });

    if (animationPromise) {
      currentAnimation.current = animationPromise;
      hasAnimated.current = true;
      animationPromise.start();
    }

    return () => {
      if (currentAnimation.current) {
        currentAnimation.current.stop();
      }
    };
  }, [
    animated,
    animation,
    animationDelay,
    animationDuration,
    animationType,
    opacityValue,
    translateYValue,
    translateXValue,
    scaleValue,
    rotateValue,
    shakeValue,
    glowValue,
    neonValue,
    gradientValue,
    effectiveDuration,
  ]);

  // Compute the animated style (as a value, not a callback)
  // IMPORTANT: Must list all Animated.Values that are referenced inside.
  const animatedStyle = useMemo(() => {
    // Return empty if not animated/animation context, or if special animation handled by standard components
    if (!animated || !animation || isSpecialAnimation) return {};

    const type = animationType;

    switch (type) {
      // === ENTRANCE ANIMATIONS ===
      case "fade":
      case "fadeIn":
        return { opacity: opacityValue };

      case "slideInRight":
        return {
          opacity: opacityValue,
          transform: [{ translateX: translateXValue }],
        };

      case "slideInLeft":
        return {
          opacity: opacityValue,
          transform: [{ translateX: translateXValue }],
        };

      case "slideInUp":
        return {
          opacity: opacityValue,
          transform: [{ translateY: translateYValue }],
        };

      case "slideInDown":
        return {
          opacity: opacityValue,
          transform: [{ translateY: translateYValue }],
        };

      case "bounceIn":
      case "zoomIn":
        return {
          opacity: opacityValue,
          transform: [{ scale: scaleValue }],
        };

      case "flipInX":
        return {
          opacity: opacityValue,
          transform: [
            { perspective: 1000 },
            {
              rotateX: rotateValue.interpolate({
                inputRange: [-90, 0],
                outputRange: ["-90deg", "0deg"],
              }),
            },
          ],
        };

      case "flipInY":
        return {
          opacity: opacityValue,
          transform: [
            { perspective: 1000 },
            {
              rotateY: rotateValue.interpolate({
                inputRange: [-90, 0],
                outputRange: ["-90deg", "0deg"],
              }),
            },
          ],
        };

      case "rotateIn":
        return {
          opacity: opacityValue,
          transform: [
            {
              rotate: rotateValue.interpolate({
                inputRange: [-180, 0],
                outputRange: ["-180deg", "0deg"],
              }),
            },
          ],
        };

      // === ATTENTION ANIMATIONS ===
      case "pulse":
      case "rubberBand":
      case "tada":
        return { transform: [{ scale: scaleValue }] };

      case "bounce":
        return { transform: [{ translateY: translateYValue }] };

      case "shake":
        return { transform: [{ translateX: shakeValue }] };

      case "swing":
        return {
          transform: [
            {
              rotate: rotateValue.interpolate({
                inputRange: [-10, 15],
                outputRange: ["-10deg", "15deg"],
                extrapolate: "clamp",
              }),
            },
          ],
        };

      case "wobble":
        return {
          transform: [
            {
              rotate: rotateValue.interpolate({
                inputRange: [-5, 5],
                outputRange: ["-5deg", "5deg"],
                extrapolate: "clamp",
              }),
            },
          ],
        };

      // === EXIT ANIMATIONS ===
      case "fadeOut":
        return { opacity: opacityValue };

      case "slideOutRight":
      case "slideOutLeft":
        return {
          opacity: opacityValue,
          transform: [{ translateX: translateXValue }],
        };

      case "slideOutUp":
      case "slideOutDown":
        return {
          opacity: opacityValue,
          transform: [{ translateY: translateYValue }],
        };

      case "bounceOut":
      case "zoomOut":
        return {
          opacity: opacityValue,
          transform: [{ scale: scaleValue }],
        };

      case "flipOutX":
        return {
          opacity: opacityValue,
          transform: [
            { perspective: 1000 },
            {
              rotateX: rotateValue.interpolate({
                inputRange: [0, 90],
                outputRange: ["0deg", "90deg"],
              }),
            },
          ],
        };

      case "flipOutY":
        return {
          opacity: opacityValue,
          transform: [
            { perspective: 1000 },
            {
              rotateY: rotateValue.interpolate({
                inputRange: [0, 90],
                outputRange: ["0deg", "90deg"],
              }),
            },
          ],
        };

      case "rotateOut":
        return {
          opacity: opacityValue,
          transform: [
            {
              rotate: rotateValue.interpolate({
                inputRange: [0, 180],
                outputRange: ["0deg", "180deg"],
              }),
            },
          ],
        };

      // === SPECIAL EFFECTS ===
      case "blink":
        return { opacity: opacityValue };

      case "glow":
        return {
          textShadowColor: glowValue.interpolate({
            inputRange: [0, 1],
            outputRange: ["rgba(0,0,0,0)", "rgba(255,255,255,0.8)"],
          }),
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: glowValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 10],
          }),
        };

      case "neon":
        return {
          textShadowColor: neonValue.interpolate({
            inputRange: [0, 1],
            outputRange: ["rgba(0, 255, 255, 0.5)", "rgba(0, 255, 255, 1)"],
          }),
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: neonValue.interpolate({
            inputRange: [0, 1],
            outputRange: [5, 20],
          }),
        };

      case "gradientShift":
        return {
          color: gradientValue.interpolate({
            inputRange: [0, 0.25, 0.5, 0.75, 1],
            outputRange: [
              "rgb(255, 0, 0)", // Red
              "rgb(0, 255, 0)", // Green
              "rgb(0, 0, 255)", // Blue
              "rgb(255, 0, 255)", // Magenta
              "rgb(255, 0, 0)", // Red
            ],
          }),
        };

      default:
        return { opacity: opacityValue };
    }
  }, [
    animated,
    animation,
    animationType,
    isSpecialAnimation,
    opacityValue,
    translateYValue,
    translateXValue,
    scaleValue,
    rotateValue,
    shakeValue,
    glowValue,
    neonValue,
    gradientValue,
  ]);

  return {
    animatedStyle,
    animationType,
  };
};

/* ========== Typewriter Component ========== */
interface TypewriterTextProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  speed?: number;
  cursor?: boolean;
  style: StyleProp<TextStyle>;
}

const TypewriterText = memo<TypewriterTextProps>(
  ({
    children,
    delay = 0,
    duration = 2000,
    speed = 50,
    cursor = false,
    style,
  }) => {
    const [displayText, setDisplayText] = useState("");
    const [isDone, setIsDone] = useState(false);

    const text = useMemo(() => {
      const extractText = (node: React.ReactNode): string => {
        if (typeof node === "string" || typeof node === "number") {
          return String(node);
        }
        if (React.isValidElement(node)) {
          return extractText(node.props.children);
        }
        if (Array.isArray(node)) {
          return node.map(extractText).join("");
        }
        return "";
      };
      return extractText(children);
    }, [children]);

    useEffect(() => {
      let isMounted = true;
      // Reset state whenever text, speed, or delay changes
      setDisplayText("");
      setIsDone(false);

      let startTimer: ReturnType<typeof setTimeout>;
      let characterTimer: ReturnType<typeof setTimeout>;
      let index = 0;

      // Single recursive chain: no dependency on component state,
      // so there is only ever ONE timer active at a time.
      const typeNextChar = () => {
        if (!isMounted) return;
        if (index > text.length) {
          setIsDone(true);
          return;
        }
        setDisplayText(text.substring(0, index));
        index++;
        characterTimer = setTimeout(typeNextChar, speed);
      };

      // Honour the initial delay before typing begins
      startTimer = setTimeout(typeNextChar, delay);

      return () => {
        isMounted = false;
        clearTimeout(startTimer);
        clearTimeout(characterTimer);
      };
    }, [text, speed, delay]);

    const cursorColor = useMemo(() => {
      if (!style) return undefined;
      if (Array.isArray(style)) {
        for (const s of style) {
          if (s && typeof s === "object" && "color" in s) {
            return s.color;
          }
        }
      } else if (style && typeof style === "object" && "color" in style) {
        return style.color;
      }
      return undefined;
    }, [style]);

    return (
      <Text
        style={style}
        accessibilityLiveRegion="polite"
        accessibilityState={{ busy: !isDone }}
      >
        {displayText}
        {cursor && !isDone && <Text style={{ color: cursorColor }}>|</Text>}
      </Text>
    );
  },
);

/* ========== Truncation Component ========== */
interface TruncationProps {
  children: React.ReactNode;
  maxLines: number;
  onExpand?: () => void;
  onCollapse?: () => void;
  expandText?: string;
  collapseText?: string;
  style?: StyleProp<TextStyle>; // Issue #15: was `any`
}

const TruncationComponent = memo<TruncationProps>(
  ({
    children,
    maxLines,
    onExpand,
    onCollapse,
    expandText = "Read more",
    collapseText = "Read less",
    style,
  }) => {
    const [isExpanded, setIsExpanded] = useState(false); // Issue #11: use imported useState
    const [isTruncated, setIsTruncated] = useState(false);
    const theme = useAppTextTheme();
    // Issue #19: track mounted state to skip callback on first render
    const isFirstRender = useRef(true);

    const handleTextLayout = useCallback(
      (event: NativeSyntheticEvent<TextLayoutEventData>) => {
        setIsTruncated(event.nativeEvent.lines.length > maxLines);
      },
      [maxLines],
    );

    // Issue #19: Side effects moved OUT of setState updater
    const handleToggle = useCallback(() => {
      setIsExpanded((prev) => !prev);
    }, []);

    // Issue #19: Fire callbacks after state settles, skip initial mount
    useEffect(() => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }
      if (isExpanded) {
        onExpand?.();
      } else {
        onCollapse?.();
      }
    }, [isExpanded, onExpand, onCollapse]);

    // Derive base font size for the "Read more" button from the style object
    const baseFontSize = useMemo(() => {
      const flat = Array.isArray(style) ? style[0] : style;
      return (flat as any)?.fontSize ?? 14;
    }, [style]);

    return (
      // Issue #5 & #16: overflow:hidden ensures ghost text is measured within container bounds
      <View style={{ overflow: "hidden" }}>
        {/* Hidden ghost text — measures untruncated line count */}
        {!isExpanded && (
          <Text
            style={[style, { position: "absolute", opacity: 0, zIndex: -1 }]}
            onTextLayout={handleTextLayout}
            pointerEvents="none"
            aria-hidden={true}
          >
            {children}
          </Text>
        )}

        <Text
          style={style}
          numberOfLines={isExpanded ? undefined : maxLines}
          ellipsizeMode="tail"
        >
          {children}
        </Text>

        {/* Issue #12: "Read more" button uses isolated styles — does not inherit harmful text styling */}
        {isTruncated && (
          <Text
            style={{
              fontSize: baseFontSize,
              color: theme.colors.primary,
              marginTop: 4,
              fontWeight: "600",
              textTransform: "none",
              textDecorationLine: "none",
              fontStyle: "normal",
            }}
            onPress={handleToggle}
          >
            {isExpanded ? collapseText : expandText}
          </Text>
        )}
      </View>
    );
  },
);

/* ========== Wave Component ========== */
interface WaveTextProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style: StyleProp<TextStyle>;
}

const extractTextStyles = (style: StyleProp<TextStyle>) => {
  const flatStyle = StyleSheet.flatten(style) || {};
  const textStyles: any = {};
  const viewStyles: any = {};

  const textProps = [
    "color", "fontFamily", "fontSize", "fontStyle", "fontWeight",
    "letterSpacing", "lineHeight", "textAlign", "textDecorationLine",
    "textDecorationStyle", "textDecorationColor", "textShadowColor",
    "textShadowOffset", "textShadowRadius", "textTransform", "opacity",
  ];

  Object.keys(flatStyle).forEach((key) => {
    if (textProps.includes(key)) {
      textStyles[key] = (flatStyle as any)[key];
    } else {
      viewStyles[key] = (flatStyle as any)[key];
    }
  });

  return { textStyles, viewStyles };
};

const WaveText = memo<WaveTextProps>(
  ({ children, duration = 1000, delay = 0, style }) => {
    const text = useMemo(() => {
      const extractText = (node: React.ReactNode): string => {
        if (typeof node === "string" || typeof node === "number") {
          return String(node);
        }
        if (React.isValidElement(node)) {
          return extractText(node.props.children);
        }
        if (Array.isArray(node)) {
          return node.map(extractText).join("");
        }
        return "";
      };
      return extractText(children);
    }, [children]);

    const characters = useMemo(() => text.split(""), [text]);

    // Track mounted state
    const isMountedRef = useRef(true);
    const animationsRef = useRef<Animated.CompositeAnimation[]>([]);

    // Create animated values - these persist but get replaced when text changes
    const animatedValuesRef = useRef<Animated.Value[]>([]);
    const prevTextRef = useRef<string>(text);

    // Initialize synchronously so useMemo can read correct values on the same render
    if (prevTextRef.current !== text || animatedValuesRef.current.length !== characters.length) {
      prevTextRef.current = text;
      animatedValuesRef.current = characters.map(() => new Animated.Value(0));
    }

    useEffect(() => {
      // Create animations for each character
      const animations = animatedValuesRef.current.map((value, i) => {
        const charLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(value, {
              toValue: 1,
              duration: duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(value, {
              toValue: 0,
              duration: duration / 2,
              useNativeDriver: true,
            }),
          ]),
        );

        // One-time staggered start
        return Animated.sequence([
          Animated.delay(i * (duration / characters.length || 50) + delay),
          charLoop,
        ]);
      });

      animationsRef.current = animations;

      // Start all sequences in parallel - each will wait for its delay before looping
      const masterAnimation = Animated.parallel(animations, {
        stopTogether: false,
      });
      masterAnimation.start();

      return () => {
        isMountedRef.current = false;
        masterAnimation.stop();
        animationsRef.current.forEach((anim) => {
          try {
            anim.stop();
          } catch {
            // Animation may already be stopped or in invalid state
          }
        });
        animationsRef.current = [];
      };
    }, [text, duration, delay, characters.length]);

    const interpolatedStyles = useMemo(() => {
      return animatedValuesRef.current.map((value) => ({
        transform: [
          {
            translateY: value.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -20],
            }),
          },
        ],
      }));
    }, [characters.length]);

    const { textStyles, viewStyles } = useMemo(() => extractTextStyles(style), [style]);

    return (
      <View
        style={[
          viewStyles,
          {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent:
              textStyles.textAlign === "center"
                ? "center"
                : textStyles.textAlign === "right"
                  ? "flex-end"
                  : "flex-start",
          },
        ]}
      >
        {characters.map((char, i) => (
          <Animated.View key={`wave-${i}`} style={interpolatedStyles[i]}>
            <Text style={textStyles}>
              {char === " " ? "\u00A0" : char}
            </Text>
          </Animated.View>
        ))}
      </View>
    );
  },
);

/* ========== Main Component ========== */
const BaseAppText = memo(
  forwardRef<Text, AppTextProps>(
    (
      {
        children,
        variant = "body1",
        color,
        size,
        weight,
        align,
        transform,
        decoration,
        italic = false,
        truncate = false,
        shadow = false,
        animated = false,
        animation,
        animationDelay = 0,
        animationDuration = 1000,
        animationSpeed = 50,
        cursor = false,
        script,
        direction = "auto",
        responsive = true,
        style: propStyle,
        testID,
        m,
        mt,
        mr,
        mb,
        ml,
        mx,
        my,
        p,
        pt,
        pr,
        pb,
        pl,
        px,
        py,
        numberOfLines,
        ellipsizeMode,
        onPress,
        onLongPress,
        onExpand,
        onCollapse,
        expandText,
        collapseText,
        allowFontScaling,
        maxFontSizeMultiplier,
        minimumFontScale,
        suppressHighlighting,
        selectable,
        selectionColor,
        textBreakStrategy,
        hyphenationFrequency,
        accessibilityLabel,
        accessibilityHint,
        accessibilityLiveRegion,
        accessibilityState,
        // Destructure common RN props to stabilize restProps (Issue #9)
        accessibilityActions,
        onAccessibilityAction,
        accessibilityValue,
        importantForAccessibility,
        nativeID,
        onLayout,
        ...passThroughProps
      },
      ref,
    ) => {
      const theme = useAppTextTheme();
      const rawScheme = useColorScheme();
      const colorScheme = rawScheme === "unspecified" ? "light" : rawScheme;
      const themedStyles = useThemedStyles(theme, colorScheme);

      // Animation decision (Issue #8: Moved hook call to sub-component)
      const shouldAnimate = !!(animated || (animation && (animation as any) !== "none"));
      const getAnimationType = () => {
        if (!animation || (animation as any) === "none") return undefined;
        if (typeof animation === "string") return animation;
        if (typeof animation === "object") return animation.type;
        return undefined;
      };
      const animationType = getAnimationType();
      const isTypewriter = shouldAnimate && animationType === "typewriter";
      const isWave = shouldAnimate && animationType === "wave";

      const textContent = useMemo(() => {
        const extractText = (node: React.ReactNode): string => {
          if (typeof node === "string" || typeof node === "number") return String(node);
          if (React.isValidElement(node)) return extractText(node.props.children);
          if (Array.isArray(node)) return node.map(extractText).join("");
          return "";
        };
        return extractText(children);
      }, [children]);

      const detectedScript = useScriptDetection(textContent);
      const finalScript = script || detectedScript;
      const scriptConfig =
        SCRIPT_CONFIGS[finalScript] || SCRIPT_CONFIGS.Unknown;

      const typographyStyle =
        theme.typography[variant] || theme.typography.body1;
      const baseFontSize =
        size === "auto"
          ? typographyStyle.fontSize
          : size || typographyStyle.fontSize;
      const responsiveFontSize = useResponsiveFont(
        baseFontSize,
        responsive ? 10 : undefined,
        responsive ? 48 : undefined,
      );

      const calculatedLineHeight = useMemo(() => {
        const baseLineHeight = typographyStyle.lineHeight || baseFontSize * 1.2;
        return baseLineHeight * scriptConfig.lineHeightMultiplier;
      }, [
        typographyStyle.lineHeight,
        baseFontSize,
        scriptConfig.lineHeightMultiplier,
      ]);

      const resolvedColor = useMemo(() => {
        if (!color) return themedStyles.defaultTextColor;
        if (color in theme.colors) {
          return theme.colors[color as keyof typeof theme.colors];
        }
        return color;
      }, [color, theme.colors, themedStyles.defaultTextColor]);

      const textDirection = useMemo(() => {
        if (direction !== "auto") return direction;
        return scriptConfig.direction;
      }, [direction, scriptConfig.direction]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const computedStyle = useMemo(() => {
        const baseStyle: any = {
          ...typographyStyle,
          fontSize: responsive ? responsiveFontSize : baseFontSize,
          lineHeight: calculatedLineHeight,
          color: resolvedColor,
          fontWeight: weight || typographyStyle.fontWeight,
          textTransform: transform || typographyStyle.textTransform,
          textDecorationLine: decoration,
          fontStyle: italic ? "italic" : "normal",
          writingDirection: textDirection,
          textAlign: align || (textDirection === "rtl" ? "right" : "left"),
        };

        if (shadow) {
          Object.assign(baseStyle, {
            textShadowColor: "rgba(0,0,0,0.3)",
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
          });
        }
        return baseStyle;
      }, [
        typographyStyle,
        responsive,
        responsiveFontSize,
        baseFontSize,
        calculatedLineHeight,
        resolvedColor,
        align,
        weight,
        transform,
        decoration,
        italic,
        textDirection,
        shadow,
      ]);

      const spacingStyles = useMemo(
        () =>
          createSpacingStyles({
            m,
            mt,
            mr,
            mb,
            ml,
            mx,
            my,
            p,
            pt,
            pr,
            pb,
            pl,
            px,
            py,
          }),
        [m, mt, mr, mb, ml, mx, my, p, pt, pr, pb, pl, px, py],
      );

      const finalComputedStyle = useMemo(
        () => ({ ...computedStyle, ...spacingStyles, ...(propStyle as object) }),
        [computedStyle, spacingStyles, propStyle],
      );

      const textProps = useMemo(() => {
        const props = {
          ...passThroughProps,
          numberOfLines:
            typeof truncate === "number"
              ? truncate
              : truncate === true
                ? 1
                : numberOfLines,
          ellipsizeMode: truncate ? ellipsizeMode || "tail" : ellipsizeMode,
          allowFontScaling: allowFontScaling !== false,
          maxFontSizeMultiplier: maxFontSizeMultiplier || 3,
          minimumFontScale,
          suppressHighlighting,
          selectable,
          selectionColor,
          textBreakStrategy,
          hyphenationFrequency,
          testID: testID || `apptext-${variant}`,
          accessibilityLabel,
          accessibilityHint,
          accessibilityLiveRegion,
          accessibilityState,
          accessibilityActions,
          onAccessibilityAction,
          accessibilityValue,
          importantForAccessibility,
          nativeID,
          onLayout,
        };

        return {
          ...props,
          accessibilityRole: (onPress ? "button" : "text") as AccessibilityRole,
        };
      }, [
        passThroughProps,
        truncate,
        numberOfLines,
        ellipsizeMode,
        allowFontScaling,
        maxFontSizeMultiplier,
        minimumFontScale,
        suppressHighlighting,
        selectable,
        selectionColor,
        textBreakStrategy,
        hyphenationFrequency,
        testID,
        variant,
        accessibilityLabel,
        accessibilityHint,
        accessibilityLiveRegion,
        accessibilityState,
        accessibilityActions,
        onAccessibilityAction,
        accessibilityValue,
        importantForAccessibility,
        nativeID,
        onLayout,
        onPress,
      ]);

      const handlePress = useCallback(
        (e: GestureResponderEvent) => onPress?.(e),
        [onPress],
      );
      const handleLongPress = useCallback(
        (e: GestureResponderEvent) => onLongPress?.(e),
        [onLongPress],
      );

      const hasPressHandlers = !!onPress || !!onLongPress;
      const animationConfig = typeof animation === "object" ? animation : {};
      const finalDelay = animationConfig.delay ?? animationDelay;
      const finalDuration = animationConfig.duration ?? animationDuration;
      const finalSpeed = animationConfig.speed ?? animationSpeed;

      // Special animation handling
      if (isTypewriter) {
        return (
          <TypewriterText
            delay={finalDelay}
            duration={finalDuration}
            speed={finalSpeed}
            cursor={cursor}
            style={finalComputedStyle}
          >
            {children}
          </TypewriterText>
        );
      }

      if (isWave) {
        return (
          <WaveText
            delay={finalDelay}
            duration={finalDuration}
            style={finalComputedStyle}
          >
            {children}
          </WaveText>
        );
      }

      if (shouldAnimate) {
        return (
          <StandardAnimatedText
            ref={ref}
            animated={animated}
            animation={animation}
            animationDelay={animationDelay}
            animationDuration={animationDuration}
            animationSpeed={animationSpeed}
            cursor={cursor}
            style={finalComputedStyle}
            textProps={textProps}
            onPress={handlePress}
            onLongPress={handleLongPress}
            hasPressHandlers={hasPressHandlers}
          >
            {children}
          </StandardAnimatedText>
        );
      }

      const hasExpandCollapse =
        !!(expandText || collapseText || onExpand || onCollapse);

      if ((truncate || numberOfLines) && hasExpandCollapse) {
        return (
          <TruncationComponent
            maxLines={
              typeof truncate === "number" ? truncate : numberOfLines || 1
            }
            onExpand={onExpand}
            onCollapse={onCollapse}
            expandText={expandText}
            collapseText={collapseText}
            style={finalComputedStyle}
          >
            {children}
          </TruncationComponent>
        );
      }

      return (
        <Text
          ref={ref}
          style={finalComputedStyle}
          {...(!hasPressHandlers
            ? {}
            : { onPress: handlePress, onLongPress: handleLongPress })}
          {...textProps}
        >
          {children}
        </Text>
      );
    },
  ),
);

/* ========== Animated Standard Text Component ========== */
const StandardAnimatedText = memo(
  forwardRef<
    Text,
    {
      children: React.ReactNode;
      animated: boolean;
      animation: any;
      animationDelay: number;
      animationDuration: number;
      animationSpeed: number;
      cursor: boolean;
      style: any;
      textProps: any;
      onPress?: any;
      onLongPress?: any;
      hasPressHandlers: boolean;
    }
  >(
    (
      {
        children,
        animated,
        animation,
        animationDelay,
        animationDuration,
        animationSpeed,
        cursor,
        style,
        textProps,
        onPress,
        onLongPress,
        hasPressHandlers,
      },
      ref,
    ) => {
      const { animatedStyle } = useTextAnimation(
        animated,
        animation,
        animationDelay,
        animationDuration,
        animationSpeed,
        cursor,
      );

      return (
        <Animated.Text
          ref={ref as any}
          style={[style, animatedStyle]}
          {...(!hasPressHandlers
            ? { pointerEvents: "none" }
            : { onPress, onLongPress })}
          {...textProps}
        >
          {children}
        </Animated.Text>
      );
    },
  ),
);

BaseAppText.displayName = "AppText";

/* ========== Compound Components ========== */
type VariantFC = React.FC<Omit<AppTextProps, "variant">>;
type AppTextCompound = typeof BaseAppText & {
  // Legacy variants
  H1: VariantFC;
  H2: VariantFC;
  H3: VariantFC;
  H4: VariantFC;
  H5: VariantFC;
  H6: VariantFC;
  Title: VariantFC;
  Subtitle: VariantFC;
  Body: VariantFC;
  Caption: VariantFC;
  Code: VariantFC;

  // Material Design 3 variants
  DisplayLarge: VariantFC;
  DisplayMedium: VariantFC;
  DisplaySmall: VariantFC;
  HeadlineLarge: VariantFC;
  HeadlineMedium: VariantFC;
  HeadlineSmall: VariantFC;
  TitleLarge: VariantFC;
  TitleMedium: VariantFC;
  TitleSmall: VariantFC;
  BodyLarge: VariantFC;
  BodyMedium: VariantFC;
  BodySmall: VariantFC;
  LabelLarge: VariantFC;
  LabelMedium: VariantFC;
  LabelSmall: VariantFC;

  // Trans component
  Trans: typeof TransComponent;
};

const AppText = BaseAppText as AppTextCompound;

// Legacy variants
AppText.H1 = memo(
  forwardRef<any, Omit<AppTextProps, "variant">>((props, ref) => (
    <BaseAppText {...props} variant="h1" ref={ref} />
  )),
);
AppText.H2 = memo(
  forwardRef<any, Omit<AppTextProps, "variant">>((props, ref) => (
    <BaseAppText {...props} variant="h2" ref={ref} />
  )),
);
AppText.H3 = memo(
  forwardRef<any, Omit<AppTextProps, "variant">>((props, ref) => (
    <BaseAppText {...props} variant="h3" ref={ref} />
  )),
);
AppText.H4 = memo(
  forwardRef<any, Omit<AppTextProps, "variant">>((props, ref) => (
    <BaseAppText {...props} variant="h4" ref={ref} />
  )),
);
AppText.H5 = memo(
  forwardRef<any, Omit<AppTextProps, "variant">>((props, ref) => (
    <BaseAppText {...props} variant="h5" ref={ref} />
  )),
);
AppText.H6 = memo(
  forwardRef<any, Omit<AppTextProps, "variant">>((props, ref) => (
    <BaseAppText {...props} variant="h6" ref={ref} />
  )),
);
AppText.Title = memo(
  forwardRef<any, Omit<AppTextProps, "variant">>((props, ref) => (
    <BaseAppText {...props} variant="title" ref={ref} />
  )),
);
AppText.Subtitle = memo(
  forwardRef<any, Omit<AppTextProps, "variant">>((props, ref) => (
    <BaseAppText {...props} variant="subtitle1" ref={ref} />
  )),
);
AppText.Body = memo(
  forwardRef<any, Omit<AppTextProps, "variant">>((props, ref) => (
    <BaseAppText {...props} variant="body1" ref={ref} />
  )),
);
AppText.Caption = memo(
  forwardRef<any, Omit<AppTextProps, "variant">>((props, ref) => (
    <BaseAppText {...props} variant="caption" ref={ref} />
  )),
);
AppText.Code = memo(
  forwardRef<any, Omit<AppTextProps, "variant">>((props, ref) => (
    <BaseAppText {...props} variant="code" ref={ref} />
  )),
);

// Material Design 3 variants
AppText.DisplayLarge = memo(
  forwardRef<any, Omit<AppTextProps, "variant">>((props, ref) => (
    <BaseAppText {...props} variant="displayLarge" ref={ref} />
  )),
);
AppText.DisplayMedium = memo(
  forwardRef<any, Omit<AppTextProps, "variant">>((props, ref) => (
    <BaseAppText {...props} variant="displayMedium" ref={ref} />
  )),
);
AppText.DisplaySmall = memo(
  forwardRef<any, Omit<AppTextProps, "variant">>((props, ref) => (
    <BaseAppText {...props} variant="displaySmall" ref={ref} />
  )),
);
AppText.HeadlineLarge = memo(
  forwardRef<any, Omit<AppTextProps, "variant">>((props, ref) => (
    <BaseAppText {...props} variant="headlineLarge" ref={ref} />
  )),
);
AppText.HeadlineMedium = memo(
  forwardRef<any, Omit<AppTextProps, "variant">>((props, ref) => (
    <BaseAppText {...props} variant="headlineMedium" ref={ref} />
  )),
);
AppText.HeadlineSmall = memo(
  forwardRef<any, Omit<AppTextProps, "variant">>((props, ref) => (
    <BaseAppText {...props} variant="headlineSmall" ref={ref} />
  )),
);
AppText.TitleLarge = memo(
  forwardRef<any, Omit<AppTextProps, "variant">>((props, ref) => (
    <BaseAppText {...props} variant="titleLarge" ref={ref} />
  )),
);
AppText.TitleMedium = memo(
  forwardRef<any, Omit<AppTextProps, "variant">>((props, ref) => (
    <BaseAppText {...props} variant="titleMedium" ref={ref} />
  )),
);
AppText.TitleSmall = memo(
  forwardRef<any, Omit<AppTextProps, "variant">>((props, ref) => (
    <BaseAppText {...props} variant="titleSmall" ref={ref} />
  )),
);
AppText.BodyLarge = memo(
  forwardRef<any, Omit<AppTextProps, "variant">>((props, ref) => (
    <BaseAppText {...props} variant="bodyLarge" ref={ref} />
  )),
);
AppText.BodyMedium = memo(
  forwardRef<any, Omit<AppTextProps, "variant">>((props, ref) => (
    <BaseAppText {...props} variant="bodyMedium" ref={ref} />
  )),
);
AppText.BodySmall = memo(
  forwardRef<any, Omit<AppTextProps, "variant">>((props, ref) => (
    <BaseAppText {...props} variant="bodySmall" ref={ref} />
  )),
);
AppText.LabelLarge = memo(
  forwardRef<any, Omit<AppTextProps, "variant">>((props, ref) => (
    <BaseAppText {...props} variant="labelLarge" ref={ref} />
  )),
);
AppText.LabelMedium = memo(
  forwardRef<any, Omit<AppTextProps, "variant">>((props, ref) => (
    <BaseAppText {...props} variant="labelMedium" ref={ref} />
  )),
);
AppText.LabelSmall = memo(
  forwardRef<any, Omit<AppTextProps, "variant">>((props, ref) => (
    <BaseAppText {...props} variant="labelSmall" ref={ref} />
  )),
);

AppText.Trans = TransComponent;

export default AppText;
export {
  AppTextProvider,
  useAppTextTheme,
  useResponsiveFont,
  useScriptDetection,
  SCRIPT_CONFIGS,
  DEFAULT_THEME,
  TransComponent as Trans,
};
export type { AppTextProps, AppTextTheme, TypographyVariant };
