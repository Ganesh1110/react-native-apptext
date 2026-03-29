"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTextAnimation = exports.isAnimationWithConfig = void 0;
const react_1 = require("react");
const react_native_1 = require("react-native");
const hooks_1 = require("../hooks");
const isAnimationWithConfig = (anim) => {
    return (typeof anim === "object" &&
        anim !== null &&
        "type" in anim &&
        typeof anim.type === "string");
};
exports.isAnimationWithConfig = isAnimationWithConfig;
const useTextAnimation = (animated, animation, animationConfig, animationDelay = 0, animationDuration = 1000, animationSpeed = 50, cursor = false) => {
    const reducedMotion = (0, hooks_1.useReducedMotion)();
    const opacityValue = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const translateYValue = (0, react_1.useRef)(new react_native_1.Animated.Value(50)).current;
    const translateXValue = (0, react_1.useRef)(new react_native_1.Animated.Value(100)).current;
    const scaleValue = (0, react_1.useRef)(new react_native_1.Animated.Value(0.8)).current;
    const rotateValue = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const shakeValue = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const glowValue = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const neonValue = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const gradientValue = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const currentAnimation = (0, react_1.useRef)(null);
    const hasAnimated = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(() => {
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
    const animationType = (0, react_1.useMemo)(() => {
        if (!animation || animation === true)
            return "fade";
        if (typeof animation === "string")
            return animation;
        if ((0, exports.isAnimationWithConfig)(animation))
            return animation.type;
        return "fade";
    }, [animation]);
    const isSpecialAnimation = animationType === "typewriter" || animationType === "wave";
    (0, react_1.useEffect)(() => {
        // Return early if not enabled, or if it's a special animation handled by separate components
        // Also skip animation if user prefers reduced motion (accessibility)
        if (!animated || !animation || isSpecialAnimation || reducedMotion)
            return;
        if (hasAnimated.current)
            return;
        const config = animationConfig || ((0, exports.isAnimationWithConfig)(animation) ? animation : {});
        const type = animationType;
        const duration = (config === null || config === void 0 ? void 0 : config.duration) || animationDuration;
        const delay = (config === null || config === void 0 ? void 0 : config.delay) || animationDelay;
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
                animationPromise = react_native_1.Animated.timing(opacityValue, {
                    toValue: 1,
                    duration,
                    delay,
                    useNativeDriver: true,
                });
                break;
            case "slideInRight":
                animationPromise = react_native_1.Animated.parallel([
                    react_native_1.Animated.timing(opacityValue, {
                        toValue: 1,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(translateXValue, {
                        toValue: 0,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                ]);
                break;
            case "slideInLeft":
                translateXValue.setValue(-100);
                animationPromise = react_native_1.Animated.parallel([
                    react_native_1.Animated.timing(opacityValue, {
                        toValue: 1,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(translateXValue, {
                        toValue: 0,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                ]);
                break;
            case "slideInUp":
                animationPromise = react_native_1.Animated.parallel([
                    react_native_1.Animated.timing(opacityValue, {
                        toValue: 1,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(translateYValue, {
                        toValue: 0,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                ]);
                break;
            case "slideInDown":
                translateYValue.setValue(-50);
                animationPromise = react_native_1.Animated.parallel([
                    react_native_1.Animated.timing(opacityValue, {
                        toValue: 1,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(translateYValue, {
                        toValue: 0,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                ]);
                break;
            case "bounceIn":
            case "zoomIn":
                animationPromise = react_native_1.Animated.parallel([
                    react_native_1.Animated.timing(opacityValue, {
                        toValue: 1,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.spring(scaleValue, {
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
                animationPromise = react_native_1.Animated.parallel([
                    react_native_1.Animated.timing(opacityValue, {
                        toValue: 1,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(rotateValue, {
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
                animationPromise = react_native_1.Animated.parallel([
                    react_native_1.Animated.timing(opacityValue, {
                        toValue: 1,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(rotateValue, {
                        toValue: 0,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                ]);
                break;
            case "rotateIn":
                rotateValue.setValue(-180);
                animationPromise = react_native_1.Animated.parallel([
                    react_native_1.Animated.timing(opacityValue, {
                        toValue: 1,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(rotateValue, {
                        toValue: 0,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                ]);
                break;
            // === ATTENTION ANIMATIONS ===
            case "pulse":
                animationPromise = react_native_1.Animated.loop(react_native_1.Animated.sequence([
                    react_native_1.Animated.timing(scaleValue, {
                        toValue: 1.1,
                        duration: duration / 2,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(scaleValue, {
                        toValue: 1,
                        duration: duration / 2,
                        useNativeDriver: true,
                    }),
                ]));
                break;
            case "bounce":
                animationPromise = react_native_1.Animated.loop(react_native_1.Animated.sequence([
                    react_native_1.Animated.timing(translateYValue, {
                        toValue: -20,
                        duration: duration / 2,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(translateYValue, {
                        toValue: 0,
                        duration: duration / 2,
                        useNativeDriver: true,
                    }),
                ]));
                break;
            case "shake":
                animationPromise = react_native_1.Animated.loop(react_native_1.Animated.sequence([
                    react_native_1.Animated.timing(shakeValue, {
                        toValue: 10,
                        duration: duration / 4,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(shakeValue, {
                        toValue: -10,
                        duration: duration / 2,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(shakeValue, {
                        toValue: 0,
                        duration: duration / 4,
                        useNativeDriver: true,
                    }),
                ]));
                break;
            case "rubberBand":
                animationPromise = react_native_1.Animated.loop(react_native_1.Animated.sequence([
                    react_native_1.Animated.timing(scaleValue, {
                        toValue: 1.25,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(scaleValue, {
                        toValue: 0.75,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(scaleValue, {
                        toValue: 1.15,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(scaleValue, {
                        toValue: 0.95,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(scaleValue, {
                        toValue: 1.05,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(scaleValue, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]));
                break;
            case "tada":
                animationPromise = react_native_1.Animated.loop(react_native_1.Animated.sequence([
                    react_native_1.Animated.timing(scaleValue, {
                        toValue: 0.9,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.parallel([
                        react_native_1.Animated.timing(scaleValue, {
                            toValue: 1.1,
                            duration: 100,
                            useNativeDriver: true,
                        }),
                        react_native_1.Animated.timing(rotateValue, {
                            toValue: -3,
                            duration: 100,
                            useNativeDriver: true,
                        }),
                    ]),
                    react_native_1.Animated.timing(rotateValue, {
                        toValue: 3,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(rotateValue, {
                        toValue: -3,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(rotateValue, {
                        toValue: 0,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(scaleValue, {
                        toValue: 1,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                ]));
                break;
            case "swing":
                animationPromise = react_native_1.Animated.loop(react_native_1.Animated.sequence([
                    react_native_1.Animated.timing(rotateValue, {
                        toValue: 15,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(rotateValue, {
                        toValue: -10,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(rotateValue, {
                        toValue: 5,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(rotateValue, {
                        toValue: -5,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(rotateValue, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                ]));
                break;
            case "wobble":
                animationPromise = react_native_1.Animated.loop(react_native_1.Animated.sequence([
                    react_native_1.Animated.timing(rotateValue, {
                        toValue: 5,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(rotateValue, {
                        toValue: -5,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(rotateValue, {
                        toValue: 3,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(rotateValue, {
                        toValue: -3,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(rotateValue, {
                        toValue: 0,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                ]));
                break;
            // === EXIT ANIMATIONS ===
            case "fadeOut":
                opacityValue.setValue(1);
                animationPromise = react_native_1.Animated.timing(opacityValue, {
                    toValue: 0,
                    duration,
                    delay,
                    useNativeDriver: true,
                });
                break;
            case "slideOutRight":
                opacityValue.setValue(1);
                translateXValue.setValue(0);
                animationPromise = react_native_1.Animated.parallel([
                    react_native_1.Animated.timing(opacityValue, {
                        toValue: 0,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(translateXValue, {
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
                animationPromise = react_native_1.Animated.parallel([
                    react_native_1.Animated.timing(opacityValue, {
                        toValue: 0,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(translateXValue, {
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
                animationPromise = react_native_1.Animated.parallel([
                    react_native_1.Animated.timing(opacityValue, {
                        toValue: 0,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(translateYValue, {
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
                animationPromise = react_native_1.Animated.parallel([
                    react_native_1.Animated.timing(opacityValue, {
                        toValue: 0,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(translateYValue, {
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
                animationPromise = react_native_1.Animated.parallel([
                    react_native_1.Animated.timing(opacityValue, {
                        toValue: 0,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(scaleValue, {
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
                animationPromise = react_native_1.Animated.parallel([
                    react_native_1.Animated.timing(opacityValue, {
                        toValue: 0,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(rotateValue, {
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
                animationPromise = react_native_1.Animated.parallel([
                    react_native_1.Animated.timing(opacityValue, {
                        toValue: 0,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(rotateValue, {
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
                animationPromise = react_native_1.Animated.parallel([
                    react_native_1.Animated.timing(opacityValue, {
                        toValue: 0,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(rotateValue, {
                        toValue: 180,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                ]);
                break;
            // === SPECIAL EFFECTS ===
            case "blink":
                animationPromise = react_native_1.Animated.loop(react_native_1.Animated.sequence([
                    react_native_1.Animated.timing(opacityValue, {
                        toValue: 0,
                        duration: duration / 2,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(opacityValue, {
                        toValue: 1,
                        duration: duration / 2,
                        useNativeDriver: true,
                    }),
                ]));
                break;
            case "glow":
                animationPromise = react_native_1.Animated.loop(react_native_1.Animated.sequence([
                    react_native_1.Animated.timing(glowValue, {
                        toValue: 1,
                        duration: duration / 2,
                        useNativeDriver: false,
                    }),
                    react_native_1.Animated.timing(glowValue, {
                        toValue: 0,
                        duration: duration / 2,
                        useNativeDriver: false,
                    }),
                ]));
                break;
            case "neon":
                animationPromise = react_native_1.Animated.loop(react_native_1.Animated.sequence([
                    react_native_1.Animated.timing(neonValue, {
                        toValue: 1,
                        duration: duration / 2,
                        useNativeDriver: false,
                    }),
                    react_native_1.Animated.timing(neonValue, {
                        toValue: 0.5,
                        duration: duration / 2,
                        useNativeDriver: false,
                    }),
                ]));
                break;
            case "gradientShift":
                animationPromise = react_native_1.Animated.loop(react_native_1.Animated.timing(gradientValue, {
                    toValue: 1,
                    duration: 3000,
                    useNativeDriver: false,
                }));
                break;
            default:
                // Default to fade animation
                animationPromise = react_native_1.Animated.timing(opacityValue, {
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
            translateYValue.setValue(type.includes("slide") ? (type.includes("Down") ? -50 : 50) : 0);
            translateXValue.setValue(type.includes("slide") ? (type.includes("Left") ? -100 : 100) : 0);
            scaleValue.setValue(type.includes("zoom") || type === "bounceIn" ? 0.8 : 1);
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
    const getAnimatedStyle = () => {
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
                            "rgb(255, 0, 0)",
                            "rgb(0, 255, 0)",
                            "rgb(0, 0, 255)",
                            "rgb(255, 0, 255)",
                            "rgb(255, 0, 0)",
                        ],
                    }),
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
exports.useTextAnimation = useTextAnimation;
