import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Pressable,
  Alert,
  Linking,
  useColorScheme,
} from "react-native";
import AppText, {
  AppTextProvider,
  LocaleProvider,
  useLang,
  Trans,
  MarkdownTrans,
  useAppTextTheme,
  useUpdateAppTheme,
  useResponsiveFont,
  DEFAULT_THEME,
  NumberFormatter,
  OrdinalFormatter,
  translationCache,
  performanceMonitor,
  TranslationErrorBoundary,
  AppTextSkeleton,
  AppTextDevTools,
  RTLProvider,
  useRTL,
  useRTLFlexDirection,
  useRTLStyle, // full RTL style map
  RTLView, // auto-mirroring View
  isRTLLanguage,
  useAutoLocale,
  useDeviceLocale,
  useTranslationReady,
  withLazyTranslations,
  LazyLocaleProvider,
  // Gap fixes
  useDynamicTypeCategory, // Dynamic Type semantic category
  useDynamicTypeFontSize, // clamped font size from fontScale
  useSpeech, // no-dep TTS hook
  speak, // standalone TTS utility
  AppTextContextMenu, // long-press context menu
  registerAppTextPlugin,
  unregisterAppTextPlugin,
  RemoteLocaleProvider,
  useRemoteLocales,
  useTextMetrics,
  GradientText, // v4.6.0: Text Gradient
  isGradientSupported, // v4.6.0: Check gradient support
} from "react-native-text-kit";

// ============================================================================
// TRANSLATIONS (expanded for demos)
// ============================================================================
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
    rich_markdown:
      "This is **bold** and *italic* with a [link](https://example.com)",
    rich_nested:
      "**_Bold italic_** and **[bold link](https://reactnative.dev)** work now!",
    nested_tags: "<bold>Hello</bold> <link>World</link>",
    no_items: "No items found",
    one_item: "One item",
    few_items: "Few items",
    many_items: "Many items",
    theme_demo: "Runtime theme updated! Primary is now **{{color}}**.",
  },
  ar: {
    welcome: "مرحباً بك في AppText",
    greeting: "مرحباً، {{name}}!",
    items_one: "{{count}} عنصر",
    items_other: "{{count}} عناصر",
    icu_plural: "{count, plural, one {# عنصر} other {# عناصر}}",
    rich_markdown: "هذا نص **عريض** و *مائل* مع [رابط](https://example.com)",
    rich_nested: "**_عريض ومائل_** يعمل الآن!",
    nested_tags: "<bold>مرحباً</bold> <link>عالم</link>",
    theme_demo: "تم تحديث المظهر! اللون الأساسي هو **{{color}}**.",
  },
  fr: {
    welcome: "Bienvenue dans AppText",
    greeting: "Bonjour, {{name}}!",
    items_one: "{{count}} élément",
    items_other: "{{count}} éléments",
    icu_plural: "{count, plural, one {# élément} other {# éléments}}",
    rich_markdown:
      "Voici du **gras** et de *l'italique* avec un [lien](https://example.com)",
    rich_nested: "**_Gras et italique_** fonctionne maintenant!",
    nested_tags: "<bold>Bonjour</bold> <link>Monde</link>",
    theme_demo: "Thème mis à jour! La couleur principale est **{{color}}**.",
  },
  ja: {
    welcome: "AppTextへようこそ",
    greeting: "こんにちは、{{name}}さん！",
    items_other: "{{count}}個",
    icu_plural: "{count, plural, other {#個}}",
    rich_markdown: "これは**太字**と*斜体*です [リンク](https://example.com)",
    rich_nested: "**_太字と斜体_**が機能します！",
    nested_tags: "<bold>こんにちは</bold> <link>世界</link>",
    theme_demo: "テーマが更新されました！プライマリカラーは**{{color}}**です。",
  },
};

const languages = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
];

// Theme presets for the runtime update demo
const THEME_PRESETS = {
  indigo: { color: "Indigo", primary: "#6366F1", secondary: "#8B5CF6" },
  rose: { color: "Rose", primary: "#F43F5E", secondary: "#E11D48" },
  teal: { color: "Teal", primary: "#14B8A6", secondary: "#0D9488" },
  amber: { color: "Amber", primary: "#F59E0B", secondary: "#D97706" },
};

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

// ============================================================================
// REUSABLE SECTION WRAPPER
// ============================================================================
function Section({ title, children, initiallyExpanded = true, badge }) {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
            gap: 8,
          }}
        >
          <AppText variant="titleMedium" style={styles.sectionTitle}>
            {title}
          </AppText>
          {badge && (
            <View style={styles.newBadge}>
              <AppText style={styles.newBadgeText}>{badge}</AppText>
            </View>
          )}
        </View>
        <AppText variant="bodySmall" color="#666">
          {expanded ? "▼" : "▶"}
        </AppText>
      </TouchableOpacity>
      {expanded && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
}

// ============================================================================
// 1. MATERIAL DESIGN 3 TYPOGRAPHY
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
        Body Large — standard paragraph text
      </AppText>
      <AppText variant="bodyMedium">
        Body Medium — slightly smaller body text
      </AppText>
      <AppText variant="bodySmall">Body Small — smallest body text</AppText>
      <AppText variant="labelLarge">Label Large — labels and buttons</AppText>
      <AppText variant="labelMedium">Label Medium — smaller labels</AppText>
      <AppText variant="labelSmall">Label Small — smallest label</AppText>
    </Section>
  );
}

// ============================================================================
// 2. LEGACY TYPOGRAPHY VARIANTS
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
      <AppText variant="body1">Body 1 — standard paragraph text</AppText>
      <AppText variant="body2">Body 2 — secondary paragraph text</AppText>
      <AppText variant="caption">Caption text — small helper text</AppText>
      <AppText variant="overline">OVERLINE TEXT — ALL CAPS SMALL</AppText>
      <AppText variant="button">BUTTON TEXT — ALL CAPS</AppText>
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
      <AppText italic color="#059669">
        Italic text
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
      <AppText m={5} p={5} style={{ backgroundColor: "#DBEAFE" }}>
        margin=5, padding=5
      </AppText>
      <AppText mt={10} mb={10} style={{ backgroundColor: "#FCE7F3" }}>
        marginTop=10, marginBottom=10
      </AppText>
      <AppText ml={15} mr={15} style={{ backgroundColor: "#D1FAE5" }}>
        marginLeft=15, marginRight=15
      </AppText>
      <AppText mx={20} my={10} style={{ backgroundColor: "#FEF3C7" }}>
        marginX=20, marginY=10
      </AppText>
      <AppText p={15} pt={5} style={{ backgroundColor: "#E0E7FF" }}>
        padding=15, paddingTop=5
      </AppText>
      <AppText px={25} py={15} style={{ backgroundColor: "#FED7AA" }}>
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
    <Section title="5️⃣ Compound Components" initiallyExpanded={false}>
      <AppText variant="titleSmall" style={{ marginBottom: 8 }}>
        Material Design 3:
      </AppText>
      <AppText.DisplayLarge>DisplayLarge</AppText.DisplayLarge>
      <AppText.DisplayMedium>DisplayMedium</AppText.DisplayMedium>
      <AppText.HeadlineLarge>HeadlineLarge</AppText.HeadlineLarge>
      <AppText.TitleLarge>TitleLarge</AppText.TitleLarge>
      <AppText.BodyLarge>BodyLarge</AppText.BodyLarge>
      <AppText.LabelSmall>LabelSmall</AppText.LabelSmall>

      <AppText variant="titleSmall" style={{ marginTop: 12, marginBottom: 8 }}>
        Legacy:
      </AppText>
      <AppText.H1>H1 Component</AppText.H1>
      <AppText.H2>H2 Component</AppText.H2>
      <AppText.Body>AppText.Body</AppText.Body>
      <AppText.Caption>AppText.Caption</AppText.Caption>
      <AppText.Code>AppText.Code</AppText.Code>
    </Section>
  );
}

