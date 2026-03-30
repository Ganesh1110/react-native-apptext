import React, { forwardRef, memo, useCallback, useMemo, useEffect, useRef, useState, } from "react";
import { Text, Animated, useColorScheme, View, } from "react-native";
import { SCRIPT_CONFIGS } from "./scriptConfigs";
import { DEFAULT_THEME } from "./theme";
import { useResponsiveFont, useScriptDetection, useThemedStyles, } from "./hooks";
import { AppTextProvider, useAppTextTheme } from "./context";
import { createSpacingStyles } from "./utils";
import TransComponent from "./Trans";
const PRESET_ANIMATION_DURATIONS = {
    rubberBand: 1000,
    tada: 1000,
    swing: 2000,
    wobble: 2000,
    pulse: 1500,
    bounce: 1000,
    shake: 500,
};
const useTextAnimation = (animated, animation, animationDelay = 0, animationDuration = 1000, animationSpeed = 50, cursor = false) => {
    var _a;
    const opacityValue = useRef(new Animated.Value(0)).current;
    const translateYValue = useRef(new Animated.Value(50)).current;
    const translateXValue = useRef(new Animated.Value(100)).current;
    const scaleValue = useRef(new Animated.Value(0.8)).current;
    const rotateValue = useRef(new Animated.Value(0)).current;
    const shakeValue = useRef(new Animated.Value(0)).current;
    const glowValue = useRef(new Animated.Value(0)).current;
    const neonValue = useRef(new Animated.Value(0)).current;
    const gradientValue = useRef(new Animated.Value(0)).current;
    const currentAnimation = useRef(null);
    const hasAnimated = useRef(false);
    // Derived type - used for branching in the parent component
    const animationType = useMemo(() => {
        if (!animation)
            return "fade";
        if (typeof animation === "string")
            return animation;
        if (typeof animation === "object")
            return animation.type || "fade";
        return "fade";
    }, [animation]);
    const isSpecialAnimation = animationType === "typewriter" || animationType === "wave";
    const effectiveDuration = (_a = PRESET_ANIMATION_DURATIONS[animationType]) !== null && _a !== void 0 ? _a : animationDuration;
    useEffect(() => {
        // Return early if not enabled, or if it's a special animation handled by separate components
        if (!animated || !animation || isSpecialAnimation)
            return;
        if (hasAnimated.current)
            return;
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
        }
        else {
            translateYValue.setValue(0);
            translateXValue.setValue(0);
        }
        if (type.includes("zoom") || type === "bounceIn") {
            scaleValue.setValue(0.8);
        }
        else {
            scaleValue.setValue(1);
        }
        if (type.includes("flip") || type.includes("rotate")) {
            rotateValue.setValue(0);
        }
        let animationPromise = null;
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
                animationPromise = Animated.loop(Animated.sequence([
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
                ]));
                break;
            case "bounce":
                animationPromise = Animated.loop(Animated.sequence([
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
                ]));
                break;
            case "shake":
                animationPromise = Animated.loop(Animated.sequence([
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
                ]));
                break;
            case "rubberBand":
                animationPromise = Animated.loop(Animated.sequence([
                    Animated.timing(scaleValue, {
                        toValue: 1.25,
                        duration: effectiveDuration * 0.3,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleValue, {
                        toValue: 0.75,
                        duration: effectiveDuration * 0.1,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleValue, {
                        toValue: 1.15,
                        duration: effectiveDuration * 0.1,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleValue, {
                        toValue: 0.95,
                        duration: effectiveDuration * 0.1,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleValue, {
                        toValue: 1.05,
                        duration: effectiveDuration * 0.1,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleValue, {
                        toValue: 1,
                        duration: effectiveDuration * 0.3,
                        useNativeDriver: true,
                    }),
                ]));
                break;
            case "tada":
                animationPromise = Animated.loop(Animated.sequence([
                    Animated.timing(scaleValue, {
                        toValue: 0.9,
                        duration: effectiveDuration * 0.1,
                        useNativeDriver: true,
                    }),
                    Animated.parallel([
                        Animated.timing(scaleValue, {
                            toValue: 1.1,
                            duration: effectiveDuration * 0.1,
                            useNativeDriver: true,
                        }),
                        Animated.timing(rotateValue, {
                            toValue: -3,
                            duration: effectiveDuration * 0.1,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.timing(rotateValue, {
                        toValue: 3,
                        duration: effectiveDuration * 0.1,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateValue, {
                        toValue: -3,
                        duration: effectiveDuration * 0.1,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateValue, {
                        toValue: 0,
                        duration: effectiveDuration * 0.1,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleValue, {
                        toValue: 1,
                        duration: effectiveDuration * 0.1,
                        useNativeDriver: true,
                    }),
                ]));
                break;
            case "swing":
                animationPromise = Animated.loop(Animated.sequence([
                    Animated.timing(rotateValue, {
                        toValue: 15,
                        duration: effectiveDuration * 0.2,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateValue, {
                        toValue: -10,
                        duration: effectiveDuration * 0.2,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateValue, {
                        toValue: 5,
                        duration: effectiveDuration * 0.2,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateValue, {
                        toValue: -5,
                        duration: effectiveDuration * 0.2,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateValue, {
                        toValue: 0,
                        duration: effectiveDuration * 0.2,
                        useNativeDriver: true,
                    }),
                ]));
                break;
            case "wobble":
                animationPromise = Animated.loop(Animated.sequence([
                    Animated.timing(rotateValue, {
                        toValue: 5,
                        duration: effectiveDuration * 0.2,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateValue, {
                        toValue: -5,
                        duration: effectiveDuration * 0.2,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateValue, {
                        toValue: 3,
                        duration: effectiveDuration * 0.2,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateValue, {
                        toValue: -3,
                        duration: effectiveDuration * 0.2,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateValue, {
                        toValue: 0,
                        duration: effectiveDuration * 0.2,
                        useNativeDriver: true,
                    }),
                ]));
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
                animationPromise = Animated.loop(Animated.sequence([
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
                ]));
                break;
            case "glow":
                animationPromise = Animated.loop(Animated.sequence([
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
                ]));
                break;
            case "neon":
                animationPromise = Animated.loop(Animated.sequence([
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
                ]));
                break;
            case "gradientShift":
                animationPromise = Animated.loop(Animated.timing(gradientValue, {
                    toValue: 1,
                    duration: 3000,
                    useNativeDriver: false,
                }));
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
        };
    }, [
        animated,
        animation,
        animationDelay,
        animationDuration,
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
    const getAnimatedStyle = useCallback(() => {
        // Return empty if not animated/animation context, or if special animation handled by standard components
        if (!animated || !animation || isSpecialAnimation)
            return {};
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
    }, []);
    return {
        animatedStyle: getAnimatedStyle(),
        animationType,
    };
};
const TypewriterText = memo(({ children, delay = 0, duration = 2000, speed = 50, cursor = false, style, }) => {
    const [displayText, setDisplayText] = useState("");
    const [isDone, setIsDone] = useState(false);
    const text = useMemo(() => {
        const extractText = (node) => {
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
        // Reset state whenever text, speed, or delay changes
        setDisplayText("");
        setIsDone(false);
        let startTimer;
        let characterTimer;
        let index = 0;
        // Single recursive chain: no dependency on component state,
        // so there is only ever ONE timer active at a time.
        const typeNextChar = () => {
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
            clearTimeout(startTimer);
            clearTimeout(characterTimer);
        };
    }, [text, speed, delay]);
    const cursorColor = useMemo(() => {
        if (!style)
            return undefined;
        if (Array.isArray(style)) {
            for (const s of style) {
                if (s && typeof s === "object" && "color" in s) {
                    return s.color;
                }
            }
        }
        else if (style && typeof style === "object" && "color" in style) {
            return style.color;
        }
        return undefined;
    }, [style]);
    return (<Text style={style} accessibilityLiveRegion="polite" accessibilityState={{ busy: !isDone }}>
        {displayText}
        {cursor && !isDone && <Text style={{ color: cursorColor }}>|</Text>}
      </Text>);
});
const TruncationComponent = memo(({ children, maxLines, onExpand, onCollapse, expandText = "Read more", collapseText = "Read less", style, }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [isTruncated, setIsTruncated] = React.useState(false);
    const theme = useAppTextTheme();
    const handleTextLayout = useCallback((event) => {
        setIsTruncated(event.nativeEvent.lines.length > maxLines);
    }, [maxLines]);
    const handleToggle = useCallback(() => {
        setIsExpanded((prev) => {
            if (!prev) {
                onExpand === null || onExpand === void 0 ? void 0 : onExpand();
            }
            else {
                onCollapse === null || onCollapse === void 0 ? void 0 : onCollapse();
            }
            return !prev;
        });
    }, [onExpand, onCollapse]);
    return (<View>
        <Text style={style} numberOfLines={isExpanded ? undefined : maxLines} onTextLayout={handleTextLayout}>
          {children}
          {isTruncated && !isExpanded && "... "}
        </Text>
        {isTruncated && (<Text style={[style, { color: theme.colors.primary, marginTop: 4 }]} onPress={handleToggle}>
            {isExpanded ? collapseText : expandText}
          </Text>)}
      </View>);
});
const WaveText = memo(({ children, duration = 1000, delay = 0, style }) => {
    const text = useMemo(() => {
        const extractText = (node) => {
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
    const animationsRef = useRef([]);
    // Create animated values - these persist but get replaced when text changes
    const animatedValuesRef = useRef([]);
    const prevTextRef = useRef(text);
    // Initialize values on first render or text change - properly in useEffect
    useEffect(() => {
        if (prevTextRef.current !== text) {
            prevTextRef.current = text;
        }
        if (animatedValuesRef.current.length !== characters.length) {
            animatedValuesRef.current = characters.map(() => new Animated.Value(0));
        }
    }, [text, characters.length]);
    useEffect(() => {
        isMountedRef.current = true;
        // Create animations for each character
        const animations = animatedValuesRef.current.map((value, i) => {
            const charLoop = Animated.loop(Animated.sequence([
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
            ]));
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
                }
                catch (_a) {
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
    return (<Text style={style}>
        {characters.map((char, i) => (<Animated.Text key={`wave-${i}`} style={interpolatedStyles[i]}>
            {char}
          </Animated.Text>))}
      </Text>);
});
/* ========== Main Component ========== */
const BaseAppText = memo(forwardRef(({ children, variant = "body1", color, size, weight, align, transform, decoration, italic = false, truncate = false, shadow = false, animated = false, animation, animationDelay = 0, animationDuration = 1000, animationSpeed = 50, cursor = false, script, direction = "auto", responsive = true, style: propStyle, testID, m, mt, mr, mb, ml, mx, my, p, pt, pr, pb, pl, px, py, numberOfLines, ellipsizeMode, onPress, onLongPress, onExpand, onCollapse, expandText, collapseText, allowFontScaling, maxFontSizeMultiplier, minimumFontScale, suppressHighlighting, selectable, selectionColor, textBreakStrategy, hyphenationFrequency, accessibilityLabel, accessibilityHint, accessibilityLiveRegion, accessibilityState, ...restProps }, ref) => {
    var _a, _b, _c;
    const theme = useAppTextTheme();
    const rawScheme = useColorScheme();
    const colorScheme = rawScheme === "unspecified" ? "light" : rawScheme;
    const themedStyles = useThemedStyles(theme, colorScheme);
    // Animation hook
    const { animatedStyle, animationType } = useTextAnimation(animated, animation, animationDelay, animationDuration, animationSpeed, cursor);
    const textContent = useMemo(() => {
        if (typeof children === "string")
            return children;
        if (typeof children === "number")
            return children.toString();
        return String(children || "");
    }, [children]);
    const detectedScript = useScriptDetection(textContent);
    const finalScript = script || detectedScript;
    const scriptConfig = SCRIPT_CONFIGS[finalScript] || SCRIPT_CONFIGS.Unknown;
    const typographyStyle = theme.typography[variant] || theme.typography.body1;
    const baseFontSize = size === "auto"
        ? typographyStyle.fontSize
        : size || typographyStyle.fontSize;
    const responsiveFontSize = useResponsiveFont(baseFontSize, responsive ? 10 : undefined, responsive ? 48 : undefined);
    const calculatedLineHeight = useMemo(() => {
        const baseLineHeight = typographyStyle.lineHeight || baseFontSize * 1.2;
        return baseLineHeight * scriptConfig.lineHeightMultiplier;
    }, [
        typographyStyle.lineHeight,
        baseFontSize,
        scriptConfig.lineHeightMultiplier,
    ]);
    const resolvedColor = useMemo(() => {
        if (!color)
            return themedStyles.defaultTextColor;
        if (color in theme.colors) {
            return theme.colors[color];
        }
        return color;
    }, [color, theme.colors, themedStyles.defaultTextColor]);
    const textDirection = useMemo(() => {
        if (direction !== "auto")
            return direction;
        return scriptConfig.direction;
    }, [direction, scriptConfig.direction]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const computedStyle = useMemo(() => {
        const baseStyle = {
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
    const spacingStyles = useMemo(() => createSpacingStyles({
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
    }), [m, mt, mr, mb, ml, mx, my, p, pt, pr, pb, pl, px, py]);
    const finalComputedStyle = useMemo(() => ({ ...computedStyle, ...spacingStyles, ...animatedStyle }), 
    // Use primitive values that computedStyle and animatedStyle depend on
    [
        spacingStyles,
        // computedStyle primitives
        resolvedColor,
        responsiveFontSize,
        calculatedLineHeight,
        weight,
        align,
        textDirection,
        decoration,
        italic,
        transform,
        shadow,
        typographyStyle,
        // animatedStyle - depends on animationType which is stable from useMemo
        animationType,
    ]);
    const textProps = useMemo(() => {
        const props = {
            ...restProps,
            numberOfLines: typeof truncate === "number" ? truncate : numberOfLines,
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
        };
        return {
            ...props,
            accessibilityRole: (onPress ? "button" : "text"),
        };
    }, [
        restProps,
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
        onPress,
    ]);
    const handlePress = useCallback((e) => onPress === null || onPress === void 0 ? void 0 : onPress(e), [onPress]);
    const handleLongPress = useCallback((e) => onLongPress === null || onLongPress === void 0 ? void 0 : onLongPress(e), [onLongPress]);
    const hasPressHandlers = !!onPress || !!onLongPress;
    const animationConfig = typeof animation === "object" ? animation : {};
    const finalDelay = (_a = animationConfig.delay) !== null && _a !== void 0 ? _a : animationDelay;
    const finalDuration = (_b = animationConfig.duration) !== null && _b !== void 0 ? _b : animationDuration;
    const finalSpeed = (_c = animationConfig.speed) !== null && _c !== void 0 ? _c : animationSpeed;
    // Special animation handling
    if ((animated || animation) && animationType === "typewriter") {
        return (<TypewriterText delay={finalDelay} duration={finalDuration} speed={finalSpeed} cursor={cursor} style={finalComputedStyle}>
            {children}
          </TypewriterText>);
    }
    if (animated || (animation && animationType !== "none")) {
        return (<Animated.Text ref={ref} style={finalComputedStyle} {...(!hasPressHandlers
            ? { pointerEvents: "none" }
            : { onPress: handlePress, onLongPress: handleLongPress })} {...textProps}>
            {children}
          </Animated.Text>);
    }
    const hasExpandCollapse = expandText || collapseText || onExpand || onCollapse;
    const maxLines = typeof truncate === "number" ? truncate : numberOfLines;
    const textElement = (<Text ref={ref} style={finalComputedStyle} {...(!hasPressHandlers
        ? { pointerEvents: "none" }
        : { onPress: handlePress, onLongPress: handleLongPress })} {...textProps}>
          {children}
        </Text>);
    if (hasExpandCollapse && maxLines) {
        return (<TruncationComponent maxLines={maxLines} onExpand={onExpand} onCollapse={onCollapse} expandText={expandText} collapseText={collapseText} style={finalComputedStyle}>
            {typeof children === "string" ? children : String(children || "")}
          </TruncationComponent>);
    }
    return textElement;
}));
BaseAppText.displayName = "AppText";
const AppText = BaseAppText;
// Legacy variants
AppText.H1 = memo(forwardRef((props, ref) => (<BaseAppText {...props} variant="h1" ref={ref}/>)));
AppText.H2 = memo(forwardRef((props, ref) => (<BaseAppText {...props} variant="h2" ref={ref}/>)));
AppText.H3 = memo(forwardRef((props, ref) => (<BaseAppText {...props} variant="h3" ref={ref}/>)));
AppText.H4 = memo(forwardRef((props, ref) => (<BaseAppText {...props} variant="h4" ref={ref}/>)));
AppText.H5 = memo(forwardRef((props, ref) => (<BaseAppText {...props} variant="h5" ref={ref}/>)));
AppText.H6 = memo(forwardRef((props, ref) => (<BaseAppText {...props} variant="h6" ref={ref}/>)));
AppText.Title = memo(forwardRef((props, ref) => (<BaseAppText {...props} variant="title" ref={ref}/>)));
AppText.Subtitle = memo(forwardRef((props, ref) => (<BaseAppText {...props} variant="subtitle1" ref={ref}/>)));
AppText.Body = memo(forwardRef((props, ref) => (<BaseAppText {...props} variant="body1" ref={ref}/>)));
AppText.Caption = memo(forwardRef((props, ref) => (<BaseAppText {...props} variant="caption" ref={ref}/>)));
AppText.Code = memo(forwardRef((props, ref) => (<BaseAppText {...props} variant="code" ref={ref}/>)));
// Material Design 3 variants
AppText.DisplayLarge = memo(forwardRef((props, ref) => (<BaseAppText {...props} variant="displayLarge" ref={ref}/>)));
AppText.DisplayMedium = memo(forwardRef((props, ref) => (<BaseAppText {...props} variant="displayMedium" ref={ref}/>)));
AppText.DisplaySmall = memo(forwardRef((props, ref) => (<BaseAppText {...props} variant="displaySmall" ref={ref}/>)));
AppText.HeadlineLarge = memo(forwardRef((props, ref) => (<BaseAppText {...props} variant="headlineLarge" ref={ref}/>)));
AppText.HeadlineMedium = memo(forwardRef((props, ref) => (<BaseAppText {...props} variant="headlineMedium" ref={ref}/>)));
AppText.HeadlineSmall = memo(forwardRef((props, ref) => (<BaseAppText {...props} variant="headlineSmall" ref={ref}/>)));
AppText.TitleLarge = memo(forwardRef((props, ref) => (<BaseAppText {...props} variant="titleLarge" ref={ref}/>)));
AppText.TitleMedium = memo(forwardRef((props, ref) => (<BaseAppText {...props} variant="titleMedium" ref={ref}/>)));
AppText.TitleSmall = memo(forwardRef((props, ref) => (<BaseAppText {...props} variant="titleSmall" ref={ref}/>)));
AppText.BodyLarge = memo(forwardRef((props, ref) => (<BaseAppText {...props} variant="bodyLarge" ref={ref}/>)));
AppText.BodyMedium = memo(forwardRef((props, ref) => (<BaseAppText {...props} variant="bodyMedium" ref={ref}/>)));
AppText.BodySmall = memo(forwardRef((props, ref) => (<BaseAppText {...props} variant="bodySmall" ref={ref}/>)));
AppText.LabelLarge = memo(forwardRef((props, ref) => (<BaseAppText {...props} variant="labelLarge" ref={ref}/>)));
AppText.LabelMedium = memo(forwardRef((props, ref) => (<BaseAppText {...props} variant="labelMedium" ref={ref}/>)));
AppText.LabelSmall = memo(forwardRef((props, ref) => (<BaseAppText {...props} variant="labelSmall" ref={ref}/>)));
AppText.Trans = TransComponent;
export default AppText;
export { AppTextProvider, useAppTextTheme, useResponsiveFont, useScriptDetection, SCRIPT_CONFIGS, DEFAULT_THEME, TransComponent as Trans, };
