import React, { useState, useCallback } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from "react-native";
import AppText, {
  AppTextProvider,
  LocaleProvider,
  useLang,
  Trans,
  MarkdownTrans,
  useAppTextTheme,
  useResponsiveFont,
  DEFAULT_THEME,
  NumberFormatter,
  OrdinalFormatter,
  translationCache,
  performanceMonitor,
  TranslationErrorBoundary,
} from "react-native-apptext";

const translations = {
  en: {
    welcome: "Welcome to AppText",
    greeting: "Hello, {{name}}!",
    items_one: "{{count}} item",
    items_other: "{{count}} items",
    icu_plural: "{count, plural, one {# item} other {# items}}",
    icu_select_gender:
      "{gender, select, male {He is here} female {She is here} other {They are here}}",
    icu_select_role:
      "{role, select, admin {Admin User} user {Regular User} guest {Guest User}}",
    icu_number: "Price: {{value, number, currency}}",
    icu_date: "Event date: {{value, date}}",
    rich_markdown:
      "This is **bold** and *italic* with a [link](https://example.com)",
    nested_tags: "<bold>Hello</bold> <link>World</link>",
    no_items: "No items found",
    one_item: "One item",
    few_items: "Few items",
    many_items: "Many items",
  },
  ar: {
    welcome: "مرحباً بك في AppText",
    greeting: "مرحباً، {{name}}!",
    items_one: "{{count}} عنصر",
    items_other: "{{count}} عناصر",
    icu_plural: "{count, plural, one {# عنصر} other {# عناصر}}",
    rich_markdown: "هذا نص **عريض** و *مائل* مع [رابط](https://example.com)",
  },
  fr: {
    welcome: "Bienvenue dans AppText",
    greeting: "Bonjour, {{name}}!",
    items_one: "{{count}} élément",
    items_other: "{{count}} éléments",
    icu_plural: "{count, plural, one {# élément} other {# éléments}}",
  },
  ja: {
    welcome: "AppTextへようこそ",
    greeting: "こんにちは、{{name}}さん！",
    items_other: "{{count}}個",
    icu_plural: "{count, plural, other {#個}}",
  },
};

const languages = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
];

const customTheme = {
  ...DEFAULT_THEME,
  colors: {
    ...DEFAULT_THEME.colors,
    primary: "#6366F1",
    secondary: "#8B5CF6",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },
  typography: {
    ...DEFAULT_THEME.typography,
    h1: { ...DEFAULT_THEME.typography.h1, fontSize: 36 },
    h2: { ...DEFAULT_THEME.typography.h2, fontSize: 30 },
  },
};