// ============================================================================
// 6–12. ANIMATIONS
// ============================================================================
function FadeAnimationsDemo() {
  return (
    <Section title="6️⃣ Fade Animations" initiallyExpanded={false}>
      <AppText animated animation={{ type: "fadeIn", duration: 1000 }}>
        fadeIn
      </AppText>
      <AppText animated animation={{ type: "fadeOut", duration: 1000 }}>
        fadeOut
      </AppText>
      <AppText animated animation={{ type: "blink", duration: 2000 }}>
        blink
      </AppText>
      <AppText animated animation={{ type: "glow", duration: 2000 }}>
        glow
      </AppText>
    </Section>
  );
}

function SlideAnimationsDemo() {
  return (
    <Section title="7️⃣ Slide Animations" initiallyExpanded={false}>
      <AppText animated animation={{ type: "slideInRight", duration: 800 }}>
        slideInRight
      </AppText>
      <AppText animated animation={{ type: "slideInLeft", duration: 800 }}>
        slideInLeft
      </AppText>
      <AppText animated animation={{ type: "slideInUp", duration: 800 }}>
        slideInUp
      </AppText>
      <AppText animated animation={{ type: "slideInDown", duration: 800 }}>
        slideInDown
      </AppText>
    </Section>
  );
}

function BounceScaleAnimationsDemo() {
  return (
    <Section title="8️⃣ Bounce & Scale Animations" initiallyExpanded={false}>
      <AppText animated animation={{ type: "bounceIn", duration: 1000 }}>
        bounceIn
      </AppText>
      <AppText animated animation={{ type: "zoomIn", duration: 600 }}>
        zoomIn
      </AppText>
      <AppText animated animation={{ type: "pulse", duration: 1500 }}>
        pulse
      </AppText>
      <AppText animated animation={{ type: "rubberBand", duration: 1000 }}>
        rubberBand
      </AppText>
    </Section>
  );
}

function RotateFlipAnimationsDemo() {
  return (
    <Section title="9️⃣ Rotate & Flip Animations" initiallyExpanded={false}>
      <AppText animated animation={{ type: "rotateIn", duration: 800 }}>
        rotateIn
      </AppText>
      <AppText animated animation={{ type: "flipInX", duration: 1000 }}>
        flipInX
      </AppText>
      <AppText animated animation={{ type: "flipInY", duration: 1000 }}>
        flipInY
      </AppText>
    </Section>
  );
}

function SpecialAnimationsDemo() {
  return (
    <Section title="🔟 Special Animations" initiallyExpanded={false}>
      <AppText animated animation={{ type: "shake", duration: 1000 }}>
        shake
      </AppText>
      <AppText animated animation={{ type: "wobble", duration: 1000 }}>
        wobble
      </AppText>
      <AppText animated animation={{ type: "swing", duration: 1000 }}>
        swing
      </AppText>
      <AppText animated animation={{ type: "tada", duration: 1000 }}>
        tada
      </AppText>
      <AppText animated animation={{ type: "neon", duration: 2000 }}>
        neon
      </AppText>
      <AppText animated animation={{ type: "gradientShift", duration: 3000 }}>
        gradientShift
      </AppText>
    </Section>
  );
}

function TypewriterDemo() {
  return (
    <Section title="1️⃣1️⃣ Typewriter Animation" initiallyExpanded={false}>
      <AppText
        animated
        animation={{ type: "typewriter", speed: 30, delay: 500 }}
        cursor
      >
        This text types itself character by character. Watch each letter appear!
      </AppText>
      <AppText
        animated
        animation={{ type: "typewriter", speed: 60, delay: 300 }}
      >
        Faster typewriter with 60ms speed
      </AppText>
    </Section>
  );
}

function WaveDemo() {
  return (
    <Section title="1️⃣2️⃣ Wave Animation" initiallyExpanded={false}>
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
// 13. TRUNCATION
// ============================================================================
function TruncationDemo() {
  return (
    <Section title="1️⃣3️⃣ Truncation & Expand">
      <AppText
        numberOfLines={2}
        expandText="Read more..."
        collapseText="Show less"
        onExpand={() => Alert.alert("Expanded!", "Text is now fully visible")}
        onCollapse={() => Alert.alert("Collapsed!")}
      >
        This is a long text that will be truncated after two lines. The user can
        click "Read more" to see the full content. This is useful for displaying
        preview text in lists or cards where you want to show a brief excerpt of
        the content before expanding.
      </AppText>
    </Section>
  );
}

// ============================================================================
// 14. LOCALIZATION
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
            <AppText size={13}>{lang.flag}</AppText>
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
          ICU Plural:
        </AppText>
        <AppText>{t("icu_plural", { count: 0 })}</AppText>
        <AppText>{t("icu_plural", { count: 1 })}</AppText>
        <AppText>{t("icu_plural", { count: 5 })}</AppText>

        <AppText
          variant="titleSmall"
          style={{ marginTop: 15, marginBottom: 5 }}
        >
          ICU Select:
        </AppText>
        <AppText>{t("icu_select_gender", { gender: "male" })}</AppText>
        <AppText>{t("icu_select_gender", { gender: "female" })}</AppText>
      </View>

      <AppText variant="caption" color="#666" style={{ marginTop: 10 }}>
        Direction: {direction.toUpperCase()} {isRTL ? "(RTL)" : "(LTR)"}
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
        With Nested Components:
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
    </Section>
  );
}

