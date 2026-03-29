import React, { memo, useState, useMemo, useEffect } from "react";
import { Text, AccessibilityInfo } from "react-native";
import { useReducedMotion } from "../hooks";
export const TypewriterText = memo(({ children, delay = 0, duration = 2000, speed = 50, cursor = false, style, announceCompletion = true, }) => {
    const reducedMotion = useReducedMotion();
    const [displayText, setDisplayText] = useState("");
    const [isDone, setIsDone] = useState(false);
    const [, setCurrentIndex] = useState(0);
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
    const fullText = useMemo(() => {
        if (typeof children === "string")
            return children;
        if (typeof children === "number")
            return String(children);
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
    useEffect(() => {
        if (isDone && announceCompletion && !reducedMotion) {
            AccessibilityInfo.announceForAccessibility(`Text fully displayed: ${fullText}`);
        }
    }, [isDone, announceCompletion, reducedMotion, fullText]);
    const accessibilityLabel = useMemo(() => {
        return isDone ? fullText : `${fullText}, typing in progress`;
    }, [fullText, isDone]);
    return (<Text style={style} accessibilityLabel={accessibilityLabel} accessibilityLiveRegion="polite" accessibilityState={{ busy: !isDone, disabled: false }}>
        {reducedMotion ? text : displayText}
        {cursor && !isDone && !reducedMotion && (<Text style={{ color: style.color }}>|</Text>)}
      </Text>);
});
