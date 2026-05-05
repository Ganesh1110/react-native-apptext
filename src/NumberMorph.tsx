import React, { useEffect, useRef, useState, forwardRef, useMemo } from "react";
import { Text, Animated, Easing, TextStyle, View, StyleSheet } from "react-native";

interface NumberMorphProps {
  value: number;
  duration?: number;
  easing?: "linear" | "easeIn" | "easeOut" | "easeInOut" | "bounce";
  prefix?: string;
  suffix?: string;
  decimals?: number;
  style?: TextStyle;
  animated?: boolean;
}

interface NumberDigitProps {
  digit: string;
  delay: number;
  duration: number;
  easing: (value: number) => number;
}

const EASING_FUNCTIONS: Record<string, (t: number) => number> = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  bounce: (t) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    }
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  },
};

const AnimatedDigit = React.memo(
  ({ digit, delay, duration, easing }: NumberDigitProps) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const [displayDigit, setDisplayDigit] = useState("0");

    useEffect(() => {
      const startDigit = parseInt(displayDigit, 10) || 0;
      const endDigit = parseInt(digit, 10) || 0;
      const distance = Math.abs(endDigit - startDigit);

      Animated.timing(animatedValue, {
        toValue: endDigit,
        duration: Math.max(duration - delay, 100),
        delay: delay,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();

      const listener = animatedValue.addListener(({ value }) => {
        const currentDigit = Math.round(value) % 10;
        setDisplayDigit(String(currentDigit));
      });

      return () => {
        animatedValue.removeListener(listener);
      };
    }, [digit, delay, duration, animatedValue, displayDigit]);

    return (
      <Animated.View
        style={[
          styles.digitContainer,
          {
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 9],
                  outputRange: [0, -36],
                }),
              },
            ],
          },
        ]}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <Text key={d} style={styles.digitText}>
            {d}
          </Text>
        ))}
        <Text style={[styles.digitText, { position: "absolute" }]}>{displayDigit}</Text>
      </Animated.View>
    );
  }
);

const SimpleNumberMorph = forwardRef<Text, NumberMorphProps>(
  (
    {
      value,
      duration = 1000,
      easing = "easeOut",
      prefix = "",
      suffix = "",
      decimals = 0,
      style,
      animated = true,
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState(0);
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (!animated) {
        setDisplayValue(value);
        return;
      }

      Animated.timing(animatedValue, {
        toValue: value,
        duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start();

      const listener = animatedValue.addListener(({ value: val }) => {
        setDisplayValue(val);
      });

      return () => {
        animatedValue.removeListener(listener);
      };
    }, [value, duration, easing, animated, animatedValue]);

    const formattedValue = useMemo(() => {
      return decimals > 0
        ? displayValue.toFixed(decimals)
        : Math.round(displayValue).toString();
    }, [displayValue, decimals]);

    return (
      <Text ref={ref} style={style}>
        {prefix}
        {formattedValue}
        {suffix}
      </Text>
    );
  }
);

const NumberMorphComponent = forwardRef<Text, NumberMorphProps>(
  (
    {
      value,
      duration = 1500,
      prefix = "",
      suffix = "",
      decimals = 0,
      style,
      animated = true,
    },
    ref
  ) => {
    const [digits, setDigits] = useState<string[]>([]);
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (!animated) {
        const formatted =
          decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
        setDigits(formatted.split(""));
        return;
      }

      const targetStr =
        decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
      const targetDigits = targetStr.split("");

      Animated.timing(animatedValue, {
        toValue: value,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();

      const listener = animatedValue.addListener(({ value: val }) => {
        const currentStr =
          decimals > 0 ? val.toFixed(decimals) : Math.round(val).toString();
        setDigits(currentStr.split("").slice(0, targetDigits.length));
      });

      return () => {
        animatedValue.removeListener(listener);
      };
    }, [value, duration, decimals, animated, animatedValue]);

    if (!digits.length) {
      return <Text ref={ref} style={style}>{prefix}0{suffix}</Text>;
    }

    return (
      <View style={styles.container}>
        {prefix ? <Text style={style}>{prefix}</Text> : null}
        <View style={styles.digitsWrapper}>
          {digits.map((digit, index) => (
            <DigitWheel
              key={index}
              digit={digit}
              delay={index * 50}
              duration={duration}
            />
          ))}
        </View>
        {suffix ? <Text style={style}>{suffix}</Text> : null}
      </View>
    );
  }
);

interface DigitWheelProps {
  digit: string;
  delay: number;
  duration: number;
}

const DigitWheel = ({ digit, delay, duration }: DigitWheelProps) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const [currentDigit, setCurrentDigit] = useState("0");

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: parseInt(digit, 10) || 0,
      duration: Math.max(duration - delay, 100),
      delay: delay,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    const listener = animValue.addListener(({ value }) => {
      setCurrentDigit(Math.round(value).toString());
    });

    return () => {
      animValue.removeListener(listener);
    };
  }, [digit, delay, duration, animValue]);

  return (
    <Animated.Text
      style={[
        styles.digitWheel,
        {
          transform: [
            {
              translateY: animValue.interpolate({
                inputRange: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                outputRange: [0, -20, -40, -60, -80, -100, -120, -140, -160, -180],
              }),
            },
          ],
        },
      ]}
    >
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
        <Text key={d} style={styles.wheelDigit}>
          {d}
        </Text>
      ))}
      <Text style={styles.wheelDigit}>{currentDigit}</Text>
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  digitsWrapper: {
    flexDirection: "row",
  },
  digitContainer: {
    width: 20,
    height: 40,
    overflow: "hidden",
    alignItems: "center",
  },
  digitText: {
    fontSize: 24,
    lineHeight: 40,
    height: 40,
  },
  digitWheel: {
    fontSize: 24,
    lineHeight: 20,
    height: 20,
  },
  wheelDigit: {
    fontSize: 24,
    lineHeight: 20,
    height: 20,
  },
});

export type { NumberMorphProps };
export { SimpleNumberMorph as NumberMorph };
export const MorphNumber = SimpleNumberMorph;