// ============================================================================
// 16. MARKDOWN TRANS (updated for nested support)
// ============================================================================
function MarkdownTransDemo() {
  return (
    <Section title="1️⃣6️⃣ MarkdownTrans Component">
      <AppText variant="titleSmall" style={{ marginBottom: 8 }}>
        Basic Markdown:
      </AppText>
      <MarkdownTrans
        i18nKey="rich_markdown"
        markdownStyles={{
          bold: { fontWeight: "700" },
          italic: { fontStyle: "italic" },
          link: { color: "#3B82F6", textDecorationLine: "underline" },
        }}
        onLinkPress={(url) => Linking.openURL(url).catch(() => {})}
      />

      <AppText variant="titleSmall" style={{ marginTop: 15, marginBottom: 8 }}>
        Nested Markdown :
      </AppText>
      <AppText variant="caption" color="#6B7280" style={{ marginBottom: 6 }}>
        **_bold italic_** and **[bold link](url)** — recursive descent parser
      </AppText>
      <MarkdownTrans
        i18nKey="rich_nested"
        markdownStyles={{
          bold: { fontWeight: "800", color: "#1F2937" },
          italic: { fontStyle: "italic", color: "#6366F1" },
          link: { color: "#3B82F6", textDecorationLine: "underline" },
        }}
        onLinkPress={(url) => Linking.openURL(url).catch(() => {})}
      />

      <View style={styles.infoBox}>
        <AppText variant="caption" color="#374151">
          Supported: **bold** · *italic* · __underline__ · ~~strikethrough~~ ·
          {"`"}code{"` ·"} [link](url) · {"{{component:text}}"}
          {"\n"}Nested: **_bold italic_** · **[bold link](url)**
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
        <AppText size={fontSize40}>Responsive 40 (clamped 32–56)</AppText>
        <AppText size={fontSize28}>Responsive 28</AppText>
        <AppText size={fontSize20}>Responsive 20</AppText>
        <AppText size={fontSize14}>Responsive 14</AppText>
        <AppText size={fontSize10}>Responsive 10</AppText>
      </View>
    </Section>
  );
}

// ============================================================================
// 18. SCRIPT DETECTION & RTL TEXT
// ============================================================================
function ScriptDetectionDemo() {
  return (
    <Section
      title="1️⃣8️⃣ Script Detection & RTL Scripts"
      initiallyExpanded={false}
    >
      <AppText variant="titleSmall" style={{ marginBottom: 8 }}>
        LTR Scripts:
      </AppText>
      <AppText>Latin: Hello World</AppText>
      <AppText>Chinese: 你好世界</AppText>
      <AppText>Japanese: こんにちは世界</AppText>
      <AppText>Hindi: नमस्ते दुनिया</AppText>

      <AppText variant="titleSmall" style={{ marginTop: 15, marginBottom: 8 }}>
        RTL Scripts:
      </AppText>
      <AppText style={{ textAlign: "right" }}>Arabic: مرحبا بالعالم</AppText>
      <AppText style={{ textAlign: "right" }}>Hebrew: שלום עולם</AppText>
      <AppText style={{ textAlign: "right" }}>Persian: سلام دنیا</AppText>
    </Section>
  );
}

// ============================================================================
// 19. NUMBER FORMATTER
// ============================================================================
function NumberFormatterDemo() {
  return (
    <Section title="1️⃣9️⃣ Number Formatter" initiallyExpanded={false}>
      <AppText variant="titleSmall" style={{ marginBottom: 8 }}>
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
        Compact:
      </AppText>
      <AppText>{NumberFormatter.formatCompact(1_500_000, "en-US")}</AppText>
      <AppText>{NumberFormatter.formatCompact(2_300_000_000, "en-US")}</AppText>

      <AppText variant="titleSmall" style={{ marginTop: 12, marginBottom: 8 }}>
        Ordinals:
      </AppText>
      <AppText>
        {OrdinalFormatter.format(1, "en")}, {OrdinalFormatter.format(2, "en")},{" "}
        {OrdinalFormatter.format(3, "en")}, {OrdinalFormatter.format(4, "en")},{" "}
        {OrdinalFormatter.format(11, "en")}, {OrdinalFormatter.format(21, "en")}
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
        Active theme colours:
      </AppText>
      <View style={styles.colorSwatches}>
        {Object.entries({
          primary: theme.colors.primary,
          secondary: theme.colors.secondary,
          success: theme.colors.success,
          warning: theme.colors.warning,
          error: theme.colors.error,
          info: theme.colors.info,
        }).map(([name, color]) => (
          <View key={name} style={styles.swatchContainer}>
            <View style={[styles.swatch, { backgroundColor: color }]} />
            <AppText variant="caption">{name}</AppText>
          </View>
        ))}
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
        Header (role=header)
      </AppText>
      <AppText
        accessibilityLabel="Clickable link"
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
      <AppText accessibilityState={{ selected: true }}>Selected State</AppText>
      <AppText accessibilityState={{ disabled: true }}>Disabled State</AppText>
    </Section>
  );
}

// ============================================================================
// 22. PERFORMANCE MONITORING (existing)
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
        TranslationErrorBoundary catches errors and shows fallback UI.
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
              Caught by boundary
            </AppText>
          </View>
        }
        onError={(error) => console.log("Translation error:", error.message)}
      >
        {showError && <AppText>{undefined}</AppText>}
        {!showError && (
          <AppText>Error boundary is watching — tap button to test</AppText>
        )}
      </TranslationErrorBoundary>
    </Section>
  );
}

// ============================================================================
// 24. — useAutoLocale & useDeviceLocale
// ============================================================================
function AutoLocaleDemo() {
  const deviceLocale = useDeviceLocale();
  const autoLocale = useAutoLocale({
    supportedLocales: ["en", "ar", "fr", "ja"],
    fallback: "en",
  });

  return (
    <Section title="2️⃣4️⃣ Auto Locale Detection">
      <View style={styles.infoBox}>
        <AppText variant="caption" color="#6366F1" weight="600">
          useDeviceLocale() — Raw system locale
        </AppText>
        <AppText variant="bodyMedium" style={{ marginTop: 4 }}>
          📱 {deviceLocale}
        </AppText>
      </View>

      <View style={[styles.infoBox, { marginTop: 10 }]}>
        <AppText variant="caption" color="#6366F1" weight="600">
          useAutoLocale({"{"} supportedLocales: ['en','ar','fr','ja'] {"}"})
        </AppText>
        <AppText variant="bodyMedium" style={{ marginTop: 4 }}>
          ✅ Best match: {autoLocale}
        </AppText>
        <AppText variant="caption" color="#6B7280" style={{ marginTop: 4 }}>
          Filters device locale against your supported list. Fallback to "en" if
          no match found.
        </AppText>
      </View>

      <AppText variant="caption" color="#9CA3AF" style={{ marginTop: 8 }}>
        isRTLLanguage('ar') → {String(isRTLLanguage("ar"))} ✅{"\n"}
        isRTLLanguage('en') → {String(isRTLLanguage("en"))} ✅
      </AppText>
    </Section>
  );
}