function Section({ title, children, initiallyExpanded = true }) {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <AppText variant="titleMedium" style={styles.sectionTitle}>
          {title}
        </AppText>
        <AppText variant="bodySmall" color="#666">
          {expanded ? "▼" : "▶"}
        </AppText>
      </TouchableOpacity>
      {expanded && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
}

// ============================================================================
// 1. TYPOGRAPHY - Material Design 3 Variants
// ============================================================================
function MaterialTypographyDemo() {
  return (
    <Section title="1️⃣ Material Design 3 Typography">
      <AppText variant="displayLarge">Display Large (57px)</AppText>
      <AppText variant="displayMedium">Display Medium (45px)</AppText>
      <AppText variant="displaySmall">Display Small (36px)</AppText>
      <AppText variant="headlineLarge">Headline Large (32px)</AppText>
      <AppText variant="headlineMedium">Headline Medium (28px)</AppText>
      <AppText variant="headlineSmall">Headline Small (24px)</AppText>
      <AppText variant="titleLarge">Title Large (22px)</AppText>
      <AppText variant="titleMedium">Title Medium (16px)</AppText>
      <AppText variant="titleSmall">Title Small (14px)</AppText>
      <AppText variant="bodyLarge">
        Body Large - Standard paragraph text
      </AppText>
      <AppText variant="bodyMedium">
        Body Medium - Slightly smaller body text
      </AppText>
      <AppText variant="bodySmall">Body Small - Smallest body text</AppText>
      <AppText variant="labelLarge">Label Large - Labels and buttons</AppText>
      <AppText variant="labelMedium">Label Medium - Smaller labels</AppText>
      <AppText variant="labelSmall">Label Small - Smallest label</AppText>
    </Section>
  );
}

// ============================================================================
// 2. TYPOGRAPHY - Legacy Variants
// ============================================================================
function LegacyTypographyDemo() {
  return (
    <Section title="2️⃣ Legacy Typography Variants">
      <AppText variant="h1">Heading 1 (32px)</AppText>
      <AppText variant="h2">Heading 2 (28px)</AppText>
      <AppText variant="h3">Heading 3 (24px)</AppText>
      <AppText variant="h4">Heading 4 (20px)</AppText>
      <AppText variant="h5">Heading 5 (18px)</AppText>
      <AppText variant="h6">Heading 6 (16px)</AppText>
      <AppText variant="subtitle1">Subtitle 1 (18px)</AppText>
      <AppText variant="subtitle2">Subtitle 2 (16px)</AppText>
      <AppText variant="body1">
        Body 1 - The quick brown fox jumps over the lazy dog. Used for longer
        paragraphs.
      </AppText>
      <AppText variant="body2">
        Body 2 - The quick brown fox jumps over the lazy dog. Used for shorter
        paragraphs.
      </AppText>
      <AppText variant="caption">Caption text - Small helper text</AppText>
      <AppText variant="overline">OVERLINE TEXT - ALL CAPS SMALL</AppText>
      <AppText variant="button">BUTTON TEXT - ALL CAPS</AppText>
      <AppText variant="code">{"function hello() { return 'world'; }"}</AppText>
    </Section>
  );
}

// ============================================================================
// 3. TEXT STYLING PROPS
// ============================================================================
function TextStylingDemo() {
  return (
    <Section title="3️⃣ Text Styling Props">
      <AppText size={28} weight="900" color="#EF4444">
        Size + Weight + Color
      </AppText>
      <AppText size={22} weight="700" color="#F59E0B" align="center">
        Center aligned, Orange, Bold
      </AppText>
      <AppText size={18} weight="300" color="#10B981" align="right">
        Light weight, Green, Right aligned
      </AppText>
      <AppText transform="uppercase" color="#3B82F6">
        uppercase transformation
      </AppText>
      <AppText transform="lowercase" color="#8B5CF6">
        LOWERCASE TRANSFORMATION
      </AppText>
      <AppText transform="capitalize" color="#EC4899">
        capitalize each word
      </AppText>
      <AppText decoration="underline" color="#6366F1">
        Underlined text
      </AppText>
      <AppText decoration="line-through" color="#EF4444">
        Strikethrough text
      </AppText>
      <AppText decoration="none" style={{ textDecorationLine: "underline" }}>
        Decoration none
      </AppText>
      <AppText italic color="#059669">
        Italic text
      </AppText>
      <AppText italic weight="700" style={{ fontStyle: "normal" }}>
        Font style override
      </AppText>
      <View style={styles.colorBox}>
        <AppText style={{ color: "#FFFFFF" }}>
          Custom style with background
        </AppText>
      </View>
      <AppText numberOfLines={1} style={{ backgroundColor: "#FEF3C7" }}>
        Truncated long text that will be cut off after one line...
      </AppText>
    </Section>
  );
}

// ============================================================================
// 4. SPACING PROPS
// ============================================================================
function SpacingDemo() {
  return (
    <Section title="4️⃣ Spacing Props (Margin & Padding)">
      <AppText m={5} p={5} backgroundColor="#DBEAFE">
        margin=5, padding=5
      </AppText>
      <AppText mt={10} mb={10} backgroundColor="#FCE7F3">
        marginTop=10, marginBottom=10
      </AppText>
      <AppText ml={15} mr={15} backgroundColor="#D1FAE5">
        marginLeft=15, marginRight=15
      </AppText>
      <AppText mx={20} my={10} backgroundColor="#FEF3C7">
        marginX=20, marginY=10
      </AppText>
      <AppText p={15} pt={5} backgroundColor="#E0E7FF">
        padding=15, paddingTop=5
      </AppText>
      <AppText px={25} py={15} backgroundColor="#FED7AA">
        paddingX=25, paddingY=15
      </AppText>
    </Section>
  );
}

// ============================================================================
// 5. COMPOUND COMPONENTS
// ============================================================================
function CompoundComponentsDemo() {
  return (
    <Section title="5️⃣ Compound Components">
      <AppText variant="titleSmall" style={{ marginBottom: 8 }}>
        Legacy Variants:
      </AppText>
      <AppText.H1>AppText.H1 - Heading 1</AppText.H1>
      <AppText.H2>AppText.H2 - Heading 2</AppText.H2>
      <AppText.H3>AppText.H3 - Heading 3</AppText.H3>
      <AppText.H4>AppText.H4 - Heading 4</AppText.H4>
      <AppText.H5>AppText.H5 - Heading 5</AppText.H5>
      <AppText.H6>AppText.H6 - Heading 6</AppText.H6>
      <AppText.Subtitle>AppText.Subtitle (variant=subtitle1)</AppText.Subtitle>
      <AppText.Body>AppText.Body (variant=body1)</AppText.Body>
      <AppText.Caption>AppText.Caption</AppText.Caption>
      <AppText variant="overline" style={{ letterSpacing: 1.5 }}>
        AppText with variant="overline"
      </AppText>
      <AppText variant="button" style={{ letterSpacing: 0.5 }}>
        AppText with variant="button"
      </AppText>
      <AppText.Code>AppText.Code</AppText.Code>

      <AppText variant="titleSmall" style={{ marginTop: 15, marginBottom: 8 }}>
        Material Design 3:
      </AppText>
      <AppText.DisplayLarge>DisplayLarge</AppText.DisplayLarge>
      <AppText.DisplayMedium>DisplayMedium</AppText.DisplayMedium>
      <AppText.DisplaySmall>DisplaySmall</AppText.DisplaySmall>
      <AppText.HeadlineLarge>HeadlineLarge</AppText.HeadlineLarge>
      <AppText.HeadlineMedium>HeadlineMedium</AppText.HeadlineMedium>
      <AppText.HeadlineSmall>HeadlineSmall</AppText.HeadlineSmall>
      <AppText.TitleLarge>TitleLarge</AppText.TitleLarge>
      <AppText.TitleMedium>TitleMedium</AppText.TitleMedium>
      <AppText.TitleSmall>TitleSmall</AppText.TitleSmall>
      <AppText.BodyLarge>BodyLarge</AppText.BodyLarge>
      <AppText.BodyMedium>BodyMedium</AppText.BodyMedium>
      <AppText.BodySmall>BodySmall</AppText.BodySmall>
      <AppText.LabelLarge>LabelLarge</AppText.LabelLarge>
      <AppText.LabelMedium>LabelMedium</AppText.LabelMedium>
      <AppText.LabelSmall>LabelSmall</AppText.LabelSmall>
    </Section>
  );
}

// ============================================================================
// 6. FADE ANIMATIONS
// ============================================================================
function FadeAnimationsDemo() {
  return (
    <Section title="6️⃣ Fade Animations" initiallyExpanded={false}>
      <AppText animated animation={{ type: "fadeIn", duration: 1000 }}>
        fadeIn - Fade in from invisible
      </AppText>
      <AppText animated animation={{ type: "fadeOut", duration: 1000 }}>
        fadeOut - Fade out to invisible
      </AppText>
      <AppText animated animation={{ type: "blink", duration: 2000 }}>
        blink - Repeated blinking effect
      </AppText>
      <AppText animated animation={{ type: "glow", duration: 2000 }}>
        glow - Pulsing glow effect
      </AppText>
    </Section>
  );
}

// ============================================================================
// 7. SLIDE ANIMATIONS
// ============================================================================
function SlideAnimationsDemo() {
  return (
    <Section title="7️⃣ Slide Animations" initiallyExpanded={false}>
      <AppText animated animation={{ type: "slideInRight", duration: 800 }}>
        slideInRight - Slide from right
      </AppText>
      <AppText animated animation={{ type: "slideInLeft", duration: 800 }}>
        slideInLeft - Slide from left
      </AppText>
      <AppText animated animation={{ type: "slideInUp", duration: 800 }}>
        slideInUp - Slide from bottom
      </AppText>
      <AppText animated animation={{ type: "slideInDown", duration: 800 }}>
        slideInDown - Slide from top
      </AppText>
      <AppText animated animation={{ type: "slideOutRight", duration: 800 }}>
        slideOutRight - Slide to right
      </AppText>
      <AppText animated animation={{ type: "slideOutLeft", duration: 800 }}>
        slideOutLeft - Slide to left
      </AppText>
      <AppText animated animation={{ type: "slideOutUp", duration: 800 }}>
        slideOutUp - Slide to top
      </AppText>
      <AppText animated animation={{ type: "slideOutDown", duration: 800 }}>
        slideOutDown - Slide to bottom
      </AppText>
    </Section>
  );
}

// ============================================================================
// 8. BOUNCE & SCALE ANIMATIONS
// ============================================================================
function BounceScaleAnimationsDemo() {
  return (
    <Section title="8️⃣ Bounce & Scale Animations" initiallyExpanded={false}>
      <AppText animated animation={{ type: "bounceIn", duration: 1000 }}>
        bounceIn - Bouncing entrance
      </AppText>
      <AppText animated animation={{ type: "bounceOut", duration: 1000 }}>
        bounceOut - Bouncing exit
      </AppText>
      <AppText animated animation={{ type: "zoomIn", duration: 600 }}>
        zoomIn - Scale up entrance
      </AppText>
      <AppText animated animation={{ type: "zoomOut", duration: 600 }}>
        zoomOut - Scale down exit
      </AppText>
      <AppText animated animation={{ type: "pulse", duration: 1500 }}>
        pulse - Continuous pulse
      </AppText>
      <AppText animated animation={{ type: "rubberBand", duration: 1000 }}>
        rubberBand - Rubber band effect
      </AppText>
    </Section>
  );
}

// ============================================================================
// 9. ROTATE & FLIP ANIMATIONS (FIXED)
// ============================================================================
function RotateFlipAnimationsDemo() {
  return (
    <Section
      title="9️⃣ Rotate & Flip Animations (Fixed)"
      initiallyExpanded={false}
    >
      <AppText animated animation={{ type: "rotateIn", duration: 800 }}>
        rotateIn - Rotate entrance
      </AppText>
      <AppText animated animation={{ type: "rotateOut", duration: 800 }}>
        rotateOut - Rotate exit
      </AppText>
      <AppText animated animation={{ type: "flipInX", duration: 1000 }}>
        flipInX - Flip horizontally in
      </AppText>
      <AppText animated animation={{ type: "flipInY", duration: 1000 }}>
        flipInY - Flip vertically in
      </AppText>
      <AppText animated animation={{ type: "flipOutX", duration: 1000 }}>
        flipOutX - Flip horizontally out
      </AppText>
      <AppText animated animation={{ type: "flipOutY", duration: 1000 }}>
        flipOutY - Flip vertically out
      </AppText>
    </Section>
  );
}

// ============================================================================
// 10. SPECIAL ANIMATIONS
// ============================================================================
function SpecialAnimationsDemo() {
  return (
    <Section title="🔟 Special Animations" initiallyExpanded={false}>
      <AppText animated animation={{ type: "shake", duration: 1000 }}>
        shake - Horizontal shake
      </AppText>
      <AppText animated animation={{ type: "wobble", duration: 1000 }}>
        wobble - Wobble effect
      </AppText>
      <AppText animated animation={{ type: "swing", duration: 1000 }}>
        swing - Swing motion
      </AppText>
      <AppText animated animation={{ type: "tada", duration: 1000 }}>
        tada - Celebration animation
      </AppText>
      <AppText animated animation={{ type: "neon", duration: 2000 }}>
        neon - Neon glow text
      </AppText>
      <AppText animated animation={{ type: "gradientShift", duration: 3000 }}>
        gradientShift - Color gradient shift
      </AppText>
    </Section>
  );
}

// ============================================================================
// 11. TYPEWRITER ANIMATION (FIXED)
// ============================================================================
function TypewriterDemo() {
  return (
    <Section
      title="1️⃣1️⃣ Typewriter Animation (Fixed)"
      initiallyExpanded={false}
    >
      <AppText
        animated
        animation={{ type: "typewriter", speed: 30, delay: 500 }}
      >
        This text types itself character by character. Watch each letter appear
        one by one!
      </AppText>
      <AppText
        animated
        animation={{ type: "typewriter", speed: 50, delay: 300 }}
      >
        Faster typewriter with 50ms speed
      </AppText>
      <AppText
        animated
        animation={{ type: "typewriter", speed: 100, delay: 200 }}
      >
        Slower typewriter with 100ms speed
      </AppText>
    </Section>
  );
}

// ============================================================================
// 12. WAVE ANIMATION (FIXED)
// ============================================================================
function WaveDemo() {
  return (
    <Section title="1️⃣2️⃣ Wave Animation (Fixed)" initiallyExpanded={false}>
      <AppText animated animation={{ type: "wave", duration: 1000, delay: 50 }}>
        Wave Animation Text
      </AppText>
      <AppText animated animation={{ type: "wave", duration: 800, delay: 100 }}>
        Faster wave effect
      </AppText>
    </Section>
  );
}

// ============================================================================
// 13. TRUNCATION & EXPAND
// ============================================================================
function TruncationDemo() {
  return (
    <Section title="1️⃣3️⃣ Truncation & Expand">
      <AppText
        numberOfLines={2}
        expandText="Read more..."
        collapseText="Show less"
        onExpand={() => Alert.alert("Expanded!", "Text is now fully visible")}
        onCollapse={() => Alert.alert("Collapsed!", "Text is now truncated")}
      >
        This is a long text that will be truncated after two lines. The user can
        click "Read more" to see the full content. This is useful for displaying
        preview text in lists or cards where you want to show a brief excerpt.
      </AppText>
      <AppText
        numberOfLines={3}
        expandText="Read more"
        style={{ marginTop: 10 }}
      >
        Three line truncation. Lorem ipsum dolor sit amet, consectetur
        adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
      </AppText>
    </Section>
  );
}

// ============================================================================
// 14. LOCALIZATION & i18n
// ============================================================================
function LocalizationDemo() {
  const { language, direction, t, changeLanguage } = useLang();
  const theme = useAppTextTheme();
  const [selectedLang, setSelectedLang] = useState(language);

  const handleLanguageChange = useCallback(
    (langCode) => {
      changeLanguage(langCode);
      setSelectedLang(langCode);
    },
    [changeLanguage],
  );

  const isRTL = direction === "rtl";

  return (
    <Section title="1️⃣4️⃣ Localization & i18n">
      <View style={styles.languageSelector}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.langButton,
              selectedLang === lang.code && styles.langButtonSelected,
            ]}
            onPress={() => handleLanguageChange(lang.code)}
          >
            <AppText size={12}>{lang.flag}</AppText>
            <AppText
              size={11}
              weight={selectedLang === lang.code ? "700" : "400"}
              color={selectedLang === lang.code ? "#FFF" : theme.colors.text}
            >
              {lang.nativeName}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ alignItems: isRTL ? "flex-end" : "flex-start" }}>
        <AppText variant="titleSmall" style={{ marginBottom: 5 }}>
          Basic Translation:
        </AppText>
        <AppText>{t("welcome")}</AppText>
        <AppText style={{ marginTop: 8 }}>
          {t("greeting", { name: "Developer" })}
        </AppText>

        <AppText
          variant="titleSmall"
          style={{ marginTop: 15, marginBottom: 5 }}
        >
          Object-based Plural:
        </AppText>
        <AppText>{t("items_one", { count: 1 })}</AppText>
        <AppText>{t("items_other", { count: 5 })}</AppText>

        <AppText
          variant="titleSmall"
          style={{ marginTop: 15, marginBottom: 5 }}
        >
          ICU MessageFormat Plural:
        </AppText>
        <AppText>{t("icu_plural", { count: 0 })}</AppText>
        <AppText>{t("icu_plural", { count: 1 })}</AppText>
        <AppText>{t("icu_plural", { count: 2 })}</AppText>
        <AppText>{t("icu_plural", { count: 5 })}</AppText>
        <AppText>{t("icu_plural", { count: 100 })}</AppText>

        <AppText
          variant="titleSmall"
          style={{ marginTop: 15, marginBottom: 5 }}
        >
          ICU Select:
        </AppText>
        <AppText>{t("icu_select_gender", { gender: "male" })}</AppText>
        <AppText>{t("icu_select_gender", { gender: "female" })}</AppText>
        <AppText>{t("icu_select_gender", { gender: "other" })}</AppText>
      </View>

      <AppText variant="caption" color="#666" style={{ marginTop: 10 }}>
        Current direction: {direction.toUpperCase()} {isRTL ? "(RTL)" : "(LTR)"}
      </AppText>
    </Section>
  );
}

