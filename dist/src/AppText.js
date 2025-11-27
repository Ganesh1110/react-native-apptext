import React, { forwardRef, memo, useCallback, useMemo, useEffect, useRef, useState, } from "react";
import { Text, Animated, useColorScheme, View, } from "react-native";
import { SCRIPT_CONFIGS } from "./scriptConfigs";
import { DEFAULT_THEME } from "./theme";
import { useResponsiveFont, useScriptDetection, useThemedStyles, } from "./hooks";
import { AppTextProvider, useAppTextTheme } from "./context";
import { createSpacingStyles } from "./utils";
import TransComponent from "./Trans";
/* ========== Animation Hook ========== */
const useTextAnimation = (animated, animation, animationDelay = 0, animationDuration = 1000, animationSpeed = 50, cursor = false) => {
    const opacityValue = useRef(new Animated.Value(0)).current;
    const translateYValue = useRef(new Animated.Value(50)).current;
    const translateXValue = useRef(new Animated.Value(100)).current;
    const scaleValue = useRef(new Animated.Value(0.8)).current;
    const rotateValue = useRef(new Animated.Value(0)).current;
    const shakeValue = useRef(new Animated.Value(0)).current;
    const glowValue = useRef(new Animated.Value(0)).current;
    const hasAnimated = useRef(false);
    useEffect(() => {
        if ((animated || animation) && !hasAnimated.current) {
            const config = typeof animation === "object" ? animation : {};
            const type = config.type || "fade";
            const duration = config.duration || animationDuration;
            const delay = config.delay || animationDelay;
            // Reset values first
            opacityValue.setValue(0);
            translateYValue.setValue(50);
            translateXValue.setValue(100);
            scaleValue.setValue(0.8);
            rotateValue.setValue(0);
            shakeValue.setValue(0);
            glowValue.setValue(0);
            let animationPromise;
            switch (type) {
                // === ENTRANCE ANIMATIONS ===
                case "fade":
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
                    animationPromise = Animated.parallel([
                        Animated.timing(opacityValue, {
                            toValue: 1,
                            duration,
                            delay,
                            useNativeDriver: true,
                        }),
                        Animated.spring(scaleValue, {
                            toValue: 1,
                            friction: 8,
                            tension: 40,
                            useNativeDriver: true,
                        }),
                    ]);
                    break;
                case "zoomIn":
                    scaleValue.setValue(0.3);
                    animationPromise = Animated.parallel([
                        Animated.timing(opacityValue, {
                            toValue: 1,
                            duration,
                            delay,
                            useNativeDriver: true,
                        }),
                        Animated.spring(scaleValue, {
                            toValue: 1,
                            friction: 3,
                            tension: 40,
                            useNativeDriver: true,
                        }),
                    ]);
                    break;
                case "flipInX":
                    rotateValue.setValue(-90);
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
                    rotateValue.setValue(90);
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
                // === ATTENTION ANIMATIONS (Looping) ===
                case "pulse":
                    hasAnimated.current = true; // Don't block looping animations
                    animationPromise = Animated.loop(Animated.sequence([
                        Animated.timing(scaleValue, {
                            toValue: 1.1,
                            duration: 500,
                            useNativeDriver: true,
                        }),
                        Animated.timing(scaleValue, {
                            toValue: 1,
                            duration: 500,
                            useNativeDriver: true,
                        }),
                    ]));
                    break;
                case "bounce":
                    hasAnimated.current = true;
                    animationPromise = Animated.loop(Animated.sequence([
                        Animated.timing(translateYValue, {
                            toValue: -10,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.timing(translateYValue, {
                            toValue: 0,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                    ]));
                    break;
                case "shake":
                    hasAnimated.current = true;
                    animationPromise = Animated.loop(Animated.sequence([
                        Animated.timing(shakeValue, {
                            toValue: 10,
                            duration: 50,
                            useNativeDriver: true,
                        }),
                        Animated.timing(shakeValue, {
                            toValue: -10,
                            duration: 100,
                            useNativeDriver: true,
                        }),
                        Animated.timing(shakeValue, {
                            toValue: 10,
                            duration: 100,
                            useNativeDriver: true,
                        }),
                        Animated.timing(shakeValue, {
                            toValue: -10,
                            duration: 100,
                            useNativeDriver: true,
                        }),
                        Animated.timing(shakeValue, {
                            toValue: 0,
                            duration: 50,
                            useNativeDriver: true,
                        }),
                    ]));
                    break;
                case "swing":
                    hasAnimated.current = true;
                    animationPromise = Animated.loop(Animated.sequence([
                        Animated.timing(rotateValue, {
                            toValue: 10,
                            duration: 200,
                            useNativeDriver: true,
                        }),
                        Animated.timing(rotateValue, {
                            toValue: -10,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                        Animated.timing(rotateValue, {
                            toValue: 0,
                            duration: 200,
                            useNativeDriver: true,
                        }),
                    ]));
                    break;
                case "wobble":
                    hasAnimated.current = true;
                    animationPromise = Animated.loop(Animated.sequence([
                        Animated.timing(rotateValue, {
                            toValue: -5,
                            duration: 100,
                            useNativeDriver: true,
                        }),
                        Animated.timing(rotateValue, {
                            toValue: 5,
                            duration: 100,
                            useNativeDriver: true,
                        }),
                        Animated.timing(rotateValue, {
                            toValue: -3,
                            duration: 100,
                            useNativeDriver: true,
                        }),
                        Animated.timing(rotateValue, {
                            toValue: 3,
                            duration: 100,
                            useNativeDriver: true,
                        }),
                        Animated.timing(rotateValue, {
                            toValue: 0,
                            duration: 100,
                            useNativeDriver: true,
                        }),
                    ]));
                    break;
                case "rubberBand":
                    hasAnimated.current = true;
                    animationPromise = Animated.loop(Animated.sequence([
                        Animated.timing(scaleValue, {
                            toValue: 1.25,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.timing(scaleValue, {
                            toValue: 0.75,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.timing(scaleValue, {
                            toValue: 1.15,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.timing(scaleValue, {
                            toValue: 1,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                    ]));
                    break;
                case "tada":
                    hasAnimated.current = true;
                    animationPromise = Animated.loop(Animated.sequence([
                        Animated.timing(scaleValue, {
                            toValue: 0.9,
                            duration: 100,
                            useNativeDriver: true,
                        }),
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
                            toValue: 3,
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
                    opacityValue.setValue(1);
                    scaleValue.setValue(1);
                    animationPromise = Animated.parallel([
                        Animated.timing(opacityValue, {
                            toValue: 0,
                            duration,
                            delay,
                            useNativeDriver: true,
                        }),
                        Animated.spring(scaleValue, {
                            toValue: 0.3,
                            friction: 3,
                            tension: 40,
                            useNativeDriver: true,
                        }),
                    ]);
                    break;
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
                        Animated.spring(scaleValue, {
                            toValue: 0.3,
                            friction: 3,
                            tension: 40,
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
                            toValue: -90,
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
                    hasAnimated.current = true;
                    animationPromise = Animated.loop(Animated.sequence([
                        Animated.timing(opacityValue, {
                            toValue: 1,
                            duration: 500,
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacityValue, {
                            toValue: 0.3,
                            duration: 500,
                            useNativeDriver: true,
                        }),
                    ]));
                    break;
                case "glow":
                    hasAnimated.current = true;
                    animationPromise = Animated.loop(Animated.sequence([
                        Animated.timing(glowValue, {
                            toValue: 1,
                            duration: 1000,
                            useNativeDriver: false,
                        }),
                        Animated.timing(glowValue, {
                            toValue: 0,
                            duration: 1000,
                            useNativeDriver: false,
                        }),
                    ]));
                    break;
                case "wave":
                    hasAnimated.current = true;
                    // Wave effect would need more complex per-character animation
                    animationPromise = Animated.timing(opacityValue, {
                        toValue: 1,
                        duration,
                        delay,
                        useNativeDriver: true,
                    });
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
                hasAnimated.current = true;
                animationPromise.start();
            }
        }
    }, []);
    const getAnimatedStyle = () => {
        if (!animated && !animation)
            return {};
        const config = typeof animation === "object" ? animation : {};
        const type = config.type || "fade";
        switch (type) {
            // === ENTRANCE ANIMATIONS ===
            case "fade":
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
                                inputRange: [90, 0],
                                outputRange: ["90deg", "0deg"],
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
                                inputRange: [0, -90],
                                outputRange: ["0deg", "-90deg"],
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
            case "wave":
                return { opacity: opacityValue };
            default:
                return { opacity: opacityValue };
        }
    };
    return {
        animatedStyle: getAnimatedStyle(),
        animationType: typeof animation === "object" ? animation.type : "fade",
    };
};
const TypewriterText = memo(({ children, delay = 0, duration = 2000, speed = 50, cursor = false, style, }) => {
    const [displayText, setDisplayText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const text = useMemo(() => {
        return React.Children.toArray(children)
            .filter((child) => typeof child === "string")
            .join("");
    }, [children]);
    useEffect(() => {
        setDisplayText("");
        setCurrentIndex(0);
    }, [text]);
    useEffect(() => {
        if (currentIndex <= text.length) {
            const timer = setTimeout(() => {
                setDisplayText(text.substring(0, currentIndex));
                setCurrentIndex((prev) => prev + 1);
            }, speed);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, text, speed, delay]);
    // Handle initial delay
    useEffect(() => {
        if (delay > 0) {
            const timer = setTimeout(() => {
                setCurrentIndex(1);
            }, delay);
            return () => clearTimeout(timer);
        }
        else {
            setCurrentIndex(1);
        }
    }, [delay]);
    return (<Text style={style}>
        {displayText}
        {cursor && currentIndex <= text.length && (<Text style={{ color: style.color }}>|</Text>)}
      </Text>);
});
const TruncationComponent = memo(({ children, maxLines, onExpand, expandText = "Read more", collapseText = "Read less", style, }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [isTruncated, setIsTruncated] = React.useState(false);
    const handleTextLayout = useCallback((event) => {
        setIsTruncated(event.nativeEvent.lines.length > maxLines);
    }, [maxLines]);
    const handleToggle = useCallback(() => {
        setIsExpanded(!isExpanded);
        onExpand === null || onExpand === void 0 ? void 0 : onExpand();
    }, [isExpanded, onExpand]);
    return (<View>
        <Text style={style} numberOfLines={isExpanded ? undefined : maxLines} onTextLayout={handleTextLayout}>
          {children}
          {isTruncated && !isExpanded && "... "}
        </Text>
        {isTruncated && (<Text style={[style, { color: "#007AFF", marginTop: 4 }]} onPress={handleToggle}>
            {isExpanded ? collapseText : expandText}
          </Text>)}
      </View>);
});
/* ========== Main Component ========== */
const BaseAppText = memo(forwardRef(({ children, variant = "body1", color, size, weight, align, transform, decoration, italic = false, truncate = false, shadow = false, animated = false, animation, animationDelay = 0, animationDuration = 1000, animationSpeed = 50, cursor = false, script, direction = "auto", responsive = true, style: propStyle, testID, m, mt, mr, mb, ml, mx, my, p, pt, pr, pb, pl, px, py, numberOfLines, ellipsizeMode, onPress, onLongPress, allowFontScaling, maxFontSizeMultiplier, minimumFontScale, suppressHighlighting, selectable, selectionColor, textBreakStrategy, hyphenationFrequency, ...restProps }, ref) => {
    const theme = useAppTextTheme();
    const rawScheme = useColorScheme();
    const colorScheme = rawScheme === "unspecified" ? "light" : rawScheme;
    const themedStyles = useThemedStyles(theme, colorScheme);
    // Animation hook (for non-typewriter animations)
    const { animatedStyle, animationType } = useTextAnimation(animated &&
        (typeof animation === "boolean"
            ? animation
            : (animation === null || animation === void 0 ? void 0 : animation.type) !== "typewriter"), typeof animation === "object" && (animation === null || animation === void 0 ? void 0 : animation.type) !== "typewriter"
        ? animation
        : undefined, animationDelay, animationDuration, animationSpeed, cursor);
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
    const responsiveFontSize = useResponsiveFont(baseFontSize, responsive ? { min: 10, max: 48 } : undefined);
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
    const finalComputedStyle = useMemo(() => ({ ...computedStyle, ...spacingStyles, ...animatedStyle }), [computedStyle, spacingStyles, animatedStyle]);
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
        };
        return {
            ...props,
            accessibilityRole: "text",
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
    ]);
    const handlePress = useCallback((e) => onPress === null || onPress === void 0 ? void 0 : onPress(e), [onPress]);
    const handleLongPress = useCallback((e) => onLongPress === null || onLongPress === void 0 ? void 0 : onLongPress(e), [onLongPress]);
    const hasPressHandlers = !!onPress || !!onLongPress;
    // Handle typewriter animation separately
    if (typeof animation === "object" &&
        (animation === null || animation === void 0 ? void 0 : animation.type) === "typewriter" &&
        (animated || animation)) {
        return (<TypewriterText delay={animationDelay} duration={animationDuration} speed={animationSpeed} cursor={cursor} style={finalComputedStyle}>
            {children}
          </TypewriterText>);
    }
    if (animated || animation) {
        return (<Animated.Text ref={ref} style={finalComputedStyle} {...(!hasPressHandlers
            ? { pointerEvents: "none" }
            : { onPress: handlePress, onLongPress: handleLongPress })} {...textProps}>
            {children}
          </Animated.Text>);
    }
    return (<Text ref={ref} style={finalComputedStyle} {...(!hasPressHandlers
        ? { pointerEvents: "none" }
        : { onPress: handlePress, onLongPress: handleLongPress })} {...textProps}>
          {children}
        </Text>);
}));
BaseAppText.displayName = "AppText";
const AppText = BaseAppText;
// Legacy variants
AppText.H1 = memo((props) => <BaseAppText {...props} variant="h1"/>);
AppText.H2 = memo((props) => <BaseAppText {...props} variant="h2"/>);
AppText.H3 = memo((props) => <BaseAppText {...props} variant="h3"/>);
AppText.H4 = memo((props) => <BaseAppText {...props} variant="h4"/>);
AppText.H5 = memo((props) => <BaseAppText {...props} variant="h5"/>);
AppText.H6 = memo((props) => <BaseAppText {...props} variant="h6"/>);
AppText.Title = memo((props) => <BaseAppText {...props} variant="title"/>);
AppText.Subtitle = memo((props) => (<BaseAppText {...props} variant="subtitle1"/>));
AppText.Body = memo((props) => <BaseAppText {...props} variant="body1"/>);
AppText.Caption = memo((props) => <BaseAppText {...props} variant="caption"/>);
AppText.Code = memo((props) => <BaseAppText {...props} variant="code"/>);
// Material Design 3 variants
AppText.DisplayLarge = memo((props) => (<BaseAppText {...props} variant="displayLarge"/>));
AppText.DisplayMedium = memo((props) => (<BaseAppText {...props} variant="displayMedium"/>));
AppText.DisplaySmall = memo((props) => (<BaseAppText {...props} variant="displaySmall"/>));
AppText.HeadlineLarge = memo((props) => (<BaseAppText {...props} variant="headlineLarge"/>));
AppText.HeadlineMedium = memo((props) => (<BaseAppText {...props} variant="headlineMedium"/>));
AppText.HeadlineSmall = memo((props) => (<BaseAppText {...props} variant="headlineSmall"/>));
AppText.TitleLarge = memo((props) => (<BaseAppText {...props} variant="titleLarge"/>));
AppText.TitleMedium = memo((props) => (<BaseAppText {...props} variant="titleMedium"/>));
AppText.TitleSmall = memo((props) => (<BaseAppText {...props} variant="titleSmall"/>));
AppText.BodyLarge = memo((props) => (<BaseAppText {...props} variant="bodyLarge"/>));
AppText.BodyMedium = memo((props) => (<BaseAppText {...props} variant="bodyMedium"/>));
AppText.BodySmall = memo((props) => (<BaseAppText {...props} variant="bodySmall"/>));
AppText.LabelLarge = memo((props) => (<BaseAppText {...props} variant="labelLarge"/>));
AppText.LabelMedium = memo((props) => (<BaseAppText {...props} variant="labelMedium"/>));
AppText.LabelSmall = memo((props) => (<BaseAppText {...props} variant="labelSmall"/>));
AppText.Trans = TransComponent;
export default AppText;
export { AppTextProvider, useAppTextTheme, useResponsiveFont, useScriptDetection, SCRIPT_CONFIGS, DEFAULT_THEME, TransComponent as Trans, };