// ============================================================================
// 25. — useUpdateAppTheme — Runtime Theme Hot-Patching
// ============================================================================
function RuntimeThemeDemo() {
  const updateTheme = useUpdateAppTheme();
  const theme = useAppTextTheme();
  const { t } = useLang();
  const [activePreset, setActivePreset] = useState("indigo");

  return (
    <Section title="2️⃣5️⃣ Runtime Theme Update">
      <AppText variant="bodySmall" color="#6B7280" style={{ marginBottom: 12 }}>
        useUpdateAppTheme() — hot-patches theme tokens without remounting the
        provider.
      </AppText>

      <View style={styles.presetRow}>
        {Object.entries(THEME_PRESETS).map(([key, preset]) => (
          <Pressable
            key={key}
            style={[
              styles.presetButton,
              { backgroundColor: preset.primary },
              activePreset === key && styles.presetButtonActive,
            ]}
            onPress={() => {
              setActivePreset(key);
              updateTheme({
                colors: {
                  primary: preset.primary,
                  secondary: preset.secondary,
                },
              });
            }}
          >
            <AppText size={12} color="#FFF" weight="600">
              {preset.color}
            </AppText>
          </Pressable>
        ))}
      </View>

      <View style={styles.infoBox}>
        <AppText variant="caption" color="#6B7280">
          Current primary colour
        </AppText>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginTop: 6,
          }}
        >
          <View
            style={[styles.themeDot, { backgroundColor: theme.colors.primary }]}
          />
          <AppText variant="bodyMedium" weight="600">
            {theme.colors.primary}
          </AppText>
        </View>
        <AppText variant="caption" color="#6B7280" style={{ marginTop: 6 }}>
          Try:{" "}
          {t("theme_demo", {
            color: THEME_PRESETS[activePreset]?.color || "Indigo",
          })}
        </AppText>
      </View>

      <AppText
        variant="titleMedium"
        color={theme.colors.primary}
        style={{ marginTop: 8 }}
        animated
        animation={{ type: "fadeIn", duration: 400 }}
      >
        ● Text using theme primary colour
      </AppText>
    </Section>
  );
}

// ============================================================================
// 26. — AppTextSkeleton — Shimmer Loading Placeholder
// ============================================================================
function SkeletonDemo() {
  const [showSkeleton, setShowSkeleton] = useState(true);

  return (
    <Section title="2️⃣6️⃣ AppTextSkeleton">
      <AppText variant="bodySmall" color="#6B7280" style={{ marginBottom: 12 }}>
        Shimmer placeholder matching variant line-heights. Ideal for lazy
        translation loading.
      </AppText>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#6366F1" }]}
        onPress={() => {
          setShowSkeleton(true);
          setTimeout(() => setShowSkeleton(false), 2500);
        }}
      >
        <AppText color="#FFF">▶ Simulate Loading (2.5s)</AppText>
      </TouchableOpacity>

      {showSkeleton ? (
        <View style={{ marginTop: 12, gap: 10 }}>
          <AppText variant="caption" color="#9CA3AF">
            Skeleton placeholders:
          </AppText>
          <AppTextSkeleton variant="headlineMedium" width={220} />
          <AppTextSkeleton variant="titleSmall" width={160} />
          <AppTextSkeleton variant="bodyMedium" lines={3} lastLineWidth="55%" />
          <AppTextSkeleton variant="labelMedium" width={100} />

          <AppText variant="caption" color="#9CA3AF" style={{ marginTop: 8 }}>
            Dark mode variant:
          </AppText>
          <View
            style={{ backgroundColor: "#1F2937", padding: 12, borderRadius: 8 }}
          >
            <AppTextSkeleton
              variant="titleMedium"
              width={180}
              baseColor="#374151"
              shimmerColor="#4B5563"
            />
            <AppTextSkeleton
              variant="bodyMedium"
              lines={2}
              baseColor="#374151"
              shimmerColor="#4B5563"
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      ) : (
        <View style={{ marginTop: 12 }}>
          <AppText
            variant="headlineMedium"
            animated
            animation={{ type: "fadeIn", duration: 400 }}
          >
            Content Loaded ✓
          </AppText>
          <AppText variant="titleSmall" color="#6B7280">
            Subtitle text visible
          </AppText>
          <AppText variant="bodyMedium" style={{ marginTop: 4 }}>
            The skeleton placeholder has been replaced with real content. The
            line heights matched perfectly during loading.
          </AppText>
        </View>
      )}
    </Section>
  );
}

// ============================================================================
// 27. — RTLProvider & useRTL
// ============================================================================
function RTLProviderDemo() {
  const { isRTL, setRTL, restartRequired } = useRTL();
  const flexDir = useRTLFlexDirection("row");

  return (
    <Section title="2️⃣7️⃣ RTLProvider & useRTL">
      <AppText variant="bodySmall" color="#6B7280" style={{ marginBottom: 12 }}>
        RTLProvider wraps I18nManager.forceRTL(). useRTL() gives you isRTL,
        setRTL(), and restartRequired.
      </AppText>

      <View style={styles.infoBox}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <AppText variant="caption" color="#6B7280">
            isRTL
          </AppText>
          <AppText variant="bodyMedium" color={isRTL ? "#10B981" : "#6366F1"}>
            {String(isRTL)} {isRTL ? "←" : "→"}
          </AppText>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 4,
          }}
        >
          <AppText variant="caption" color="#6B7280">
            restartRequired
          </AppText>
          <AppText
            variant="bodyMedium"
            color={restartRequired ? "#F59E0B" : "#10B981"}
          >
            {String(restartRequired)}
          </AppText>
        </View>
      </View>

      {/* useRTLFlexDirection demo */}
      <AppText
        variant="caption"
        color="#6B7280"
        style={{ marginTop: 12, marginBottom: 6 }}
      >
        useRTLFlexDirection('row') = {flexDir} — nav bar demo:
      </AppText>
      <View style={[styles.navBar, { flexDirection: flexDir }]}>
        <View style={styles.navIcon}>
          <AppText size={18}>☰</AppText>
        </View>
        <AppText
          variant="titleSmall"
          style={{ flex: 1, textAlign: isRTL ? "right" : "left" }}
        >
          App Title
        </AppText>
        <View style={styles.navIcon}>
          <AppText size={18}>🔔</AppText>
        </View>
        <View style={styles.navIcon}>
          <AppText size={18}>👤</AppText>
        </View>
      </View>

      {/* isRTLLanguage demo */}
      <AppText
        variant="caption"
        color="#6B7280"
        style={{ marginTop: 12, marginBottom: 6 }}
      >
        isRTLLanguage() detection:
      </AppText>
      <View style={{ gap: 2 }}>
        {[
          ["ar", "Arabic"],
          ["he", "Hebrew"],
          ["fa", "Farsi"],
          ["ur", "Urdu"],
          ["en", "English"],
          ["fr", "French"],
          ["ja", "Japanese"],
        ].map(([code, name]) => (
          <View key={code} style={{ flexDirection: "row", gap: 8 }}>
            <AppText variant="caption" style={{ width: 60 }} color="#6B7280">
              {code}
            </AppText>
            <AppText variant="caption" style={{ width: 70 }}>
              {name}
            </AppText>
            <AppText
              variant="caption"
              color={isRTLLanguage(code) ? "#EF4444" : "#10B981"}
            >
              {isRTLLanguage(code) ? "RTL ◀" : "LTR ▶"}
            </AppText>
          </View>
        ))}
      </View>

      {restartRequired && (
        <View
          style={[
            styles.infoBox,
            { backgroundColor: "#FEF3C7", marginTop: 12 },
          ]}
        >
          <AppText variant="caption" color="#92400E">
            ⚠️ A full app restart is needed for native RTL layout mirroring to
            take effect.
          </AppText>
        </View>
      )}
    </Section>
  );
}