// ============================================================================
// 15. TRANS COMPONENT
// ============================================================================
function TransComponentDemo() {
  return (
    <Section title="1️⃣5️⃣ Trans Component (Rich i18n)">
      <AppText variant="titleSmall" style={{ marginBottom: 8 }}>
        Basic Usage:
      </AppText>
      <Trans i18nKey="welcome" />

      <AppText variant="titleSmall" style={{ marginTop: 12, marginBottom: 8 }}>
        With Values:
      </AppText>
      <Trans i18nKey="greeting" values={{ name: "React Developer" }} />

      <AppText variant="titleSmall" style={{ marginTop: 12, marginBottom: 8 }}>
        Plural with Count:
      </AppText>
      <Trans
        i18nKey="icu_plural"
        values={{ count: 5 }}
        options={{ count: 5 }}
      />

      <AppText variant="titleSmall" style={{ marginTop: 12, marginBottom: 8 }}>
        With Nested Components (Fixed):
      </AppText>
      <Trans
        i18nKey="nested_tags"
        components={{
          bold: <AppText weight="700" color="#EF4444" />,
          link: (
            <AppText
              color="#3B82F6"
              onPress={() => Alert.alert("Link pressed!")}
            />
          ),
        }}
      />
      <AppText variant="caption" color="#666">
        Translation: {"<bold>Hello</bold> <link>World</link>"}
      </AppText>
    </Section>
  );
}

