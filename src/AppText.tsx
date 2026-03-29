import React, {
  forwardRef,
  memo,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Text,
  Animated,
  useColorScheme,
  View,
  NativeSyntheticEvent,
  TextLayoutEventData,
  AccessibilityRole,
  TextStyle,
  AccessibilityInfo,
  TextProps,
} from "react-native";

import {
  AppTextProps,
  AppTextTheme,
  TypographyVariant,
  AnimationType,
  AnimationConfig,
} from "./types";

type AnimationStyle = TextStyle;

import { SCRIPT_CONFIGS } from "./scriptConfigs";
import { DEFAULT_THEME } from "./theme";
import {
  useResponsiveFont,
  useScriptDetection,
  useThemedStyles,
  useReducedMotion,
  useDynamicTypeScale,
} from "./hooks";
import { AppTextProvider, useAppTextTheme } from "./context";
import { createSpacingStyles } from "./utils";
import TransComponent from "./Trans";

/* ========== Animation Hook ========== */
import { useTextAnimation, isAnimationWithConfig } from "./animations/useTextAnimation";

/* ========== Sub Components ========== */
import { TypewriterText } from "./components/TypewriterText";
import { TruncationComponent } from "./components/TruncationComponent";
import { WaveText } from "./components/WaveText";






/* ========== Main Component ========== */
const BaseAppText = memo(
  forwardRef<Text, AppTextProps>(
    (
      {
        children,
        variant = "body1",
        color,
        size,
        weight,
        align,
        transform,
        decoration,
        italic = false,
        truncate = false,
        maxLines,
        truncateText = false,
        expandText,
        collapseText,
        shadow = false,
        animated = false,
        animation,
        animationConfig,
        animationDelay = 0,
        animationDuration = 1000,
        animationSpeed = 50,
        cursor = false,
        script,
        direction = "auto",
        responsive = true,
        style: propStyle,
        testID,
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
        numberOfLines,
        ellipsizeMode,
        onPress,
        onLongPress,
        allowFontScaling,
        maxFontSizeMultiplier,
        minimumFontScale,
        suppressHighlighting,
        selectable,
        selectionColor,
        textBreakStrategy,
        hyphenationFrequency,
        accessibilityLabel,
        accessibilityHint,
        accessibilityLiveRegion,
        accessibilityState,
        accessibilityActions,
        onAccessibilityAction,
        linkDetection = false,
        onLinkPress,
        ...restProps
      },
      ref,
    ) => {
      const theme = useAppTextTheme();
      const rawScheme = useColorScheme();
      const colorScheme = rawScheme === "unspecified" ? "light" : rawScheme;
      const themedStyles = useThemedStyles(theme, colorScheme);
      const fontScaling = useDynamicTypeScale(
        allowFontScaling,
        minimumFontScale,
        maxFontSizeMultiplier,
      );

      // Animation hook
      const { animatedStyle, animationType } = useTextAnimation(
        animated,
        animation,
        animationConfig,
        animationDelay,
        animationDuration,
        animationSpeed,
        cursor,
      );

      const textContent = useMemo(() => {
        if (typeof children === "string") return children;
        if (typeof children === "number") return children.toString();
        return String(children || "");
      }, [children]);

      const detectedScript = useScriptDetection(textContent);
      const finalScript = script || detectedScript;
      const scriptConfig =
        SCRIPT_CONFIGS[finalScript] || SCRIPT_CONFIGS.Unknown;

      const typographyStyle =
        theme.typography[variant] || theme.typography.body1;
      const baseFontSize =
        size === "auto"
          ? typographyStyle.fontSize
          : size || typographyStyle.fontSize;
      const responsiveFontSize = useResponsiveFont(
        baseFontSize,
        responsive ? { min: 10, max: 48 } : undefined,
      );

      const calculatedLineHeight = useMemo(() => {
        const baseLineHeight = typographyStyle.lineHeight || baseFontSize * 1.2;
        return baseLineHeight * scriptConfig.lineHeightMultiplier;
      }, [
        typographyStyle.lineHeight,
        baseFontSize,
        scriptConfig.lineHeightMultiplier,
      ]);

      const resolvedColor = useMemo((): string => {
        if (!color) return themedStyles.defaultTextColor;
        if (color in theme.colors) {
          return theme.colors[color as keyof typeof theme.colors];
        }
        return color as string;
      }, [color, theme.colors, themedStyles.defaultTextColor]);

      const textDirection = useMemo(() => {
        if (direction !== "auto") return direction;
        return scriptConfig.direction;
      }, [direction, scriptConfig.direction]);

      const computedStyle = useMemo((): TextStyle => {
        const baseStyle: TextStyle = {
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

      const spacingStyles = useMemo(
        () =>
          createSpacingStyles({
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
          }),
        [m, mt, mr, mb, ml, mx, my, p, pt, pr, pb, pl, px, py],
      );

      const finalComputedStyle = useMemo(
        () => ({ ...computedStyle, ...spacingStyles, ...animatedStyle }),
        [computedStyle, spacingStyles, animatedStyle],
      );

      const textProps = useMemo(() => {
        const props = {
          ...restProps,
          numberOfLines:
            maxLines ||
            (typeof truncate === "number" ? truncate : numberOfLines),
          ellipsizeMode:
            truncate || truncateText ? ellipsizeMode || "tail" : ellipsizeMode,
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
          accessibilityRole:
            restProps.accessibilityRole || (onPress ? "button" : "text"),
          ...props,
        } as TextProps;
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

      const handlePress = useCallback(
        (e: NativeSyntheticEvent<any>) => onPress?.(e),
        [onPress],
      );
      const handleLongPress = useCallback(
        (e: NativeSyntheticEvent<any>) => onLongPress?.(e),
        [onLongPress],
      );

      const hasPressHandlers = !!onPress || !!onLongPress;
      const finalConfig =
        animationConfig || (isAnimationWithConfig(animation) ? animation : {});
      const finalDelay = finalConfig?.delay ?? animationDelay;
      const finalDuration = finalConfig?.duration ?? animationDuration;
      const finalSpeed = finalConfig?.speed ?? animationSpeed;

      // Special animation handling
      if ((animated || animation) && animationType === "typewriter") {
        return (
          <TypewriterText
            delay={finalDelay}
            duration={finalDuration}
            speed={finalSpeed}
            cursor={cursor}
            style={finalComputedStyle}
          >
            {children}
          </TypewriterText>
        );
      }

      if ((animated || animation) && animationType === "wave") {
        return (
          <WaveText
            delay={finalDelay}
            duration={finalDuration}
            style={finalComputedStyle}
          >
            {children}
          </WaveText>
        );
      }

      if (truncateText && (maxLines || typeof truncate === "number")) {
        const resolvedMaxLines =
          maxLines || (typeof truncate === "number" ? truncate : 3);
        return (
          <TruncationComponent
            maxLines={resolvedMaxLines}
            style={finalComputedStyle}
            expandText={expandText}
            collapseText={collapseText}
          >
            {textContent}
          </TruncationComponent>
        );
      }

      const renderChildren = () => {
        if (!linkDetection || typeof children !== "string") return children;

        const urlRegex =
          /((?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*))/gi;
        const parts = children.split(urlRegex);

        return parts.map((part, i) => {
          if (part.match(urlRegex)) {
            const url = part.match(/^https?:\/\//) ? part : `https://${part}`;
            return (
              <Text
                key={`link-${i}`}
                style={{
                  color: resolvedColor,
                  textDecorationLine: "underline",
                }}
                onPress={() => onLinkPress?.(url)}
              >
                {part}
              </Text>
            );
          }
          return part;
        });
      };

      if (animated || (animation && animationType !== "none")) {
        return (
          <Animated.Text
            ref={ref}
            style={finalComputedStyle}
            {...(!hasPressHandlers
              ? { pointerEvents: "none" }
              : { onPress: handlePress, onLongPress: handleLongPress })}
            {...textProps}
          >
            {renderChildren()}
          </Animated.Text>
        );
      }

      return (
        <Text
          ref={ref}
          style={finalComputedStyle}
          {...(!hasPressHandlers
            ? { pointerEvents: "none" }
            : { onPress: handlePress, onLongPress: handleLongPress })}
          {...textProps}
        >
          {renderChildren()}
        </Text>
      );
    },
  ),
);

BaseAppText.displayName = "AppText";

/* ========== Compound Components ========== */
type VariantFC = React.FC<Omit<AppTextProps, "variant">>;
type AppTextCompound = typeof BaseAppText & {
  // Legacy variants
  H1: VariantFC;
  H2: VariantFC;
  H3: VariantFC;
  H4: VariantFC;
  H5: VariantFC;
  H6: VariantFC;
  Title: VariantFC;
  Subtitle: VariantFC;
  Body: VariantFC;
  Caption: VariantFC;
  Code: VariantFC;

  // Material Design 3 variants
  DisplayLarge: VariantFC;
  DisplayMedium: VariantFC;
  DisplaySmall: VariantFC;
  HeadlineLarge: VariantFC;
  HeadlineMedium: VariantFC;
  HeadlineSmall: VariantFC;
  TitleLarge: VariantFC;
  TitleMedium: VariantFC;
  TitleSmall: VariantFC;
  BodyLarge: VariantFC;
  BodyMedium: VariantFC;
  BodySmall: VariantFC;
  LabelLarge: VariantFC;
  LabelMedium: VariantFC;
  LabelSmall: VariantFC;

  // Trans component
  Trans: typeof TransComponent;
};

const AppText = BaseAppText as AppTextCompound;

// Legacy variants
AppText.H1 = memo((props) => <BaseAppText {...props} variant="h1" />);
AppText.H2 = memo((props) => <BaseAppText {...props} variant="h2" />);
AppText.H3 = memo((props) => <BaseAppText {...props} variant="h3" />);
AppText.H4 = memo((props) => <BaseAppText {...props} variant="h4" />);
AppText.H5 = memo((props) => <BaseAppText {...props} variant="h5" />);
AppText.H6 = memo((props) => <BaseAppText {...props} variant="h6" />);
AppText.Title = memo((props) => <BaseAppText {...props} variant="title" />);
AppText.Subtitle = memo((props) => (
  <BaseAppText {...props} variant="subtitle1" />
));
AppText.Body = memo((props) => <BaseAppText {...props} variant="body1" />);
AppText.Caption = memo((props) => <BaseAppText {...props} variant="caption" />);
AppText.Code = memo((props) => <BaseAppText {...props} variant="code" />);

// Material Design 3 variants
AppText.DisplayLarge = memo((props) => (
  <BaseAppText {...props} variant="displayLarge" />
));
AppText.DisplayMedium = memo((props) => (
  <BaseAppText {...props} variant="displayMedium" />
));
AppText.DisplaySmall = memo((props) => (
  <BaseAppText {...props} variant="displaySmall" />
));
AppText.HeadlineLarge = memo((props) => (
  <BaseAppText {...props} variant="headlineLarge" />
));
AppText.HeadlineMedium = memo((props) => (
  <BaseAppText {...props} variant="headlineMedium" />
));
AppText.HeadlineSmall = memo((props) => (
  <BaseAppText {...props} variant="headlineSmall" />
));
AppText.TitleLarge = memo((props) => (
  <BaseAppText {...props} variant="titleLarge" />
));
AppText.TitleMedium = memo((props) => (
  <BaseAppText {...props} variant="titleMedium" />
));
AppText.TitleSmall = memo((props) => (
  <BaseAppText {...props} variant="titleSmall" />
));
AppText.BodyLarge = memo((props) => (
  <BaseAppText {...props} variant="bodyLarge" />
));
AppText.BodyMedium = memo((props) => (
  <BaseAppText {...props} variant="bodyMedium" />
));
AppText.BodySmall = memo((props) => (
  <BaseAppText {...props} variant="bodySmall" />
));
AppText.LabelLarge = memo((props) => (
  <BaseAppText {...props} variant="labelLarge" />
));
AppText.LabelMedium = memo((props) => (
  <BaseAppText {...props} variant="labelMedium" />
));
AppText.LabelSmall = memo((props) => (
  <BaseAppText {...props} variant="labelSmall" />
));

AppText.Trans = TransComponent;

export default AppText;
export {
  AppTextProvider,
  useAppTextTheme,
  useResponsiveFont,
  useScriptDetection,
  SCRIPT_CONFIGS,
  DEFAULT_THEME,
  TransComponent as Trans,
};
export type { AppTextProps, AppTextTheme, TypographyVariant };
