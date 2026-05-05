import React, { useMemo, forwardRef } from "react";
import { Text, View, TextStyle, StyleSheet } from "react-native";

interface GradientTextProps {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  locations?: number[];
  children: React.ReactNode;
  style?: TextStyle;
  animated?: boolean;
}

interface LinearGradientProps {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  locations?: number[];
  children: React.ReactNode;
  style?: object;
}

let MaskedView: any = null;
let LinearGradient: any = null;

try {
  MaskedView = require("@react-native-community/masked-view").MaskedView;
} catch {
  // MaskedView not available - will use fallback
}

try {
  LinearGradient = require("react-native-linear-gradient").default;
} catch {
  // LinearGradient not available - will use fallback
}

const GradientTextComponent = forwardRef<Text, GradientTextProps>(
  (
    {
      colors,
      start = { x: 0, y: 0 },
      end = { x: 1, y: 0 },
      locations,
      children,
      style,
    },
    ref
  ) => {
    const gradientColors = useMemo(() => {
      if (!colors || colors.length < 2) {
        return ["#000", "#000"];
      }
      return colors;
    }, [colors]);

    const hasGradientSupport = MaskedView && LinearGradient;

    if (!hasGradientSupport) {
      return (
        <Text ref={ref} style={style}>
          {children}
        </Text>
      );
    }

    const textContent = typeof children === "string" ? children : String(children);

    return (
      <MaskedView
        element={Text}
        maskElement={
          <Text ref={ref} style={style}>
            {textContent}
          </Text>
        }
      >
        <LinearGradient
          colors={gradientColors}
          start={start}
          end={end}
          locations={locations}
          style={[style]}
        >
          <Text style={[style, { opacity: 0 }]}>{textContent}</Text>
        </LinearGradient>
      </MaskedView>
    );
  }
);

GradientTextComponent.displayName = "GradientText";

export type { GradientTextProps };

export const GradientText = GradientTextComponent;

export const isGradientSupported = (): boolean => {
  return !!(MaskedView && LinearGradient);
};

export const GradientTextPlaceholder: React.FC<{ colors?: string[] }> = ({
  colors = ["#666", "#999"],
}) => (
  <View style={styles.placeholder}>
    <Text style={[styles.placeholderText, { color: colors[0] }]}>
      Install @react-native-community/masked-view and react-native-linear-gradient for gradient text
    </Text>
  </View>
);

const styles = StyleSheet.create({
  placeholder: {
    padding: 8,
  },
  placeholderText: {
    fontSize: 12,
    textAlign: "center",
  },
});