import React, { memo, useMemo, useRef, useEffect } from "react";
import { Text, Animated, TextStyle } from "react-native";

interface WaveTextProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style: TextStyle;
}

export const WaveText = memo<WaveTextProps>(
  ({ children, duration = 1000, delay = 0, style }) => {
    const text = useMemo(() => {
      const extractText = (node: React.ReactNode): string => {
        if (typeof node === "string" || typeof node === "number") {
          return String(node);
        }
        if (React.isValidElement(node)) {
          return extractText((node.props as any).children);
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