// ============================================================================
// 28. — AppTextDevTools
// ============================================================================
function DevToolsDemo() {
  const { t } = useLang();
  // Trigger some translations to populate stats
  const _ = [
    t("welcome"),
    t("greeting", { name: "Demo" }),
    t("icu_plural", { count: 3 }),
    t("rich_markdown"),
  ];

  return (
    <Section title="2️⃣8️⃣ AppTextDevTools">
      <View style={styles.infoBox}>
        <AppText variant="caption" color="#6366F1" weight="600">
          🔤 DevTools overlay is active
        </AppText>
        <AppText variant="bodySmall" color="#6B7280" style={{ marginTop: 6 }}>
          Look for the "🔤 AppText" badge in the{" "}
          <AppText weight="700" color="#1F2937">
            bottom-right corner
          </AppText>{" "}
          of the screen. Tap it to expand the performance panel.
        </AppText>
      </View>

      <View style={{ marginTop: 12 }}>
        <AppText variant="titleSmall" style={{ marginBottom: 6 }}>
          Overlay shows:
        </AppText>
        {[
          "📊 LRU cache hit rate (colour-coded: green ≥90%, amber ≥60%, red <60%)",
          "⚡️ Top 5 slowest translation keys by p95 latency",
          "🌍 Current language and text direction",
          "🗑️ Cache & stats clear button",
        ].map((item, i) => (
          <View
            key={i}
            style={{ flexDirection: "row", gap: 8, marginBottom: 4 }}
          >
            <AppText variant="caption">{item}</AppText>
          </View>
        ))}
      </View>

      <AppText variant="caption" color="#9CA3AF" style={{ marginTop: 8 }}>
        Only renders in __DEV__ mode. Safe to import unconditionally — renders
        null in production builds.
      </AppText>
    </Section>
  );
}

// ============================================================================
// 29. INTERACTIVE FEATURES
// ============================================================================
function InteractiveFeaturesDemo() {
  const [count, setCount] = useState(0);

  return (
    <Section title="2️⃣9️⃣ Interactive Features">
      <AppText onPress={() => Alert.alert("Tapped!", "You tapped on the text")}>
        Tap me! — onPress handler
      </AppText>
      <AppText onPress={() => setCount(count + 1)} style={{ marginTop: 8 }}>
        Tap count: {count} (tap to increment)
      </AppText>
      <AppText
        onPress={() => setCount(0)}
        style={{
          marginTop: 8,
          color: count > 5 ? "#EF4444" : "#10B981",
          fontWeight: count > 3 ? "700" : "400",
        }}
      >
        {count === 0
          ? "Tap to start"
          : count > 5
            ? "Warning: High count! Tap to reset."
            : "Keep tapping..."}
      </AppText>
    </Section>
  );
}

// ============================================================================
// CSS-Only RTL (no restart needed)
// ============================================================================
function InnerCSSRTLDemo() {
  const { isRTL, mode } = useRTL();
  const rtlStyle = useRTLStyle();

  return (
    <View style={{ marginTop: 12, gap: 10 }}>
      <View style={styles.infoBox}>
        <AppText variant="caption" color="#6B7280">
          isRTL: <AppText weight="700">{String(isRTL)}</AppText>
          {" · "}mode:{" "}
          <AppText weight="700" color="#10B981">
            {mode}
          </AppText>
        </AppText>
      </View>

      {/* RTLView auto-mirrors */}
      <RTLView
        style={{
          gap: 8,
          padding: 10,
          backgroundColor: "#F0F4FF",
          borderRadius: 8,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#6366F1",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <AppText color="#FFF" size={18}>
            A
          </AppText>
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="titleSmall">
            {isRTL ? "مرحبا بالعالم" : "Hello World"}
          </AppText>
          <AppText variant="caption" color="#6B7280">
            {isRTL
              ? "محاذاة تلقائية بدون إعادة تشغيل"
              : "Auto-mirrored without restart"}
          </AppText>
        </View>
        <AppText size={20}>{isRTL ? "◄" : "►"}</AppText>
      </RTLView>

      {/* useRTLStyle row demo */}
      <View style={[rtlStyle.row, { gap: 8 }]}>
        {["Home", "Search", "Profile"].map((item) => (
          <View
            key={item}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: "#E0E7FF",
              borderRadius: 16,
            }}
          >
            <AppText variant="labelMedium" color="#4338CA">
              {item}
            </AppText>
          </View>
        ))}
      </View>

      <AppText variant="caption" color="#9CA3AF">
        {"useRTLStyle().row flexDirection = " + (isRTL ? "row-reverse" : "row")}
      </AppText>
    </View>
  );
}

