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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaveText = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
exports.WaveText = (0, react_1.memo)(({ children, duration = 1000, delay = 0, style }) => {
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
