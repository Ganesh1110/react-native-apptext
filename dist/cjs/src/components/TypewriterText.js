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
exports.TypewriterText = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const hooks_1 = require("../hooks");
exports.TypewriterText = (0, react_1.memo)(({ children, delay = 0, duration = 2000, speed = 50, cursor = false, style, announceCompletion = true, }) => {
    const reducedMotion = (0, hooks_1.useReducedMotion)();
    const [displayText, setDisplayText] = (0, react_1.useState)("");
    const [isDone, setIsDone] = (0, react_1.useState)(false);
    const [, setCurrentIndex] = (0, react_1.useState)(0);
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