// ============================================================================
// 16. MARKDOWN TRANS
// ============================================================================
function MarkdownTransDemo() {
  return (
    <Section title="1️⃣6️⃣ MarkdownTrans Component">
      <MarkdownTrans
        i18nKey="rich_markdown"
        markdownStyles={{
          bold: { fontWeight: "700" },
          italic: { fontStyle: "italic" },
          link: { color: "#3B82F6", textDecorationLine: "underline" },
        }}
        onLinkPress={(url) => Alert.alert(`Opened URL: ${url}`)}
      />

      <AppText variant="titleSmall" style={{ marginTop: 15, marginBottom: 8 }}>
        Supported Syntax:
      </AppText>
      <MarkdownTrans
        i18nKey="rich_markdown"
        enabledFeatures={{
          bold: true,
          italic: true,
          underline: true,
          strikethrough: true,
          code: true,
          links: true,
          components: false,
        }}
      />

      <View
        style={{
          marginTop: 10,
          padding: 10,
          backgroundColor: "#F3F4F6",
          borderRadius: 8,
        }}
      >
        <AppText variant="caption" color="#374151">
          • **bold** - Bold text{"\n"}• *italic* - Italic text{"\n"}•
          __underline__ - Underlined{"\n"}• ~~strikethrough~~ - Strikethrough
          {"\n"}• `code` - Inline code{"\n"}• [text](url) - Links
        </AppText>
      </View>
    </Section>
  );
}

