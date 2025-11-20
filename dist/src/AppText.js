import React, { forwardRef, memo, useCallback, useMemo } from "react";
import { Text, Animated, useColorScheme, View, } from "react-native";
import { SCRIPT_CONFIGS } from "./scriptConfigs";
import { DEFAULT_THEME } from "./theme";
import { useResponsiveFont, useScriptDetection, useThemedStyles, } from "./hooks";
import { AppTextProvider, useAppTextTheme } from "./context";
import { createSpacingStyles } from "./utils";
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
        </Text>
        {isTruncated && (<Text style={[style, { color: "#007AFF" }]} onPress={handleToggle}>
            {isExpanded ? collapseText : expandText}
          </Text>)}
      </View>);
});
/* ========== Main Component ========== */
const BaseAppText = memo(forwardRef(({ children, variant = "body1", color, size, weight, align, transform, decoration, italic = false, truncate = false, shadow = false, animated = false, script, direction = "auto", responsive = true, style: propStyle, testID, m, mt, mr, mb, ml, mx, my, p, pt, pr, pb, pl, px, py, numberOfLines, ellipsizeMode, onPress, onLongPress, allowFontScaling, maxFontSizeMultiplier, minimumFontScale, suppressHighlighting, selectable, selectionColor, textBreakStrategy, hyphenationFrequency, ...restProps }, ref) => {
    const theme = useAppTextTheme();
    const rawScheme = useColorScheme();
    const colorScheme = rawScheme === "unspecified" ? "light" : rawScheme;
    const themedStyles = useThemedStyles(theme, colorScheme);
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
        calculatedLineHeight,
        resolvedColor,
        align,
        weight,
        transform,
        decoration,
        italic,
        textDirection,
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
    if (typeof truncate === "number" && truncate > 0) {
        return (<TruncationComponent maxLines={truncate} style={finalStyle} onExpand={() => handlePress === null || handlePress === void 0 ? void 0 : handlePress(undefined)}>
            {textContent}
          </TruncationComponent>);
    }
    if (animated) {
        return (<Animated.Text ref={ref} style={finalStyle} {...(!hasPressHandlers
            ? { pointerEvents: "none" }
            : { onPress: handlePress, onLongPress: handleLongPress })} {...textProps}>
            {children}
          </Animated.Text>);
    }
    return (<Text ref={ref} style={finalStyle} {...(!hasPressHandlers
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
export default AppText;
export { AppTextProvider, useAppTextTheme, useResponsiveFont, useScriptDetection, SCRIPT_CONFIGS, DEFAULT_THEME, };
