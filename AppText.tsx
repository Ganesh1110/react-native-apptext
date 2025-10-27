import React, { forwardRef, memo, useCallback, useMemo } from "react";
import {
  Text,
  View,
  NativeSyntheticEvent,
  TextLayoutEventData,
  AccessibilityRole,
  useColorScheme,
} from "react-native";

import { AppTextProps, AppTextTheme, TypographyVariant } from "./types";
import { DEFAULT_THEME } from "./theme";
import { useResponsiveFont, useThemedStyles } from "./hooks";
import { AppTextProvider, useAppTextTheme } from "./context";
import { createSpacingStyles } from "./utils";

/* ========== Truncation Component ========== */
interface TruncationProps {
  children: string;
  maxLines: number;
  onExpand?: () => void;
  expandText?: string;
  collapseText?: string;
  style?: any;
}

const TruncationComponent = memo<TruncationProps>(
  ({
    children,
    maxLines,
    onExpand,
    expandText = "Read more",
    collapseText = "Read less",
    style,
  }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [isTruncated, setIsTruncated] = React.useState(false);

    const handleTextLayout = useCallback(
      (event: NativeSyntheticEvent<TextLayoutEventData>) => {
        setIsTruncated(event.nativeEvent.lines.length > maxLines);
      },
      [maxLines]
    );

    const handleToggle = useCallback(() => {
      setIsExpanded(!isExpanded);
      onExpand?.();
    }, [isExpanded, onExpand]);

    return (
      <View>
        <Text
          style={style}
          numberOfLines={isExpanded ? undefined : maxLines}
          onTextLayout={handleTextLayout}
        >
          {children}
        </Text>
        {isTruncated && (
          <Text style={[style, { color: "#007AFF" }]} onPress={handleToggle}>
            {isExpanded ? collapseText : expandText}
          </Text>
        )}
      </View>
    );
  }
);

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
        expandText,
        collapseText,
        truncate = false,
        shadow = false,
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
        ...restProps
      },
      ref
    ) => {
      const theme = useAppTextTheme();
      const rawScheme = useColorScheme();
      const colorScheme = rawScheme === "unspecified" ? "light" : rawScheme;
      const themedStyles = useThemedStyles(theme, colorScheme);

      const textContent = useMemo(() => {
        if (typeof children === "string") return children;
        if (typeof children === "number") return children.toString();
        return String(children || "");
      }, [children]);

      const typographyStyle =
        theme.typography[variant] || theme.typography.body1;
      const baseFontSize =
        size === "auto"
          ? typographyStyle.fontSize
          : size || typographyStyle.fontSize;
      const responsiveFontSize = useResponsiveFont(
        baseFontSize,
        responsive ? { min: 10, max: 48 } : undefined
      );

      const resolvedColor = useMemo(() => {
        if (!color) return themedStyles.defaultTextColor;
        if (color in theme.colors) {
          return theme.colors[color as keyof typeof theme.colors];
        }
        return color;
      }, [color, theme.colors, themedStyles.defaultTextColor]);

      const computedStyle = useMemo(() => {
        const baseStyle: any = {
          ...typographyStyle,
          fontSize: responsive ? responsiveFontSize : baseFontSize,
          lineHeight: typographyStyle.lineHeight,
          color: resolvedColor,
          fontWeight: weight || typographyStyle.fontWeight,
          textTransform: transform || typographyStyle.textTransform,
          textDecorationLine: decoration,
          fontStyle: italic ? "italic" : "normal",
          textAlign: align,
        };

        if (shadow) {
          Object.assign(baseStyle, {
            textShadowColor: "rgba(0,0,0,0.3)",
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
          });
        }

        const spacingStyles = createSpacingStyles({
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
        });

        return { ...baseStyle, ...spacingStyles };
      }, [
        typographyStyle,
        responsive,
        responsiveFontSize,
        baseFontSize,
        resolvedColor,
        align,
        weight,
        transform,
        decoration,
        italic,
        shadow,
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
      ]);

      const finalStyle = useMemo(() => {
        const styles = [computedStyle];
        if (propStyle)
          Array.isArray(propStyle)
            ? styles.push(...propStyle)
            : styles.push(propStyle);
        return styles;
      }, [computedStyle, propStyle]);

      const textProps = useMemo(() => {
        const props = {
          ...restProps,
          numberOfLines:
            typeof truncate === "number" ? truncate : numberOfLines,
          ellipsizeMode: truncate ? ellipsizeMode || "tail" : ellipsizeMode,
          allowFontScaling: allowFontScaling !== false,
          maxFontSizeMultiplier: maxFontSizeMultiplier || 3,
          minimumFontScale,
          suppressHighlighting,
          selectable,
          selectionColor,
          textBreakStrategy,
          testID: testID || `apptext-${variant}`,
        };

        return {
          ...props,
          accessibilityRole: "text" as AccessibilityRole,
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
        testID,
        variant,
      ]);

      const handlePress = useCallback((e: any) => onPress?.(e), [onPress]);
      const handleLongPress = useCallback(
        (e: any) => onLongPress?.(e),
        [onLongPress]
      );

      if (typeof truncate === "number" && truncate > 0) {
        return (
          <TruncationComponent
            maxLines={truncate}
            style={finalStyle}
            onExpand={() => handlePress?.(undefined)}
            expandText={expandText}
            collapseText={collapseText}
          >
            {textContent}
          </TruncationComponent>
        );
      }

      return (
        <Text
          ref={ref}
          style={finalStyle}
          onPress={handlePress}
          onLongPress={handleLongPress}
          {...textProps}
        >
          {children}
        </Text>
      );
    }
  )
);

BaseAppText.displayName = "AppText";

/* ========== Compound Components ========== */
type VariantFC = React.FC<Omit<AppTextProps, "variant">>;
type AppTextCompound = typeof BaseAppText & {
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
};

const AppText = BaseAppText as AppTextCompound;

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

export default AppText;
export { AppTextProvider, useAppTextTheme, useResponsiveFont, DEFAULT_THEME };
export type { AppTextProps, AppTextTheme, TypographyVariant };