// ============================================================================
// 17. RESPONSIVE FONT
// ============================================================================
function ResponsiveFontDemo() {
  const fontSize10 = useResponsiveFont(10);
  const fontSize14 = useResponsiveFont(14);
  const fontSize20 = useResponsiveFont(20);
  const fontSize28 = useResponsiveFont(28);
  const fontSize40 = useResponsiveFont(40, { min: 32, max: 56 });

  return (
    <Section title="1️⃣7️⃣ Responsive Font Scaling">
      <AppText variant="bodySmall" color="#666">
        Based on device width (375px base)
      </AppText>
      <View style={{ marginTop: 10 }}>
        <AppText size={fontSize40}>Responsive 40 (clamped 32-56)</AppText>
        <AppText size={fontSize28}>Responsive 28</AppText>
        <AppText size={fontSize20}>Responsive 20</AppText>
        <AppText size={fontSize14}>Responsive 14</AppText>
        <AppText size={fontSize10}>Responsive 10</AppText>
      </View>
    </Section>
  );
}

// ============================================================================
// 18. SCRIPT DETECTION & RTL
// ============================================================================
function ScriptDetectionDemo() {
  return (
    <Section
      title="1️⃣8️⃣ Script Detection & RTL Scripts"
      initiallyExpanded={false}
    >
      <AppText variant="titleSmall" style={{ marginBottom: 8 }}>
        Left-to-Right (LTR):
      </AppText>
      <AppText>English: Hello World</AppText>
      <AppText>Chinese: 你好世界</AppText>
      <AppText>Japanese: こんにちは世界</AppText>
      <AppText>Korean: 안녕하세요</AppText>
      <AppText>Hindi: नमस्ते दुनिया</AppText>

      <AppText variant="titleSmall" style={{ marginTop: 15, marginBottom: 8 }}>
        Right-to-Left (RTL):
      </AppText>
      <AppText style={{ textAlign: "right" }}>Arabic: مرحبا بالعالم</AppText>
      <AppText style={{ textAlign: "right" }}>Hebrew: שלום עולם</AppText>
      <AppText style={{ textAlign: "right" }}>Persian/Farsi: سلام دنیا</AppText>
    </Section>
  );
}

