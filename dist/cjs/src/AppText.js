"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trans = exports.DEFAULT_THEME = exports.SCRIPT_CONFIGS = exports.useScriptDetection = exports.useResponsiveFont = exports.useAppTextTheme = exports.AppTextProvider = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const scriptConfigs_1 = require("./scriptConfigs");
Object.defineProperty(exports, "SCRIPT_CONFIGS", { enumerable: true, get: function () { return scriptConfigs_1.SCRIPT_CONFIGS; } });
const theme_1 = require("./theme");
Object.defineProperty(exports, "DEFAULT_THEME", { enumerable: true, get: function () { return theme_1.DEFAULT_THEME; } });
const hooks_1 = require("./hooks");
Object.defineProperty(exports, "useResponsiveFont", { enumerable: true, get: function () { return hooks_1.useResponsiveFont; } });
Object.defineProperty(exports, "useScriptDetection", { enumerable: true, get: function () { return hooks_1.useScriptDetection; } });
const context_1 = require("./context");
Object.defineProperty(exports, "AppTextProvider", { enumerable: true, get: function () { return context_1.AppTextProvider; } });
Object.defineProperty(exports, "useAppTextTheme", { enumerable: true, get: function () { return context_1.useAppTextTheme; } });
const utils_1 = require("./utils");
const Trans_1 = __importDefault(require("./Trans"));
exports.Trans = Trans_1.default;
const isAnimationWithConfig = (anim) => {
    return (typeof anim === "object" &&
        anim !== null &&
        "type" in anim &&
        typeof anim.type === "string");
};
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
        const config = animationConfig || (isAnimationWithConfig(animation) ? animation : {});
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
const TypewriterText = (0, react_1.memo)(({ children, delay = 0, duration = 2000, speed = 50, cursor = false, style, announceCompletion = true, }) => {
    const reducedMotion = (0, hooks_1.useReducedMotion)();
    const [displayText, setDisplayText] = (0, react_1.useState)("");
    const [isDone, setIsDone] = (0, react_1.useState)(false);
    const [currentIndex, setCurrentIndex] = (0, react_1.useState)(0);
    const text = (0, react_1.useMemo)(() => {
        const extractText = (node) => {
            if (typeof node === "string" || typeof node === "number") {
                return String(node);
            }
            if (react_1.default.isValidElement(node)) {
                return extractText(node.props.children);
            }
            if (Array.isArray(node)) {
                return node.map(extractText).join("");
            }
            return "";
        };
        return extractText(children);
    }, [children]);
    const fullText = (0, react_1.useMemo)(() => {
        if (typeof children === "string")
            return children;
        if (typeof children === "number")
            return String(children);
        return text;
    }, [children, text]);
    (0, react_1.useEffect)(() => {
        if (reducedMotion) {
            setDisplayText(text);
            setIsDone(true);
            return;
        }
        setDisplayText("");
        setIsDone(false);
        setCurrentIndex(0);
        let startTimer;
        let characterTimer;
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
    (0, react_1.useEffect)(() => {
        if (isDone && announceCompletion && !reducedMotion) {
            react_native_1.AccessibilityInfo.announceForAccessibility(`Text fully displayed: ${fullText}`);
        }
    }, [isDone, announceCompletion, reducedMotion, fullText]);
    const accessibilityLabel = (0, react_1.useMemo)(() => {
        return isDone ? fullText : `${fullText}, typing in progress`;
    }, [fullText, isDone]);
    return (<react_native_1.Text style={style} accessibilityLabel={accessibilityLabel} accessibilityLiveRegion="polite" accessibilityState={{ busy: !isDone, disabled: false }}>
        {reducedMotion ? text : displayText}
        {cursor && !isDone && !reducedMotion && (<react_native_1.Text style={{ color: style.color }}>|</react_native_1.Text>)}
      </react_native_1.Text>);
});
const TruncationComponent = (0, react_1.memo)(({ children, maxLines, onExpand, expandText = "Read more", collapseText = "Read less", style, }) => {
    const [isExpanded, setIsExpanded] = react_1.default.useState(false);
    const [isTruncated, setIsTruncated] = react_1.default.useState(false);
    const theme = (0, context_1.useAppTextTheme)();
    const handleTextLayout = (0, react_1.useCallback)((event) => {
        setIsTruncated(event.nativeEvent.lines.length > maxLines);
    }, [maxLines]);
    const handleToggle = (0, react_1.useCallback)(() => {
        setIsExpanded(!isExpanded);
        onExpand === null || onExpand === void 0 ? void 0 : onExpand();
    }, [isExpanded, onExpand]);
    return (<react_native_1.View>
        <react_native_1.Text style={style} numberOfLines={isExpanded ? undefined : maxLines} onTextLayout={handleTextLayout}>
          {children}
          {isTruncated && !isExpanded && "... "}
        </react_native_1.Text>
        {isTruncated && (<react_native_1.Text style={[style, { color: theme.colors.primary, marginTop: 4 }]} onPress={handleToggle}>
            {isExpanded ? collapseText : expandText}
          </react_native_1.Text>)}
      </react_native_1.View>);
});
const WaveText = (0, react_1.memo)(({ children, duration = 1000, delay = 0, style }) => {
    const text = (0, react_1.useMemo)(() => {
        const extractText = (node) => {
            if (typeof node === "string" || typeof node === "number") {
                return String(node);
            }
            if (react_1.default.isValidElement(node)) {
                return extractText(node.props.children);
            }
            if (Array.isArray(node)) {
                return node.map(extractText).join("");
            }
            return "";
        };
        return extractText(children);
    }, [children]);
    const characters = (0, react_1.useMemo)(() => text.split(""), [text]);
    // Track mounted state and previous animated values for cleanup
    const isMountedRef = (0, react_1.useRef)(true);
    const animationsRef = (0, react_1.useRef)([]);
    const prevLengthRef = (0, react_1.useRef)(characters.length);
    const prevAnimatedValuesRef = (0, react_1.useRef)([]);
    const currentAnimatedValuesRef = (0, react_1.useRef)([]);
    // Create animated values - these persist but get replaced when text changes
    // Using a ref that we manually manage to avoid React's strict mode issues
    // Memoize animated values to avoid recreation during render
    const animatedValues = (0, react_1.useMemo)(() => {
        return characters.map(() => new react_native_1.Animated.Value(0));
    }, [characters.length]);
    // Keep ref in sync with animated values
    (0, react_1.useEffect)(() => {
        currentAnimatedValuesRef.current = animatedValues;
    }, [animatedValues]);
    // Cleanup previous animations when character count changes
    (0, react_1.useEffect)(() => {
        if (prevLengthRef.current !== characters.length &&
            prevAnimatedValuesRef.current.length > 0) {
            prevAnimatedValuesRef.current.forEach((value) => {
                var _a;
                (_a = value.stopAnimation) === null || _a === void 0 ? void 0 : _a.call(value);
                value.setValue(0);
            });
        }
        prevLengthRef.current = characters.length;
        prevAnimatedValuesRef.current = currentAnimatedValuesRef.current;
        return () => {
            if (prevAnimatedValuesRef.current.length > 0) {
                prevAnimatedValuesRef.current.forEach((value) => {
                    var _a;
                    (_a = value.stopAnimation) === null || _a === void 0 ? void 0 : _a.call(value);
                    value.setValue(0);
                });
            }
        };
    }, [characters.length]);
    (0, react_1.useEffect)(() => {
        isMountedRef.current = true;
        // Create animations for each character
        const animations = animatedValues.map((value, i) => {
            const charLoop = react_native_1.Animated.loop(react_native_1.Animated.sequence([
                react_native_1.Animated.timing(value, {
                    toValue: 1,
                    duration: duration / 2,
                    useNativeDriver: true,
                }),
                react_native_1.Animated.timing(value, {
                    toValue: 0,
                    duration: duration / 2,
                    useNativeDriver: true,
                }),
            ]));
            // One-time staggered start
            return react_native_1.Animated.sequence([
                react_native_1.Animated.delay(i * (duration / characters.length || 50) + delay),
                charLoop,
            ]);
        });
        animationsRef.current = animations;
        // Start all sequences in parallel - each will wait for its delay before looping
        const masterAnimation = react_native_1.Animated.parallel(animations, {
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
                catch (e) {
                    // Ignore
                }
            });
        };
    }, [animatedValues, duration, delay, characters.length]);
    const interpolatedStyles = (0, react_1.useMemo)(() => {
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
    return (<react_native_1.Text style={[style, { overflow: "visible" }]}>
        {characters.map((char, i) => (<react_native_1.Animated.Text key={`wave-${i}`} style={interpolatedStyles[i]}>
            {char}
          </react_native_1.Animated.Text>))}
      </react_native_1.Text>);
});
/* ========== Main Component ========== */
const BaseAppText = (0, react_1.memo)((0, react_1.forwardRef)(({ children, variant = "body1", color, size, weight, align, transform, decoration, italic = false, truncate = false, maxLines, truncateText = false, shadow = false, animated = false, animation, animationConfig, animationDelay = 0, animationDuration = 1000, animationSpeed = 50, cursor = false, script, direction = "auto", responsive = true, style: propStyle, testID, m, mt, mr, mb, ml, mx, my, p, pt, pr, pb, pl, px, py, numberOfLines, ellipsizeMode, onPress, onLongPress, allowFontScaling, maxFontSizeMultiplier, minimumFontScale, suppressHighlighting, selectable, selectionColor, textBreakStrategy, hyphenationFrequency, accessibilityLabel, accessibilityHint, accessibilityLiveRegion, accessibilityState, accessibilityActions, onAccessibilityAction, linkDetection = false, onLinkPress, ...restProps }, ref) => {
    var _a, _b, _c;
    const theme = (0, context_1.useAppTextTheme)();
    const rawScheme = (0, react_native_1.useColorScheme)();
    const colorScheme = rawScheme === "unspecified" ? "light" : rawScheme;
    const themedStyles = (0, hooks_1.useThemedStyles)(theme, colorScheme);
    const fontScaling = (0, hooks_1.useDynamicTypeScale)(allowFontScaling, minimumFontScale, maxFontSizeMultiplier);
    // Animation hook
    const { animatedStyle, animationType } = useTextAnimation(animated, animation, animationConfig, animationDelay, animationDuration, animationSpeed, cursor);
    const textContent = (0, react_1.useMemo)(() => {
        if (typeof children === "string")
            return children;
        if (typeof children === "number")
            return children.toString();
        return String(children || "");
    }, [children]);
    const detectedScript = (0, hooks_1.useScriptDetection)(textContent);
    const finalScript = script || detectedScript;
    const scriptConfig = scriptConfigs_1.SCRIPT_CONFIGS[finalScript] || scriptConfigs_1.SCRIPT_CONFIGS.Unknown;
    const typographyStyle = theme.typography[variant] || theme.typography.body1;
    const baseFontSize = size === "auto"
        ? typographyStyle.fontSize
        : size || typographyStyle.fontSize;
    const responsiveFontSize = (0, hooks_1.useResponsiveFont)(baseFontSize, responsive ? { min: 10, max: 48 } : undefined);
    const calculatedLineHeight = (0, react_1.useMemo)(() => {
        const baseLineHeight = typographyStyle.lineHeight || baseFontSize * 1.2;
        return baseLineHeight * scriptConfig.lineHeightMultiplier;
    }, [
        typographyStyle.lineHeight,
        baseFontSize,
        scriptConfig.lineHeightMultiplier,
    ]);
    const resolvedColor = (0, react_1.useMemo)(() => {
        if (!color)
            return themedStyles.defaultTextColor;
        if (color in theme.colors) {
            return theme.colors[color];
        }
        return color;
    }, [color, theme.colors, themedStyles.defaultTextColor]);
    const textDirection = (0, react_1.useMemo)(() => {
        if (direction !== "auto")
            return direction;
        return scriptConfig.direction;
    }, [direction, scriptConfig.direction]);
    const computedStyle = (0, react_1.useMemo)(() => {
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
    const spacingStyles = (0, react_1.useMemo)(() => (0, utils_1.createSpacingStyles)({
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
    const finalComputedStyle = (0, react_1.useMemo)(() => ({ ...computedStyle, ...spacingStyles, ...animatedStyle }), [computedStyle, spacingStyles, animatedStyle]);
    const textProps = (0, react_1.useMemo)(() => {
        const props = {
            ...restProps,
            numberOfLines: maxLines ||
                (typeof truncate === "number" ? truncate : numberOfLines),
            ellipsizeMode: truncate || truncateText ? ellipsizeMode || "tail" : ellipsizeMode,
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
            accessibilityRole: restProps.accessibilityRole || (onPress ? "button" : "text"),
            ...props,
        };
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
    const handlePress = (0, react_1.useCallback)((e) => onPress === null || onPress === void 0 ? void 0 : onPress(e), [onPress]);
    const handleLongPress = (0, react_1.useCallback)((e) => onLongPress === null || onLongPress === void 0 ? void 0 : onLongPress(e), [onLongPress]);
    const hasPressHandlers = !!onPress || !!onLongPress;
    const finalConfig = animationConfig || (isAnimationWithConfig(animation) ? animation : {});
    const finalDelay = (_a = finalConfig === null || finalConfig === void 0 ? void 0 : finalConfig.delay) !== null && _a !== void 0 ? _a : animationDelay;
    const finalDuration = (_b = finalConfig === null || finalConfig === void 0 ? void 0 : finalConfig.duration) !== null && _b !== void 0 ? _b : animationDuration;
    const finalSpeed = (_c = finalConfig === null || finalConfig === void 0 ? void 0 : finalConfig.speed) !== null && _c !== void 0 ? _c : animationSpeed;
    // Special animation handling
    if ((animated || animation) && animationType === "typewriter") {
        return (<TypewriterText delay={finalDelay} duration={finalDuration} speed={finalSpeed} cursor={cursor} style={finalComputedStyle}>
            {children}
          </TypewriterText>);
    }
    if ((animated || animation) && animationType === "wave") {
        return (<WaveText delay={finalDelay} duration={finalDuration} style={finalComputedStyle}>
            {children}
          </WaveText>);
    }
    const renderChildren = () => {
        if (!linkDetection || typeof children !== "string")
            return children;
        const urlRegex = /((?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*))/gi;
        const parts = children.split(urlRegex);
        return parts.map((part, i) => {
            if (part.match(urlRegex)) {
                const url = part.match(/^https?:\/\//) ? part : `https://${part}`;
                return (<react_native_1.Text key={`link-${i}`} style={{
                        color: resolvedColor,
                        textDecorationLine: "underline",
                    }} onPress={() => onLinkPress === null || onLinkPress === void 0 ? void 0 : onLinkPress(url)}>
                {part}
              </react_native_1.Text>);
            }
            return part;
        });
    };
    if (animated || (animation && animationType !== "none")) {
        return (<react_native_1.Animated.Text ref={ref} style={finalComputedStyle} {...(!hasPressHandlers
            ? { pointerEvents: "none" }
            : { onPress: handlePress, onLongPress: handleLongPress })} {...textProps}>
            {renderChildren()}
          </react_native_1.Animated.Text>);
    }
    return (<react_native_1.Text ref={ref} style={finalComputedStyle} {...(!hasPressHandlers
        ? { pointerEvents: "none" }
        : { onPress: handlePress, onLongPress: handleLongPress })} {...textProps}>
          {renderChildren()}
        </react_native_1.Text>);
}));
BaseAppText.displayName = "AppText";
const AppText = BaseAppText;
// Legacy variants
AppText.H1 = (0, react_1.memo)((props) => <BaseAppText {...props} variant="h1"/>);
AppText.H2 = (0, react_1.memo)((props) => <BaseAppText {...props} variant="h2"/>);
AppText.H3 = (0, react_1.memo)((props) => <BaseAppText {...props} variant="h3"/>);
AppText.H4 = (0, react_1.memo)((props) => <BaseAppText {...props} variant="h4"/>);
AppText.H5 = (0, react_1.memo)((props) => <BaseAppText {...props} variant="h5"/>);
AppText.H6 = (0, react_1.memo)((props) => <BaseAppText {...props} variant="h6"/>);
AppText.Title = (0, react_1.memo)((props) => <BaseAppText {...props} variant="title"/>);
AppText.Subtitle = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="subtitle1"/>));
AppText.Body = (0, react_1.memo)((props) => <BaseAppText {...props} variant="body1"/>);
AppText.Caption = (0, react_1.memo)((props) => <BaseAppText {...props} variant="caption"/>);
AppText.Code = (0, react_1.memo)((props) => <BaseAppText {...props} variant="code"/>);
// Material Design 3 variants
AppText.DisplayLarge = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="displayLarge"/>));
AppText.DisplayMedium = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="displayMedium"/>));
AppText.DisplaySmall = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="displaySmall"/>));
AppText.HeadlineLarge = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="headlineLarge"/>));
AppText.HeadlineMedium = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="headlineMedium"/>));
AppText.HeadlineSmall = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="headlineSmall"/>));
AppText.TitleLarge = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="titleLarge"/>));
AppText.TitleMedium = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="titleMedium"/>));
AppText.TitleSmall = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="titleSmall"/>));
AppText.BodyLarge = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="bodyLarge"/>));
AppText.BodyMedium = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="bodyMedium"/>));
AppText.BodySmall = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="bodySmall"/>));
AppText.LabelLarge = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="labelLarge"/>));
AppText.LabelMedium = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="labelMedium"/>));
AppText.LabelSmall = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="labelSmall"/>));
AppText.Trans = Trans_1.default;
exports.default = AppText;
