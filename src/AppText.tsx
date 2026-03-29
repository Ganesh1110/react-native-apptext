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
  TextStyle,
  AccessibilityInfo,
  TextProps,
} from "react-native";

import {
  AppTextProps,
  AppTextTheme,
  TypographyVariant,
  AnimationType,
  AnimationConfig,
} from "./types";

type AnimationStyle = TextStyle;

import { SCRIPT_CONFIGS } from "./scriptConfigs";
import { DEFAULT_THEME } from "./theme";
import {
  useResponsiveFont,
  useScriptDetection,
  useThemedStyles,
  useReducedMotion,
  useDynamicTypeScale,
} from "./hooks";
import { AppTextProvider, useAppTextTheme } from "./context";
import { createSpacingStyles } from "./utils";
import TransComponent from "./Trans";

/* ========== Animation Hook ========== */
import { AnimationProp, AnimationWithConfig } from "./types";

const isAnimationWithConfig = (
  anim: AnimationProp | undefined,
): anim is AnimationWithConfig => {
  return (
    typeof anim === "object" &&
    anim !== null &&
    "type" in anim &&
    typeof (anim as AnimationWithConfig).type === "string"
  );
};

const useTextAnimation = (
  animated: boolean,
  animation: AnimationProp | undefined,
  animationConfig?: AnimationConfig,
  animationDelay: number = 0,
  animationDuration: number = 1000,
  animationSpeed: number = 50,
  cursor: boolean = false,
) => {
  const reducedMotion = useReducedMotion();

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

  useEffect(() => {
    return () => {
      if (currentAnimation.current) {
        currentAnimation.current.stop();
      }
      opacityValue.setValue(0);
      translateYValue.setValue(50);
      translateXValue.setValue(100);
      scaleValue.setValue(0.8);
      rotateValue.setValue(0);
      shakeValue.setValue(0);
      glowValue.setValue(0);
      neonValue.setValue(0);
      gradientValue.setValue(0);
      hasAnimated.current = false;
    };
  }, [
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

  // Derived type - used for branching in the parent component
  const animationType = useMemo(() => {
    if (!animation || animation === true) return "fade";
    if (typeof animation === "string") return animation as AnimationType;
    return "fade";
  }, [animation]);

  const isSpecialAnimation =
    animationType === "typewriter" || animationType === "wave";

  useEffect(() => {
    // Return early if not enabled, or if it's a special animation handled by separate components
    // Also skip animation if user prefers reduced motion (accessibility)
    if (!animated || !animation || isSpecialAnimation || reducedMotion) return;
    if (hasAnimated.current) return;

    const config =
      animationConfig || (isAnimationWithConfig(animation) ? animation : {});
    const type = animationType;
    const duration = config?.duration || animationDuration;
    const delay = config?.delay || animationDelay;

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

    let animationPromise: Animated.CompositeAnimation | null = null;

    switch (type) {
      // === ENTRANCE ANIMATIONS ===
      case "fade":
      case "fadeIn":
        animationPromise = Animated.timing(opacityValue, {
          toValue: 1,
          duration,
          delay,
          useNativeDriver: true,
        });
        break;

      case "slideInRight":
        animationPromise = Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(translateXValue, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
          }),
        ]);
        break;

      case "slideInLeft":
        translateXValue.setValue(-100);
        animationPromise = Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(translateXValue, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
          }),
        ]);
        break;

      case "slideInUp":
        animationPromise = Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(translateYValue, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
          }),
        ]);
        break;

      case "slideInDown":
        translateYValue.setValue(-50);
        animationPromise = Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(translateYValue, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
          }),
        ]);
        break;

      case "bounceIn":
      case "zoomIn":
        animationPromise = Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.spring(scaleValue, {
            toValue: 1,
            friction: 4,
            delay,
            useNativeDriver: true,
          }),
        ]);
        break;

      case "flipInX":
        rotateValue.setValue(-90);
        opacityValue.setValue(0);
        animationPromise = Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(rotateValue, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
          }),
        ]);
        break;

      case "flipInY":
        rotateValue.setValue(-90);
        opacityValue.setValue(0);
        animationPromise = Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(rotateValue, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
          }),
        ]);
        break;

      case "rotateIn":
        rotateValue.setValue(-180);
        animationPromise = Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(rotateValue, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
          }),
        ]);
        break;

      // === ATTENTION ANIMATIONS ===
      case "pulse":
        animationPromise = Animated.loop(
          Animated.sequence([
            Animated.timing(scaleValue, {
              toValue: 1.1,
              duration: duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
              toValue: 1,
              duration: duration / 2,
              useNativeDriver: true,
            }),
          ]),
        );
        break;

      case "bounce":
        animationPromise = Animated.loop(
          Animated.sequence([
            Animated.timing(translateYValue, {
              toValue: -20,
              duration: duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(translateYValue, {
              toValue: 0,
              duration: duration / 2,
              useNativeDriver: true,
            }),
          ]),
        );
        break;

      case "shake":
        animationPromise = Animated.loop(
          Animated.sequence([
            Animated.timing(shakeValue, {
              toValue: 10,
              duration: duration / 4,
              useNativeDriver: true,
            }),
            Animated.timing(shakeValue, {
              toValue: -10,
              duration: duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(shakeValue, {
              toValue: 0,
              duration: duration / 4,
              useNativeDriver: true,
            }),
          ]),
        );
        break;

      case "rubberBand":
        animationPromise = Animated.loop(
          Animated.sequence([
            Animated.timing(scaleValue, {
              toValue: 1.25,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
              toValue: 0.75,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
              toValue: 1.15,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
              toValue: 0.95,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
              toValue: 1.05,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        );
        break;

      case "tada":
        animationPromise = Animated.loop(
          Animated.sequence([
            Animated.timing(scaleValue, {
              toValue: 0.9,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.parallel([
              Animated.timing(scaleValue, {
                toValue: 1.1,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(rotateValue, {
                toValue: -3,
                duration: 100,
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(rotateValue, {
              toValue: 3,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(rotateValue, {
              toValue: -3,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(rotateValue, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
          ]),
        );
        break;

      case "swing":
        animationPromise = Animated.loop(
          Animated.sequence([
            Animated.timing(rotateValue, {
              toValue: 15,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(rotateValue, {
              toValue: -10,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(rotateValue, {
              toValue: 5,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(rotateValue, {
              toValue: -5,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(rotateValue, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
        );
        break;

      case "wobble":
        animationPromise = Animated.loop(
          Animated.sequence([
            Animated.timing(rotateValue, {
              toValue: 5,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(rotateValue, {
              toValue: -5,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(rotateValue, {
              toValue: 3,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(rotateValue, {
              toValue: -3,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(rotateValue, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }),
          ]),
        );
        break;

      // === EXIT ANIMATIONS ===
      case "fadeOut":
        opacityValue.setValue(1);
        animationPromise = Animated.timing(opacityValue, {
          toValue: 0,
          duration,
          delay,
          useNativeDriver: true,
        });
        break;

      case "slideOutRight":
        opacityValue.setValue(1);
        translateXValue.setValue(0);
        animationPromise = Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(translateXValue, {
            toValue: 100,
            duration,
            delay,
            useNativeDriver: true,
          }),
        ]);
        break;

      case "slideOutLeft":
        opacityValue.setValue(1);
        translateXValue.setValue(0);
        animationPromise = Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(translateXValue, {
            toValue: -100,
            duration,
            delay,
            useNativeDriver: true,
          }),
        ]);
        break;

      case "slideOutUp":
        opacityValue.setValue(1);
        translateYValue.setValue(0);
        animationPromise = Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(translateYValue, {
            toValue: -50,
            duration,
            delay,
            useNativeDriver: true,
          }),
        ]);
        break;

      case "slideOutDown":
        opacityValue.setValue(1);
        translateYValue.setValue(0);
        animationPromise = Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(translateYValue, {
            toValue: 50,
            duration,
            delay,
            useNativeDriver: true,
          }),
        ]);
        break;

      case "bounceOut":
      case "zoomOut":
        opacityValue.setValue(1);
        scaleValue.setValue(1);
        animationPromise = Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 0.8,
            duration,
            delay,
            useNativeDriver: true,
          }),
        ]);
        break;

      case "flipOutX":
        opacityValue.setValue(1);
        rotateValue.setValue(0);
        animationPromise = Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(rotateValue, {
            toValue: 90,
            duration,
            delay,
            useNativeDriver: true,
          }),
        ]);
        break;

      case "flipOutY":
        opacityValue.setValue(1);
        rotateValue.setValue(0);
        animationPromise = Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(rotateValue, {
            toValue: 90,
            duration,
            delay,
            useNativeDriver: true,
          }),
        ]);
        break;

      case "rotateOut":
        opacityValue.setValue(1);
        rotateValue.setValue(0);
        animationPromise = Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(rotateValue, {
            toValue: 180,
            duration,
            delay,
            useNativeDriver: true,
          }),
        ]);
        break;

      // === SPECIAL EFFECTS ===
      case "blink":
        animationPromise = Animated.loop(
          Animated.sequence([
            Animated.timing(opacityValue, {
              toValue: 0,
              duration: duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(opacityValue, {
              toValue: 1,
              duration: duration / 2,
              useNativeDriver: true,
            }),
          ]),
        );
        break;

      case "glow":
        animationPromise = Animated.loop(
          Animated.sequence([
            Animated.timing(glowValue, {
              toValue: 1,
              duration: duration / 2,
              useNativeDriver: false,
            }),
            Animated.timing(glowValue, {
              toValue: 0,
              duration: duration / 2,
              useNativeDriver: false,
            }),
          ]),
        );
        break;

      case "neon":
        animationPromise = Animated.loop(
          Animated.sequence([
            Animated.timing(neonValue, {
              toValue: 1,
              duration: duration / 2,
              useNativeDriver: false,
            }),
            Animated.timing(neonValue, {
              toValue: 0.5,
              duration: duration / 2,
              useNativeDriver: false,
            }),
          ]),
        );
        break;

      case "gradientShift":
        animationPromise = Animated.loop(
          Animated.timing(gradientValue, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: false,
          }),
        );
        break;

      default:
        // Default to fade animation
        animationPromise = Animated.timing(opacityValue, {
          toValue: 1,
          duration,
          delay,
          useNativeDriver: true,
        });
    }

    if (animationPromise) {
      currentAnimation.current = animationPromise;
      hasAnimated.current = true;
      animationPromise.start();
    }

    return () => {
      if (currentAnimation.current) {
        currentAnimation.current.stop();
      }
      opacityValue.setValue(0);
      translateYValue.setValue(
        type.includes("slide") ? (type.includes("Down") ? -50 : 50) : 0,
      );
      translateXValue.setValue(
        type.includes("slide") ? (type.includes("Left") ? -100 : 100) : 0,
      );
      scaleValue.setValue(
        type.includes("zoom") || type === "bounceIn" ? 0.8 : 1,
      );
      rotateValue.setValue(0);
      hasAnimated.current = false;
    };
  }, [
    animated,
    animation,
    animationDelay,
    animationDuration,
    animationType,
    isSpecialAnimation,
    animationConfig,
    reducedMotion,
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

  const getAnimatedStyle = (): AnimationStyle => {
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
      case "wobble":
        return {
          transform: [
            {
              rotate: rotateValue.interpolate({
                inputRange: [-10, 10],
                outputRange: ["-10deg", "10deg"],
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
          }) as unknown as TextStyle["textShadowColor"],
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: glowValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 10],
          }) as unknown as TextStyle["textShadowRadius"],
        };

      case "neon":
        return {
          textShadowColor: neonValue.interpolate({
            inputRange: [0, 1],
            outputRange: ["rgba(0, 255, 255, 0.5)", "rgba(0, 255, 255, 1)"],
          }) as unknown as TextStyle["textShadowColor"],
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: neonValue.interpolate({
            inputRange: [0, 1],
            outputRange: [5, 20],
          }) as unknown as TextStyle["textShadowRadius"],
        };

      case "gradientShift":
        return {
          color: gradientValue.interpolate({
            inputRange: [0, 0.25, 0.5, 0.75, 1],
            outputRange: [
              "rgb(255, 0, 0)",
              "rgb(0, 255, 0)",
              "rgb(0, 0, 255)",
              "rgb(255, 0, 255)",
              "rgb(255, 0, 0)",
            ],
          }) as unknown as TextStyle["color"],
        };

      default:
        return { opacity: opacityValue };
    }
  };

  return {
    animatedStyle: getAnimatedStyle(),
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
  style: TextStyle;
  announceCompletion?: boolean;
}

const TypewriterText = memo<TypewriterTextProps>(
  ({
    children,
    delay = 0,
    duration = 2000,
    speed = 50,
    cursor = false,
    style,
    announceCompletion = true,
  }) => {
    const reducedMotion = useReducedMotion();
    const [displayText, setDisplayText] = useState("");
    const [isDone, setIsDone] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

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

    const fullText = useMemo(() => {
      if (typeof children === "string") return children;
      if (typeof children === "number") return String(children);
      return text;
    }, [children, text]);

    useEffect(() => {
      if (reducedMotion) {
        setDisplayText(text);
        setIsDone(true);
        return;
      }

      setDisplayText("");
      setIsDone(false);
      setCurrentIndex(0);

      let startTimer: ReturnType<typeof setTimeout>;
      let characterTimer: ReturnType<typeof setTimeout>;
      let index = 0;

      const typeNextChar = () => {
        if (index > text.length) {
          setIsDone(true);
          return;
        }
        setDisplayText(text.substring(0, index));
        setCurrentIndex(index);
        index++;
        characterTimer = setTimeout(typeNextChar, speed);
      };

      startTimer = setTimeout(typeNextChar, delay);

      return () => {
        clearTimeout(startTimer);
        clearTimeout(characterTimer);
      };
    }, [text, speed, delay, reducedMotion]);

    useEffect(() => {
      if (isDone && announceCompletion && !reducedMotion) {
        AccessibilityInfo.announceForAccessibility(
          `Text fully displayed: ${fullText}`,
        );
      }
    }, [isDone, announceCompletion, reducedMotion, fullText]);

    const accessibilityLabel = useMemo(() => {
      return isDone ? fullText : `${fullText}, typing in progress`;
    }, [fullText, isDone]);

    return (
      <Text
        style={style}
        accessibilityLabel={accessibilityLabel}
        accessibilityLiveRegion="polite"
        accessibilityState={{ busy: !isDone, disabled: false }}
      >
        {reducedMotion ? text : displayText}
        {cursor && !isDone && !reducedMotion && (
          <Text style={{ color: style.color }}>|</Text>
        )}
      </Text>
    );
  },
);

/* ========== Truncation Component ========== */
interface TruncationProps {
  children: string;
  maxLines: number;
  onExpand?: () => void;
  expandText?: string;
  collapseText?: string;
  style?: TextStyle;
}

const TruncationComponent = memo<TruncationProps>(
  ({
    children,
    maxLines,
    onExpand,
    expandText = "Read more",
    collapseText = "Read less",
    style,
  }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [isTruncated, setIsTruncated] = React.useState(false);
    const theme = useAppTextTheme();

    const handleTextLayout = useCallback(
      (event: NativeSyntheticEvent<TextLayoutEventData>) => {
        setIsTruncated(event.nativeEvent.lines.length > maxLines);
      },
      [maxLines],
    );

    const handleToggle = useCallback(() => {
      setIsExpanded(!isExpanded);
      onExpand?.();
    }, [isExpanded, onExpand]);

    return (
      <View>
        <Text
          style={style}
          numberOfLines={isExpanded ? undefined : maxLines}
          onTextLayout={handleTextLayout}
        >
          {children}
          {isTruncated && !isExpanded && "... "}
        </Text>
        {isTruncated && (
          <Text
            style={[style, { color: theme.colors.primary, marginTop: 4 }]}
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
  style: TextStyle;
}

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

    // Track mounted state and previous animated values for cleanup
    const isMountedRef = useRef(true);
    const animationsRef = useRef<Animated.CompositeAnimation[]>([]);
    const prevLengthRef = useRef<number>(characters.length);
    const prevAnimatedValuesRef = useRef<Animated.Value[]>([]);
    const currentAnimatedValuesRef = useRef<Animated.Value[]>([]);

    // Create animated values - these persist but get replaced when text changes
    // Using a ref that we manually manage to avoid React's strict mode issues
    // Memoize animated values to avoid recreation during render
    const animatedValues = useMemo(() => {
      return characters.map(() => new Animated.Value(0));
    }, [characters.length]);

    // Keep ref in sync with animated values
    useEffect(() => {
      currentAnimatedValuesRef.current = animatedValues;
    }, [animatedValues]);

    // Cleanup previous animations when character count changes
    useEffect(() => {
      if (
        prevLengthRef.current !== characters.length &&
        prevAnimatedValuesRef.current.length > 0
      ) {
        prevAnimatedValuesRef.current.forEach((value) => {
          value.stopAnimation?.();
          value.setValue(0);
        });
      }
      prevLengthRef.current = characters.length;
      prevAnimatedValuesRef.current = currentAnimatedValuesRef.current;
      return () => {
        if (prevAnimatedValuesRef.current.length > 0) {
          prevAnimatedValuesRef.current.forEach((value) => {
            value.stopAnimation?.();
            value.setValue(0);
          });
        }
      };
    }, [characters.length]);

    useEffect(() => {
      isMountedRef.current = true;

      // Create animations for each character
      const animations = animatedValues.map((value, i) => {
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
          } catch (e) {
            // Ignore
          }
        });
      };
    }, [animatedValues, duration, delay, characters.length]);

    const interpolatedStyles = useMemo(() => {
      return animatedValues.map((value) => ({
        transform: [
          {
            translateY: value.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -20],
            }),
          },
        ],
      }));
    }, [animatedValues]);

    return (
      <Text style={[style, { overflow: "visible" }]}>
        {characters.map((char, i) => (
          <Animated.Text key={`wave-${i}`} style={interpolatedStyles[i]}>
            {char}
          </Animated.Text>
        ))}
      </Text>
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
        maxLines,
        truncateText = false,
        shadow = false,
        animated = false,
        animation,
        animationConfig,
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
        accessibilityActions,
        onAccessibilityAction,
        linkDetection = false,
        onLinkPress,
        ...restProps
      },
      ref,
    ) => {
      const theme = useAppTextTheme();
      const rawScheme = useColorScheme();
      const colorScheme = rawScheme === "unspecified" ? "light" : rawScheme;
      const themedStyles = useThemedStyles(theme, colorScheme);
      const fontScaling = useDynamicTypeScale(
        allowFontScaling,
        minimumFontScale,
        maxFontSizeMultiplier,
      );

      // Animation hook
      const { animatedStyle, animationType } = useTextAnimation(
        animated,
        animation,
        animationConfig,
        animationDelay,
        animationDuration,
        animationSpeed,
        cursor,
      );

      const textContent = useMemo(() => {
        if (typeof children === "string") return children;
        if (typeof children === "number") return children.toString();
        return String(children || "");
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
        responsive ? { min: 10, max: 48 } : undefined,
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

      const computedStyle = useMemo((): TextStyle => {
        const baseStyle: TextStyle = {
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
        () => ({ ...computedStyle, ...spacingStyles, ...animatedStyle }),
        [computedStyle, spacingStyles, animatedStyle],
      );

      const textProps = useMemo(() => {
        const props = {
          ...restProps,
          numberOfLines:
            maxLines ||
            (typeof truncate === "number" ? truncate : numberOfLines),
          ellipsizeMode:
            truncate || truncateText ? ellipsizeMode || "tail" : ellipsizeMode,
          allowFontScaling: fontScaling.allowFontScaling,
          maxFontSizeMultiplier: fontScaling.maxFontSizeMultiplier,
          minimumFontScale: fontScaling.minimumFontScale,
          suppressHighlighting,
          selectable,
          selectionColor,
          textBreakStrategy,
          hyphenationFrequency,
          testID: testID || `apptext-${variant}`,
          accessibilityLabel: accessibilityLabel || textContent,
          accessibilityHint,
          accessibilityLiveRegion,
          accessibilityState,
          accessibilityActions,
          onAccessibilityAction,
        };

        return {
          accessibilityRole:
            restProps.accessibilityRole || (onPress ? "button" : "text"),
          ...props,
        } as TextProps;
      }, [
        restProps,
        truncate,
        numberOfLines,
        ellipsizeMode,
        allowFontScaling,
        maxFontSizeMultiplier,
        minimumFontScale,
        fontScaling,
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
        onPress,
      ]);

      const handlePress = useCallback(
        (e: NativeSyntheticEvent<any>) => onPress?.(e),
        [onPress],
      );
      const handleLongPress = useCallback(
        (e: NativeSyntheticEvent<any>) => onLongPress?.(e),
        [onLongPress],
      );

      const hasPressHandlers = !!onPress || !!onLongPress;
      const finalConfig =
        animationConfig || (isAnimationWithConfig(animation) ? animation : {});
      const finalDelay = finalConfig?.delay ?? animationDelay;
      const finalDuration = finalConfig?.duration ?? animationDuration;
      const finalSpeed = finalConfig?.speed ?? animationSpeed;

      // Special animation handling
      if ((animated || animation) && animationType === "typewriter") {
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

      if ((animated || animation) && animationType === "wave") {
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

      const renderChildren = () => {
        if (!linkDetection || typeof children !== "string") return children;

        const urlRegex =
          /((?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*))/gi;
        const parts = children.split(urlRegex);

        return parts.map((part, i) => {
          if (part.match(urlRegex)) {
            const url = part.match(/^https?:\/\//) ? part : `https://${part}`;
            return (
              <Text
                key={`link-${i}`}
                style={{
                  color: resolvedColor,
                  textDecorationLine: "underline",
                }}
                onPress={() => onLinkPress?.(url)}
              >
                {part}
              </Text>
            );
          }
          return part;
        });
      };

      if (animated || (animation && animationType !== "none")) {
        return (
          <Animated.Text
            ref={ref}
            style={finalComputedStyle}
            {...(!hasPressHandlers
              ? { pointerEvents: "none" }
              : { onPress: handlePress, onLongPress: handleLongPress })}
            {...textProps}
          >
            {renderChildren()}
          </Animated.Text>
        );
      }

      return (
        <Text
          ref={ref}
          style={finalComputedStyle}
          {...(!hasPressHandlers
            ? { pointerEvents: "none" }
            : { onPress: handlePress, onLongPress: handleLongPress })}
          {...textProps}
        >
          {renderChildren()}
        </Text>
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
AppText.H1 = memo((props) => <BaseAppText {...props} variant="h1" />);
AppText.H2 = memo((props) => <BaseAppText {...props} variant="h2" />);
AppText.H3 = memo((props) => <BaseAppText {...props} variant="h3" />);
AppText.H4 = memo((props) => <BaseAppText {...props} variant="h4" />);
AppText.H5 = memo((props) => <BaseAppText {...props} variant="h5" />);
AppText.H6 = memo((props) => <BaseAppText {...props} variant="h6" />);
AppText.Title = memo((props) => <BaseAppText {...props} variant="title" />);
AppText.Subtitle = memo((props) => (
  <BaseAppText {...props} variant="subtitle1" />
));
AppText.Body = memo((props) => <BaseAppText {...props} variant="body1" />);
AppText.Caption = memo((props) => <BaseAppText {...props} variant="caption" />);
AppText.Code = memo((props) => <BaseAppText {...props} variant="code" />);

// Material Design 3 variants
AppText.DisplayLarge = memo((props) => (
  <BaseAppText {...props} variant="displayLarge" />
));
AppText.DisplayMedium = memo((props) => (
  <BaseAppText {...props} variant="displayMedium" />
));
AppText.DisplaySmall = memo((props) => (
  <BaseAppText {...props} variant="displaySmall" />
));
AppText.HeadlineLarge = memo((props) => (
  <BaseAppText {...props} variant="headlineLarge" />
));
AppText.HeadlineMedium = memo((props) => (
  <BaseAppText {...props} variant="headlineMedium" />
));
AppText.HeadlineSmall = memo((props) => (
  <BaseAppText {...props} variant="headlineSmall" />
));
AppText.TitleLarge = memo((props) => (
  <BaseAppText {...props} variant="titleLarge" />
));
AppText.TitleMedium = memo((props) => (
  <BaseAppText {...props} variant="titleMedium" />
));
AppText.TitleSmall = memo((props) => (
  <BaseAppText {...props} variant="titleSmall" />
));
AppText.BodyLarge = memo((props) => (
  <BaseAppText {...props} variant="bodyLarge" />
));
AppText.BodyMedium = memo((props) => (
  <BaseAppText {...props} variant="bodyMedium" />
));
AppText.BodySmall = memo((props) => (
  <BaseAppText {...props} variant="bodySmall" />
));
AppText.LabelLarge = memo((props) => (
  <BaseAppText {...props} variant="labelLarge" />
));
AppText.LabelMedium = memo((props) => (
  <BaseAppText {...props} variant="labelMedium" />
));
AppText.LabelSmall = memo((props) => (
  <BaseAppText {...props} variant="labelSmall" />
));

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