// ============================================================================
// 19. NUMBER FORMATTER
// ============================================================================
function NumberFormatterDemo() {
  return (
    <Section title="1️⃣9️⃣ Number Formatter">
      <AppText variant="titleSmall" style={{ marginBottom: 8 }}>
        Decimal:
      </AppText>
      <AppText>en-US: {NumberFormatter.format(1234567.89, "en-US")}</AppText>
      <AppText>de-DE: {NumberFormatter.format(1234567.89, "de-DE")}</AppText>
      <AppText>fr-FR: {NumberFormatter.format(1234567.89, "fr-FR")}</AppText>

      <AppText variant="titleSmall" style={{ marginTop: 12, marginBottom: 8 }}>
        Currency:
      </AppText>
      <AppText>
        USD: {NumberFormatter.formatCurrency(1234.56, "en-US", "USD")}
      </AppText>
      <AppText>
        EUR: {NumberFormatter.formatCurrency(1234.56, "de-DE", "EUR")}
      </AppText>
      <AppText>
        GBP: {NumberFormatter.formatCurrency(1234.56, "en-GB", "GBP")}
      </AppText>
      <AppText>
        JPY: {NumberFormatter.formatCurrency(9999, "ja-JP", "JPY")}
      </AppText>

      <AppText variant="titleSmall" style={{ marginTop: 12, marginBottom: 8 }}>
        Percentage:
      </AppText>
      <AppText>{NumberFormatter.formatPercent(0.856, "en-US")}</AppText>
      <AppText>{NumberFormatter.formatPercent(0.125, "en-US")}</AppText>

      <AppText variant="titleSmall" style={{ marginTop: 12, marginBottom: 8 }}>
        Compact:
      </AppText>
      <AppText>en: {NumberFormatter.formatCompact(1500000, "en-US")}</AppText>
      <AppText>de: {NumberFormatter.formatCompact(1500000, "de-DE")}</AppText>

      <AppText variant="titleSmall" style={{ marginTop: 12, marginBottom: 8 }}>
        Signed:
      </AppText>
      <AppText>+42: {NumberFormatter.formatSigned(42, "en-US")}</AppText>
      <AppText>-42: {NumberFormatter.formatSigned(-42, "en-US")}</AppText>

      <AppText variant="titleSmall" style={{ marginTop: 12, marginBottom: 8 }}>
        Ordinals:
      </AppText>
      <AppText>
        {OrdinalFormatter.format(1, "en-US")},{" "}
        {OrdinalFormatter.format(2, "en-US")},{" "}
        {OrdinalFormatter.format(3, "en-US")},{" "}
        {OrdinalFormatter.format(4, "en-US")},{" "}
        {OrdinalFormatter.format(11, "en-US")},{" "}
        {OrdinalFormatter.format(21, "en-US")},{" "}
        {OrdinalFormatter.format(111, "en-US")}
      </AppText>
    </Section>
  );
}

