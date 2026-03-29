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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trans = exports.DEFAULT_THEME = exports.SCRIPT_CONFIGS = exports.useScriptDetection = exports.useResponsiveFont = exports.useAppTextTheme = exports.AppTextProvider = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const scriptConfigs_1 = require("./scriptConfigs");
Object.defineProperty(exports, "SCRIPT_CONFIGS", { enumerable: true, get: function () { return scriptConfigs_1.SCRIPT_CONFIGS; } });
const theme_1 = require("./theme");
Object.defineProperty(exports, "DEFAULT_THEME", { enumerable: true, get: function () { return theme_1.DEFAULT_THEME; } });
const hooks_1 = require("./hooks");
Object.defineProperty(exports, "useResponsiveFont", { enumerable: true, get: function () { return hooks_1.useResponsiveFont; } });
Object.defineProperty(exports, "useScriptDetection", { enumerable: true, get: function () { return hooks_1.useScriptDetection; } });
const context_1 = require("./context");
Object.defineProperty(exports, "AppTextProvider", { enumerable: true, get: function () { return context_1.AppTextProvider; } });
Object.defineProperty(exports, "useAppTextTheme", { enumerable: true, get: function () { return context_1.useAppTextTheme; } });
const utils_1 = require("./utils");
const Trans_1 = __importDefault(require("./Trans"));
exports.Trans = Trans_1.default;
/* ========== Animation Hook ========== */
const useTextAnimation_1 = require("./animations/useTextAnimation");
/* ========== Sub Components ========== */
const TypewriterText_1 = require("./components/TypewriterText");
const TruncationComponent_1 = require("./components/TruncationComponent");
const WaveText_1 = require("./components/WaveText");
/* ========== Main Component ========== */
const BaseAppText = (0, react_1.memo)((0, react_1.forwardRef)(({ children, variant = "body1", color, size, weight, align, transform, decoration, italic = false, truncate = false, maxLines, truncateText = false, expandText, collapseText, shadow = false, animated = false, animation, animationConfig, animationDelay = 0, animationDuration = 1000, animationSpeed = 50, cursor = false, script, direction = "auto", responsive = true, style: propStyle, testID, m, mt, mr, mb, ml, mx, my, p, pt, pr, pb, pl, px, py, numberOfLines, ellipsizeMode, onPress, onLongPress, allowFontScaling, maxFontSizeMultiplier, minimumFontScale, suppressHighlighting, selectable, selectionColor, textBreakStrategy, hyphenationFrequency, accessibilityLabel, accessibilityHint, accessibilityLiveRegion, accessibilityState, accessibilityActions, onAccessibilityAction, linkDetection = false, onLinkPress, ...restProps }, ref) => {
    var _a, _b, _c;
    const theme = (0, context_1.useAppTextTheme)();
    const rawScheme = (0, react_native_1.useColorScheme)();
    const colorScheme = rawScheme === "unspecified" ? "light" : rawScheme;
    const themedStyles = (0, hooks_1.useThemedStyles)(theme, colorScheme);
    const fontScaling = (0, hooks_1.useDynamicTypeScale)(allowFontScaling, minimumFontScale, maxFontSizeMultiplier);
    // Animation hook
    const { animatedStyle, animationType } = (0, useTextAnimation_1.useTextAnimation)(animated, animation, animationConfig, animationDelay, animationDuration, animationSpeed, cursor);
    const textContent = (0, react_1.useMemo)(() => {
        if (typeof children === "string")
            return children;
        if (typeof children === "number")
            return children.toString();
        return String(children || "");
    }, [children]);
    const detectedScript = (0, hooks_1.useScriptDetection)(textContent);
    const finalScript = script || detectedScript;
    const scriptConfig = scriptConfigs_1.SCRIPT_CONFIGS[finalScript] || scriptConfigs_1.SCRIPT_CONFIGS.Unknown;
    const typographyStyle = theme.typography[variant] || theme.typography.body1;
    const baseFontSize = size === "auto"
        ? typographyStyle.fontSize
        : size || typographyStyle.fontSize;
    const responsiveFontSize = (0, hooks_1.useResponsiveFont)(baseFontSize, responsive ? { min: 10, max: 48 } : undefined);
    const calculatedLineHeight = (0, react_1.useMemo)(() => {
        const baseLineHeight = typographyStyle.lineHeight || baseFontSize * 1.2;
        return baseLineHeight * scriptConfig.lineHeightMultiplier;
    }, [
        typographyStyle.lineHeight,
        baseFontSize,
        scriptConfig.lineHeightMultiplier,
    ]);
    const resolvedColor = (0, react_1.useMemo)(() => {
        if (!color)
            return themedStyles.defaultTextColor;
        if (color in theme.colors) {
            return theme.colors[color];
        }
        return color;
    }, [color, theme.colors, themedStyles.defaultTextColor]);
    const textDirection = (0, react_1.useMemo)(() => {
        if (direction !== "auto")
            return direction;
        return scriptConfig.direction;
    }, [direction, scriptConfig.direction]);
    const computedStyle = (0, react_1.useMemo)(() => {
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
    const spacingStyles = (0, react_1.useMemo)(() => (0, utils_1.createSpacingStyles)({
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
    const finalComputedStyle = (0, react_1.useMemo)(() => ({ ...computedStyle, ...spacingStyles, ...animatedStyle }), [computedStyle, spacingStyles, animatedStyle]);
    const textProps = (0, react_1.useMemo)(() => {
        const props = {
            ...restProps,
            numberOfLines: maxLines ||
                (typeof truncate === "number" ? truncate : numberOfLines),
            ellipsizeMode: truncate || truncateText ? ellipsizeMode || "tail" : ellipsizeMode,
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
            accessibilityRole: restProps.accessibilityRole || (onPress ? "button" : "text"),
            ...props,
        };
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
    const handlePress = (0, react_1.useCallback)((e) => onPress === null || onPress === void 0 ? void 0 : onPress(e), [onPress]);
    const handleLongPress = (0, react_1.useCallback)((e) => onLongPress === null || onLongPress === void 0 ? void 0 : onLongPress(e), [onLongPress]);
    const hasPressHandlers = !!onPress || !!onLongPress;
    const finalConfig = animationConfig || ((0, useTextAnimation_1.isAnimationWithConfig)(animation) ? animation : {});
    const finalDelay = (_a = finalConfig === null || finalConfig === void 0 ? void 0 : finalConfig.delay) !== null && _a !== void 0 ? _a : animationDelay;
    const finalDuration = (_b = finalConfig === null || finalConfig === void 0 ? void 0 : finalConfig.duration) !== null && _b !== void 0 ? _b : animationDuration;
    const finalSpeed = (_c = finalConfig === null || finalConfig === void 0 ? void 0 : finalConfig.speed) !== null && _c !== void 0 ? _c : animationSpeed;
    // Special animation handling
    if ((animated || animation) && animationType === "typewriter") {
        return (<TypewriterText_1.TypewriterText delay={finalDelay} duration={finalDuration} speed={finalSpeed} cursor={cursor} style={finalComputedStyle}>
            {children}
          </TypewriterText_1.TypewriterText>);
    }
    if ((animated || animation) && animationType === "wave") {
        return (<WaveText_1.WaveText delay={finalDelay} duration={finalDuration} style={finalComputedStyle}>
            {children}
          </WaveText_1.WaveText>);
    }
    if (truncateText && (maxLines || typeof truncate === "number")) {
        const resolvedMaxLines = maxLines || (typeof truncate === "number" ? truncate : 3);
        return (<TruncationComponent_1.TruncationComponent maxLines={resolvedMaxLines} style={finalComputedStyle} expandText={expandText} collapseText={collapseText}>
            {textContent}
          </TruncationComponent_1.TruncationComponent>);
    }
    const renderChildren = () => {
        if (!linkDetection || typeof children !== "string")
            return children;
        const urlRegex = /((?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*))/gi;
        const parts = children.split(urlRegex);
        return parts.map((part, i) => {
            if (part.match(urlRegex)) {
                const url = part.match(/^https?:\/\//) ? part : `https://${part}`;
                return (<react_native_1.Text key={`link-${i}`} style={{
                        color: resolvedColor,
                        textDecorationLine: "underline",
                    }} onPress={() => onLinkPress === null || onLinkPress === void 0 ? void 0 : onLinkPress(url)}>
                {part}
              </react_native_1.Text>);
            }
            return part;
        });
    };
    if (animated || (animation && animationType !== "none")) {
        return (<react_native_1.Animated.Text ref={ref} style={finalComputedStyle} {...(!hasPressHandlers
            ? { pointerEvents: "none" }
            : { onPress: handlePress, onLongPress: handleLongPress })} {...textProps}>
            {renderChildren()}
          </react_native_1.Animated.Text>);
    }
    return (<react_native_1.Text ref={ref} style={finalComputedStyle} {...(!hasPressHandlers
        ? { pointerEvents: "none" }
        : { onPress: handlePress, onLongPress: handleLongPress })} {...textProps}>
          {renderChildren()}
        </react_native_1.Text>);
}));
BaseAppText.displayName = "AppText";
const AppText = BaseAppText;
// Legacy variants
AppText.H1 = (0, react_1.memo)((props) => <BaseAppText {...props} variant="h1"/>);
AppText.H2 = (0, react_1.memo)((props) => <BaseAppText {...props} variant="h2"/>);
AppText.H3 = (0, react_1.memo)((props) => <BaseAppText {...props} variant="h3"/>);
AppText.H4 = (0, react_1.memo)((props) => <BaseAppText {...props} variant="h4"/>);
AppText.H5 = (0, react_1.memo)((props) => <BaseAppText {...props} variant="h5"/>);
AppText.H6 = (0, react_1.memo)((props) => <BaseAppText {...props} variant="h6"/>);
AppText.Title = (0, react_1.memo)((props) => <BaseAppText {...props} variant="title"/>);
AppText.Subtitle = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="subtitle1"/>));
AppText.Body = (0, react_1.memo)((props) => <BaseAppText {...props} variant="body1"/>);
AppText.Caption = (0, react_1.memo)((props) => <BaseAppText {...props} variant="caption"/>);
AppText.Code = (0, react_1.memo)((props) => <BaseAppText {...props} variant="code"/>);
// Material Design 3 variants
AppText.DisplayLarge = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="displayLarge"/>));
AppText.DisplayMedium = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="displayMedium"/>));
AppText.DisplaySmall = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="displaySmall"/>));
AppText.HeadlineLarge = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="headlineLarge"/>));
AppText.HeadlineMedium = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="headlineMedium"/>));
AppText.HeadlineSmall = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="headlineSmall"/>));
AppText.TitleLarge = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="titleLarge"/>));
AppText.TitleMedium = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="titleMedium"/>));
AppText.TitleSmall = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="titleSmall"/>));
AppText.BodyLarge = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="bodyLarge"/>));
AppText.BodyMedium = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="bodyMedium"/>));
AppText.BodySmall = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="bodySmall"/>));
AppText.LabelLarge = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="labelLarge"/>));
AppText.LabelMedium = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="labelMedium"/>));
AppText.LabelSmall = (0, react_1.memo)((props) => (<BaseAppText {...props} variant="labelSmall"/>));
AppText.Trans = Trans_1.default;
exports.default = AppText;