function CSSRTLDemo() {
  const [cssLang, setCssLang] = useState("en");

  return (
    <Section title="3️⃣0️⃣ CSS RTL (no restart)" initiallyExpanded={false}>
      <AppText variant="bodySmall" color="#6B7280" style={{ marginBottom: 12 }}>
        mode='css' mirrors layout via flexDirection instantly.{"\n"}
        No I18nManager.forceRTL() — no restart required.
      </AppText>

      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        {["en", "ar"].map((lang) => (
          <TouchableOpacity
            key={lang}
            style={[
              styles.langButton,
              cssLang === lang && styles.langButtonSelected,
            ]}
            onPress={() => setCssLang(lang)}
          >
            <AppText size={12} color={cssLang === lang ? "#FFF" : "#374151"}>
              {lang === "en" ? "🇺🇸 LTR" : "🇸🇦 RTL"}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      <RTLProvider language={cssLang} mode="css">
        <InnerCSSRTLDemo />
      </RTLProvider>
    </Section>
  );
}

// ============================================================================
// Dynamic Type Categories
// ============================================================================
function DynamicTypeDemo() {
  const { PixelRatio } = require("react-native");
  const category = useDynamicTypeCategory();
  const scaledTitle = useDynamicTypeFontSize(28, { min: 20, max: 48 });
  const scaledBody = useDynamicTypeFontSize(16, { min: 13, max: 26 });
  const fontScale = PixelRatio.getFontScale();
  const isAccessibility = category.startsWith("accessibility");

  return (
    <Section title="3️⃣1️⃣ Dynamic Type" initiallyExpanded={false}>
      <AppText variant="bodySmall" color="#6B7280" style={{ marginBottom: 12 }}>
        useDynamicTypeCategory() maps PixelRatio.getFontScale() to semantic iOS
        Dynamic Type size names. Increase text size in device Settings to test.
      </AppText>

      <View style={styles.infoBox}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <AppText variant="caption" color="#6B7280">
            fontScale
          </AppText>
          <AppText variant="bodyMedium" weight="700">
            {fontScale.toFixed(2)}x
          </AppText>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 4,
          }}
        >
          <AppText variant="caption" color="#6B7280">
            category
          </AppText>
          <AppText
            variant="bodyMedium"
            weight="700"
            color={isAccessibility ? "#EF4444" : "#10B981"}
          >
            {category}
          </AppText>
        </View>
      </View>

      <View style={{ marginTop: 12 }}>
        <AppText variant="caption" color="#9CA3AF" style={{ marginBottom: 4 }}>
          {"useDynamicTypeFontSize(28) → " + scaledTitle.toFixed(1) + "px"}
        </AppText>
        <AppText size={scaledTitle} weight="700">
          Heading scales with system font
        </AppText>

        <AppText
          variant="caption"
          color="#9CA3AF"
          style={{ marginTop: 10, marginBottom: 4 }}
        >
          {"useDynamicTypeFontSize(16, min:13, max:26) → " +
            scaledBody.toFixed(1) +
            "px"}
        </AppText>
        <AppText size={scaledBody}>
          Body text also scales proportionally. Clamped between min and max to
          prevent layout breakage.
        </AppText>
      </View>

      {isAccessibility && (
        <View
          style={[
            styles.infoBox,
            { backgroundColor: "#FEF3C7", marginTop: 12 },
          ]}
        >
          <AppText variant="caption" color="#92400E">
            ⚠️ Accessibility text size detected. Consider switching to a
            single-column layout.
          </AppText>
        </View>
      )}
    </Section>
  );
}

// ============================================================================
// Text-to-Speech (no external package)
// ============================================================================
function TTSDemo() {
  const { speak: speakHook } = useSpeech();
  const [lastSpoken, setLastSpoken] = useState("");

  const ttsItems = [
    {
      label: "Welcome message",
      text: "Welcome to AppText, the production-grade text library for React Native.",
      color: "#6366F1",
    },
    {
      label: "Arabic",
      text: "مرحباً بك في AppText",
      color: "#8B5CF6",
    },
    {
      label: "Announcement",
      text: "Version 4.4.0 is now available with new features and bug fixes.",
      color: "#3B82F6",
    },
  ];

  return (
    <Section title="3️⃣2️⃣ Text-to-Speech" initiallyExpanded={false}>
      <AppText variant="bodySmall" color="#6B7280" style={{ marginBottom: 12 }}>
        useSpeech() wraps AccessibilityInfo.announceForAccessibility — zero
        external packages. Works with VoiceOver (iOS) and TalkBack (Android).
      </AppText>

      {ttsItems.map(({ label, text, color }) => (
        <TouchableOpacity
          key={label}
          style={[styles.button, { backgroundColor: color, marginBottom: 8 }]}
          onPress={() => {
            speakHook(text);
            setLastSpoken(label);
          }}
        >
          <AppText color="#FFF" size={13}>
            🔊 Speak: {label}
          </AppText>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#374151", marginBottom: 8 }]}
        onPress={() => {
          speak(
            "This is the standalone speak() utility — called outside a hook.",
          );
          setLastSpoken("standalone speak()");
        }}
      >
        <AppText color="#FFF" size={13}>
          🔊 Standalone speak() utility
        </AppText>
      </TouchableOpacity>

      {lastSpoken ? (
        <View style={styles.infoBox}>
          <AppText variant="caption" color="#6366F1">
            Last spoken: <AppText weight="700">{lastSpoken}</AppText>
          </AppText>
          <AppText variant="caption" color="#6B7280" style={{ marginTop: 2 }}>
            Enable VoiceOver / TalkBack to hear the audio output.
          </AppText>
        </View>
      ) : null}
    </Section>
  );
}

// ============================================================================
// Text Selection Context Menu
// ============================================================================
function ContextMenuDemo() {
  const [lastAction, setLastAction] = useState("");
  const sampleText =
    "Long-press this text to see the custom context menu with Copy, Share, and Speak actions.";
  const shortText = "Hello, AppText!";

  return (
    <Section title="3️⃣3️⃣ Context Menu" initiallyExpanded={false}>
      <AppText variant="bodySmall" color="#6B7280" style={{ marginBottom: 12 }}>
        AppTextContextMenu is a JS-only long-press popup — no native integration
        needed. Positions itself near the press location.
      </AppText>

      <AppText variant="caption" color="#6B7280" style={{ marginBottom: 6 }}>
        Light theme menu:
      </AppText>

      <AppTextContextMenu
        longPressDelay={400}
        onMenuOpen={() => setLastAction("Menu opened")}
        actions={[
          {
            label: "Copy",
            icon: "📋",
            onPress: () => setLastAction("Copied text"),
          },
          {
            label: "Speak",
            icon: "🔊",
            onPress: () => {
              speak(sampleText);
              setLastAction("Speaking...");
            },
          },
          {
            label: "Share",
            icon: "📤",
            onPress: () => {
              Alert.alert("Share", sampleText);
              setLastAction("Share dialog opened");
            },
          },
          {
            label: "Delete",
            icon: "🗑️",
            destructive: true,
            onPress: () => setLastAction("Deleted (simulated)"),
          },
        ]}
      >
        <View style={[styles.infoBox, { backgroundColor: "#F9FAFB" }]}>
          <AppText selectable>{sampleText}</AppText>
        </View>
      </AppTextContextMenu>

      <AppText
        variant="caption"
        color="#6B7280"
        style={{ marginTop: 12, marginBottom: 6 }}
      >
        Dark theme menu + disabled action:
      </AppText>

      <AppTextContextMenu
        actions={[
          {
            label: "Copy",
            icon: "📋",
            onPress: () => setLastAction("Copied: " + shortText),
          },
          {
            label: "Translate",
            icon: "🌐",
            disabled: true,
            onPress: () => {},
          },
          {
            label: "Speak",
            icon: "🔊",
            onPress: () => {
              speak(shortText);
              setLastAction("Speaking: " + shortText);
            },
          },
        ]}
        menuBackgroundColor="#1F2937"
        actionTextColor="#F9FAFB"
        destructiveColor="#F87171"
      >
        <View
          style={{
            padding: 12,
            backgroundColor: "#1F2937",
            borderRadius: 8,
            marginBottom: 4,
          }}
        >
          <AppText color="#F9FAFB" selectable>
            {shortText}
          </AppText>
        </View>
      </AppTextContextMenu>

      {lastAction ? (
        <View style={[styles.infoBox, { marginTop: 10 }]}>
          <AppText variant="caption" color="#10B981">
            ✅ {lastAction}
          </AppText>
        </View>
      ) : (
        <AppText variant="caption" color="#9CA3AF" style={{ marginTop: 8 }}>
          Long-press the boxes above to trigger the context menu.
        </AppText>
      )}
    </Section>
  );
}

// ============================================================================
// Plugin System
// ============================================================================
function PluginSystemDemo() {
  const [pluginEnabled, setPluginEnabled] = useState(false);
  const hasRegistered = useRef(false);

  useEffect(() => {
    if (pluginEnabled) {
      registerAppTextPlugin({
        name: "emoji-transformer",
        order: 10,
        transform: (text) =>
          text
            .replace(/:smile:/g, "😊")
            .replace(/:fire:/g, "🔥")
            .replace(/:rocket:/g, "🚀"),
        themeExtension: {
          colors: { textSecondary: "#8B5CF6" }, // Temporarily hijack secondary color
        },
      });
      hasRegistered.current = true;
    } else if (hasRegistered.current) {
      unregisterAppTextPlugin("emoji-transformer");
      hasRegistered.current = false;
    }
  }, [pluginEnabled]);

  return (
    <Section title="3️⃣4️⃣ Plugin System" initiallyExpanded={false}>
      <AppText variant="bodySmall" color="#6B7280" style={{ marginBottom: 12 }}>
        Plugins can intercept and transform text before rendering (memo-safe,
        purely synchronous) and deeply extend the active AppTextTheme.
      </AppText>

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: pluginEnabled ? "#10B981" : "#6366F1",
            marginBottom: 12,
          },
        ]}
        onPress={() => setPluginEnabled(!pluginEnabled)}
      >
        <AppText color="#FFF">
          {pluginEnabled ? "✅ Emoji Plugin Active" : "Enable Emoji Plugin"}
        </AppText>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <AppText
          variant="labelMedium"
          color="textSecondary"
          style={{ marginBottom: 4 }}
        >
          "This project is fire :fire:, launching soon :rocket:!"
        </AppText>
        <AppText variant="caption" color="#9CA3AF">
          (Notice how `textSecondary` color changes when the plugin is active,
          due to theme extension)
        </AppText>
      </View>
    </Section>
  );
}

// ============================================================================
// Remote Translations
// ============================================================================
function RemoteTranslationsDemo() {
  const [remoteKey, setRemoteKey] = useState(0); // For forcing re-mount

  return (
    <Section title="3️⃣5️⃣ Remote Sync" initiallyExpanded={false}>
      <AppText variant="bodySmall" color="#6B7280" style={{ marginBottom: 12 }}>
        RemoteLocaleProvider implements an SWR (stale-while-revalidate) cache.
        It serves cached translations instantly (zero render block) while
        fetching updates in the background.
      </AppText>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#374151" }]}
        onPress={() => setRemoteKey((k) => k + 1)}
      >
        <AppText color="#FFF">Trigger Remount</AppText>
      </TouchableOpacity>

      {/* Wrapping in a local provider just for the demo boundary */}
      <View style={{ marginTop: 12 }} key={remoteKey}>
        <RemoteLocaleProvider
          endpoint="https://raw.githubusercontent.com/Ganesh1110/react-native-text-kit/main/package.json" // Fake endpoint for demo
          cacheStrategy="stale-while-revalidate"
          fallback={{ en: { demo_key: "Fallback Translation (Offline)" } }}
          onFetchError={() => console.log("Demo fetch failed gracefully")}
        >
          <RemoteDemoInner />
        </RemoteLocaleProvider>
      </View>
    </Section>
  );
}

function RemoteDemoInner() {
  const { status, refresh, lastUpdated } = useRemoteLocales();

  return (
    <View style={styles.infoBox}>
      <AppText>
        Status:{" "}
        <AppText
          weight="700"
          color={status === "success" ? "#10B981" : "#F59E0B"}
        >
          {status}
        </AppText>
      </AppText>
      {lastUpdated && (
        <AppText variant="caption" color="#6B7280" style={{ marginTop: 4 }}>
          Last updated: {new Date(lastUpdated).toLocaleTimeString()}
        </AppText>
      )}
      <TouchableOpacity onPress={refresh} style={{ marginTop: 8 }}>
        <AppText variant="caption" color="#6366F1">
          ↻ Manual Refresh
        </AppText>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// useTextMetrics
// ============================================================================
function TextMetricsDemo() {
  const text =
    "This is a long piece of text that we want to measure before actually displaying it on the screen. It might span multiple lines depending on the width.";

  const { metrics, GhostText } = useTextMetrics({
    text,
    variant: "bodySmall",
    maxWidth: 250,
    numberOfLines: 2,
  });

  return (
    <Section title="3️⃣6️⃣ useTextMetrics" initiallyExpanded={false}>
      <AppText variant="bodySmall" color="#6B7280" style={{ marginBottom: 12 }}>
        Measures text block dimensions and truncation state via a hidden ghost
        element before rendering.
      </AppText>

      {/* Render the ghost text somewhere in the tree */}
      <GhostText />

      <View style={{ flexDirection: "row", gap: 12 }}>
        <View
          style={{
            width: 250,
            backgroundColor: "#F9FAFB",
            padding: 8,
            borderColor: "#E5E7EB",
            borderWidth: 1,
          }}
        >
          <AppText variant="bodySmall" numberOfLines={2}>
            {text}
          </AppText>
        </View>

        <View style={{ flex: 1, justifyContent: "center" }}>
          {metrics.measured ? (
            <View>
              <AppText variant="caption">
                Width:{" "}
                <AppText weight="700">{metrics.width.toFixed(1)}px</AppText>
              </AppText>
              <AppText variant="caption">
                Height:{" "}
                <AppText weight="700">{metrics.height.toFixed(1)}px</AppText>
              </AppText>
              <AppText variant="caption">
                Lines: <AppText weight="700">{metrics.lines}</AppText>
              </AppText>
              <AppText
                variant="caption"
                color={metrics.isTruncated ? "#EF4444" : "#10B981"}
              >
                Truncated:{" "}
                <AppText weight="700">{String(metrics.isTruncated)}</AppText>
              </AppText>
            </View>
          ) : (
            <AppText variant="caption">Measuring...</AppText>
          )}
        </View>
      </View>
    </Section>
  );
}

// ============================================================================
// Accessibility & Analytics
// ============================================================================
function AnalyticsDemo() {
  // Using context exposed in App component
  return (
    <Section title="3️⃣7️⃣ Accessibility & Analytics" initiallyExpanded={false}>
      <AppText variant="bodySmall" color="#6B7280" style={{ marginBottom: 12 }}>
        AppTextProvider now exposes `onTranslate`, `onAnimationStart`, and
        `onPluginError` hooks for analytics tracing.
      </AppText>

      <AppText variant="caption" color="#6B7280" style={{ marginBottom: 4 }}>
        accessibilityMode="static"
      </AppText>
      <View style={styles.infoBox}>
        <AppText
          animation="typewriter"
          duration={3000}
          accessibilityMode="static"
        >
          This animated text exposes its full content to screen readers
          immediately, avoiding partial-read bugs on VoiceOver/TalkBack.
        </AppText>
      </View>
    </Section>
  );
}

// ============================================================================
// 33. Gradient Text (v4.6.0)
// ============================================================================
function GradientTextDemo() {
  const isSupported = isGradientSupported();

  if (!isSupported) {
    return (
      <Section title="3️⃣3️⃣ Gradient Text (v4.6.0)" initiallyExpanded={false}>
        <View style={styles.infoBox}>
          <AppText variant="caption" color="#F59E0B" weight="600">
            ⚠️ Gradient not available
          </AppText>
          <AppText variant="bodySmall" color="#6B7280" style={{ marginTop: 4 }}>
            Install dependencies to enable:
          </AppText>
          <AppText variant="caption" style={{ marginTop: 8 }} color="#666">
            npm install @react-native-community/masked-view react-native-linear-gradient
          </AppText>
        </View>
      </Section>
    );
  }

  return (
    <Section title="3️⃣3️⃣ Gradient Text (v4.6.0)" initiallyExpanded={false}>
      <AppText variant="bodySmall" color="#6B7280" style={{ marginBottom: 12 }}>
        Gradient text using MaskedView + LinearGradient. Requires optional dependencies.
      </AppText>

      <AppText variant="titleSmall" style={{ marginBottom: 8 }}>
        Horizontal Gradient:
      </AppText>
      <GradientText
        colors={["#FF6B6B", "#4ECDC4"]}
        style={{ fontSize: 24, fontWeight: "700", marginBottom: 12 }}
      >
        Beautiful Gradient Text
      </GradientText>

      <AppText variant="titleSmall" style={{ marginBottom: 8, marginTop: 8 }}>
        Vertical Gradient:
      </AppText>
      <GradientText
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ fontSize: 20, fontWeight: "600", marginBottom: 12 }}
      >
        Vertical Color Transition
      </GradientText>

      <AppText variant="titleSmall" style={{ marginBottom: 8, marginTop: 8 }}>
        Diagonal Gradient:
      </AppText>
      <GradientText
        colors={["#f093fb", "#f5576c"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ fontSize: 18, fontWeight: "500", marginBottom: 12 }}
      >
        Diagonal Pink Gradient
      </GradientText>

      <AppText variant="titleSmall" style={{ marginBottom: 8, marginTop: 8 }}>
        Rainbow Gradient:
      </AppText>
      <GradientText
        colors={["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"]}
        style={{ fontSize: 16, marginBottom: 12 }}
      >
        Rainbow Spectrum Text
      </GradientText>

      <View style={[styles.infoBox, { marginTop: 8 }]}>
        <AppText variant="caption" color="#10B981" weight="600">
          ✅ Gradient supported!
        </AppText>
        <AppText variant="caption" color="#6B7280" style={{ marginTop: 4 }}>
          Uses @react-native-community/masked-view + react-native-linear-gradient
        </AppText>
      </View>
    </Section>
  );
}

// ============================================================================
// MAIN CONTENT SCROLL VIEW
// ============================================================================
function Content() {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Existing features */}
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
      <WaveDemo />
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
      <AutoLocaleDemo />
      <RuntimeThemeDemo />
      <SkeletonDemo />
      <RTLProviderDemo />
      <DevToolsDemo />
      <InteractiveFeaturesDemo />
      <CSSRTLDemo />
      <DynamicTypeDemo />
      <TTSDemo />
      <ContextMenuDemo />
      <PluginSystemDemo />
      <RemoteTranslationsDemo />
      <TextMetricsDemo />
      <AnalyticsDemo />
      <GradientTextDemo />

      <View style={styles.footer}>
        <AppText variant="titleSmall" color="#6366F1">
          react-native-text-kit
        </AppText>
        <AppText variant="caption" color="#999">
          Version 4.6.0 — Full Feature Demo
        </AppText>
        <AppText variant="caption" color="#666" style={{ marginTop: 5 }}>
          All features demonstrated above are production-ready
        </AppText>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// MAIN APP — wraps with RTLProvider too
// ============================================================================
export default function App() {
  const colorScheme = useColorScheme();
  const [language, setLanguage] = useState("en");

  return (
    <AppTextProvider theme={customTheme}>
      <LocaleProvider
        translations={translations}
        defaultLanguage={language}
        fallbackLanguage="en"
        useICU={true}
        onMissingTranslation={(lang, key) => {
          if (__DEV__) console.log(`[i18n] Missing: "${key}" in ${lang}`);
        }}
      >
        {/* RTLProvider wraps the navigator */}
        <RTLProvider language={language} autoApply>
          <SafeAreaView
            style={[
              styles.container,
              colorScheme === "dark" && styles.darkContainer,
            ]}
          >
            <StatusBar
              barStyle={
                colorScheme === "dark" ? "light-content" : "dark-content"
              }
            />

            {/* Header */}
            <View style={styles.header}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <AppText variant="headlineMedium" weight="700">
                    AppText Demo
                  </AppText>
                  <AppText variant="bodySmall" color="#666">
                    Complete Feature Showcase
                  </AppText>
                </View>
                <View style={[styles.versionBadge]}>
                  <AppText size={10} color="#6366F1" weight="700">
                    react-native-text-kit
                  </AppText>
                </View>
              </View>
              <AppText variant="caption" color="#999" style={{ marginTop: 4 }}>
                Tap sections to expand/collapse · Scroll down for new features
              </AppText>
            </View>

            <Content />
          </SafeAreaView>

          {/* AppTextDevTools overlay — renders only in __DEV__ */}
          <AppTextDevTools
            position="bottom-right"
            refreshInterval={3000}
            defaultCollapsed={true}
          />
        </RTLProvider>
      </LocaleProvider>
    </AppTextProvider>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  darkContainer: {
    backgroundColor: "#111827",
  },
  header: {
    padding: 16,
    paddingBottom: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  versionBadge: {
    borderWidth: 1.5,
    borderColor: "#6366F1",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  contentContainer: {
    paddingBottom: 60,
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
    elevation: 2,
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
  newBadge: {
    backgroundColor: "#6366F1",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  newBadgeText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
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
    width: 54,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginBottom: 4,
  },
  colorBox: {
    backgroundColor: "#374151",
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
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
  infoBox: {
    backgroundColor: "#F0F4FF",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#6366F1",
  },
  presetRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  presetButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    opacity: 0.85,
  },
  presetButtonActive: {
    opacity: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  themeDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  navBar: {
    backgroundColor: "#1F2937",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    gap: 8,
  },
  navIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  v440Header: {
    alignItems: "center",
    paddingVertical: 16,
    marginVertical: 8,
  },
  v440Badge: {
    backgroundColor: "#6366F1",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  footer: {
    padding: 32,
    alignItems: "center",
  },
});