// ============================================================================
// 20. THEME CUSTOMIZATION
// ============================================================================
function ThemeDemo() {
  const theme = useAppTextTheme();

  return (
    <Section title="2️⃣0️⃣ Theme Customization">
      <AppText variant="bodySmall" color="#666">
        Custom purple theme applied:
      </AppText>

      <View style={styles.colorSwatches}>
        <View style={styles.swatchContainer}>
          <View
            style={[styles.swatch, { backgroundColor: theme.colors.primary }]}
          />
          <AppText variant="caption">primary</AppText>
        </View>
        <View style={styles.swatchContainer}>
          <View
            style={[styles.swatch, { backgroundColor: theme.colors.secondary }]}
          />
          <AppText variant="caption">secondary</AppText>
        </View>
        <View style={styles.swatchContainer}>
          <View
            style={[styles.swatch, { backgroundColor: theme.colors.success }]}
          />
          <AppText variant="caption">success</AppText>
        </View>
        <View style={styles.swatchContainer}>
          <View
            style={[styles.swatch, { backgroundColor: theme.colors.warning }]}
          />
          <AppText variant="caption">warning</AppText>
        </View>
        <View style={styles.swatchContainer}>
          <View
            style={[styles.swatch, { backgroundColor: theme.colors.error }]}
          />
          <AppText variant="caption">error</AppText>
        </View>
        <View style={styles.swatchContainer}>
          <View
            style={[styles.swatch, { backgroundColor: theme.colors.info }]}
          />
          <AppText variant="caption">info</AppText>
        </View>
      </View>

      <AppText variant="titleSmall" style={{ marginTop: 10, marginBottom: 5 }}>
        Theme Colors:
      </AppText>
      <View style={styles.colorRow}>
        <View
          style={[styles.colorDot, { backgroundColor: theme.colors.text }]}
        />
        <AppText variant="bodySmall">text: {theme.colors.text}</AppText>
      </View>
      <View style={styles.colorRow}>
        <View
          style={[
            styles.colorDot,
            { backgroundColor: theme.colors.textSecondary },
          ]}
        />
        <AppText variant="bodySmall">
          textSecondary: {theme.colors.textSecondary}
        </AppText>
      </View>
    </Section>
  );
}

// ============================================================================
// 21. ACCESSIBILITY
// ============================================================================
function AccessibilityDemo() {
  return (
    <Section title="2️⃣1️⃣ Accessibility">
      <AppText
        accessibilityLabel="Important header text"
        accessibilityRole="header"
      >
        Accessibility Header (role=header)
      </AppText>

      <AppText
        accessibilityLabel="Clickable link to external site"
        accessibilityRole="link"
        onPress={() => Alert.alert("Link pressed!")}
      >
        Accessible Link (role=link)
      </AppText>

      <AppText
        accessibilityLabel="Button text"
        accessibilityRole="button"
        onPress={() => Alert.alert("Button pressed!")}
      >
        Accessible Button (role=button)
      </AppText>

      <AppText
        accessibilityLabel="Selected state example"
        accessibilityState={{ selected: true, disabled: false }}
      >
        Selected State (state=selected)
      </AppText>

      <AppText
        accessibilityLabel="Disabled state example"
        accessibilityState={{ disabled: true }}
      >
        Disabled State (state=disabled)
      </AppText>
    </Section>
  );
}

// ============================================================================
// 22. PERFORMANCE MONITORING
// ============================================================================
function PerformanceDemo() {
  const cacheStats = translationCache.getStats();
  const perfStats = performanceMonitor.getAllStats();

  return (
    <Section title="2️⃣2️⃣ Performance Monitoring">
      <AppText variant="titleSmall" style={{ marginBottom: 5 }}>
        Translation Cache:
      </AppText>
      <AppText variant="bodySmall">
        Size: {cacheStats.size} | Hits: {cacheStats.hits} | Misses:{" "}
        {cacheStats.misses} | Hit Rate: {cacheStats.hitRate.toFixed(1)}%
      </AppText>

      {Object.keys(perfStats).length > 0 && (
        <>
          <AppText
            variant="titleSmall"
            style={{ marginTop: 12, marginBottom: 5 }}
          >
            Performance Metrics:
          </AppText>
          {Object.entries(perfStats)
            .slice(0, 5)
            .map(([name, stats]) => (
              <AppText key={name} variant="caption">
                {name}: {stats?.count || 0} calls, avg{" "}
                {stats?.mean?.toFixed(2) || 0}ms
              </AppText>
            ))}
        </>
      )}
    </Section>
  );
}

// ============================================================================
// 23. ERROR BOUNDARY
// ============================================================================
function ErrorBoundaryDemo() {
  const [showError, setShowError] = useState(false);

  return (
    <Section title="2️⃣3️⃣ Error Boundary">
      <AppText variant="bodySmall" color="#666">
        TranslationErrorBoundary catches translation errors and displays
        fallback UI
      </AppText>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowError(true)}
      >
        <AppText color="#FFF">Trigger Error to Test Boundary</AppText>
      </TouchableOpacity>

      <TranslationErrorBoundary
        fallback={
          <View style={styles.errorFallback}>
            <AppText color="#EF4444" weight="700">
              ⚠️ Translation Error
            </AppText>
            <AppText variant="caption" color="#666">
              Error caught by boundary
            </AppText>
          </View>
        }
        onError={(error, info) => {
          console.log("Translation error:", error.message);
        }}
      >
        {showError && <AppText>{undefined}</AppText>}
        {!showError && (
          <AppText>Error boundary is watching - tap button to test</AppText>
        )}
      </TranslationErrorBoundary>
    </Section>
  );
}

// ============================================================================
// 24. INTERACTIVE FEATURES
// ============================================================================
function InteractiveFeaturesDemo() {
  const [count, setCount] = useState(0);

  return (
    <Section title="2️⃣4️⃣ Interactive Features">
      <AppText variant="titleSmall" style={{ marginBottom: 8 }}>
        Pressable Text:
      </AppText>
      <AppText onPress={() => Alert.alert("Tapped!", "You tapped on the text")}>
        Tap me! - onPress handler
      </AppText>

      <AppText variant="titleSmall" style={{ marginTop: 15, marginBottom: 8 }}>
        State Changes:
      </AppText>
      <AppText onPress={() => setCount(count + 1)}>
        Tap count: {count} (tap to increment)
      </AppText>

      <AppText variant="titleSmall" style={{ marginTop: 15, marginBottom: 8 }}>
        Dynamic Styling:
      </AppText>
      <AppText
        onPress={() => setCount(0)}
        style={{
          color: count > 5 ? "#EF4444" : "#10B981",
          fontWeight: count > 3 ? "700" : "400",
        }}
      >
        {count === 0
          ? "Tap to start"
          : count > 5
            ? "Warning: High count!"
            : "Keep tapping..."}
      </AppText>
    </Section>
  );
}

// ============================================================================
// MAIN CONTENT
// ============================================================================
function Content() {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      scrollEnabled={true}
      overScrollMode="always"
      nestedScrollEnabled={true}
    >
      <MaterialTypographyDemo />
      <LegacyTypographyDemo />
      <TextStylingDemo />
      <SpacingDemo />
      <CompoundComponentsDemo />
      <FadeAnimationsDemo />
      <SlideAnimationsDemo />
      <BounceScaleAnimationsDemo />
      <RotateFlipAnimationsDemo />
      <SpecialAnimationsDemo />
      <TypewriterDemo />
      {/* <WaveDemo /> */}
      <TruncationDemo />
      <LocalizationDemo />
      <TransComponentDemo />
      <MarkdownTransDemo />
      <ResponsiveFontDemo />
      <ScriptDetectionDemo />
      <NumberFormatterDemo />
      <ThemeDemo />
      <AccessibilityDemo />
      <PerformanceDemo />
      <ErrorBoundaryDemo />
      <InteractiveFeaturesDemo />

      <View style={styles.footer}>
        <AppText variant="titleSmall" color="#6366F1">
          react-native-apptext
        </AppText>
        <AppText variant="caption" color="#999">
          Version 4.0.2 - Full Feature Demo
        </AppText>
        <AppText variant="caption" color="#666" style={{ marginTop: 5 }}>
          All features demonstrated above are production-ready
        </AppText>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// MAIN APP
// ============================================================================
export default function App() {
  const colorScheme = useColorScheme();

  return (
    <AppTextProvider theme={customTheme}>
      <LocaleProvider
        translations={translations}
        defaultLanguage="en"
        fallbackLanguage="en"
        useICU={true}
        onMissingTranslation={(lang, key) => {
          console.log(`Missing: ${key} in ${lang}`);
        }}
      >
        <SafeAreaView
          style={[
            styles.container,
            colorScheme === "dark" && styles.darkContainer,
          ]}
        >
          <StatusBar barStyle="dark-content" />
          <View style={styles.header}>
            <AppText variant="headlineMedium" weight="700">
              AppText Demo
            </AppText>
            <AppText variant="bodySmall" color="#666">
              v4.0.2 - Complete Feature Showcase
            </AppText>
            <AppText variant="caption" color="#999" style={{ marginTop: 4 }}>
              Tap sections to expand/collapse
            </AppText>
          </View>
          <Content />
        </SafeAreaView>
      </LocaleProvider>
    </AppTextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  darkContainer: {
    backgroundColor: "#1F2937",
  },
  header: {
    padding: 16,
    paddingBottom: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  content: {
    flex: 1,
    padding: 12,
    minHeight: 800,
  },
  contentContainer: {
    paddingBottom: 40,
    minHeight: 900,
  },
  section: {
    marginBottom: 12,
    backgroundColor: "#FFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sectionTitle: {
    color: "#111827",
    fontWeight: "600",
  },
  sectionContent: {
    padding: 14,
  },
  languageSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  langButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
  },
  langButtonSelected: {
    backgroundColor: "#6366F1",
  },
  colorSwatches: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  swatchContainer: {
    alignItems: "center",
    width: 50,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 4,
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  colorBox: {
    backgroundColor: "#374151",
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  button: {
    backgroundColor: "#EF4444",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 8,
  },
  errorFallback: {
    padding: 16,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    alignItems: "center",
  },
  footer: {
    padding: 32,
    alignItems: "center",
  },
});
