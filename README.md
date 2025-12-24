# 🌟 React Native AppText

<div align="center">

**The Ultimate Typography & i18n Solution for React Native**  
_Beautiful text that works everywhere, in every language, blazing fast_

[![npm](https://img.shields.io/npm/v/react-native-apptext?label=VERSION&style=for-the-badge&logo=npm&color=red)](https://www.npmjs.com/package/react-native-apptext)
[![npm downloads](https://img.shields.io/npm/dm/react-native-apptext?style=for-the-badge&logo=npm&logoColor=white&color=4caf50)](https://www.npmjs.com/package/react-native-apptext)
[![bundle size](https://badgen.net/packagephobia/publish/react-native-apptext?style=for-the-badge&color=6a5acd)](https://packagephobia.com/result?p=react-native-apptext)

[📖 Docs](https://github.com/Ganesh1110/react-native-apptext/wiki) • [🐛 Issues](https://github.com/Ganesh1110/react-native-apptext/issues) • [💡 Feature Requests](https://github.com/Ganesh1110/react-native-apptext/issues)

</div>

---

## ⚡ Quick Start

### Installation

```bash
npm install react-native-apptext
# or
yarn add react-native-apptext
```

### 30-Second Demo

```tsx
import React from "react";
import AppText, { AppTextProvider } from "react-native-apptext";

export default function App() {
  return (
    <AppTextProvider>
      <AppText.DisplaySmall>Welcome to AppText</AppText.DisplaySmall>
      <AppText.BodyMedium color="secondary">
        Beautiful, performant text with i18n built-in
      </AppText.BodyMedium>
      <AppText.LabelSmall style={{ marginTop: 8 }}>
        60FPS • LRU Cache • Lazy Loading • 50+ Scripts
      </AppText.LabelSmall>
    </AppTextProvider>
  );
}
```

**No additional setup required for iOS or Android!** 🎉

---

## 🎯 Why AppText?

<!-- Moved "Why" section earlier for immediate value proposition -->

### The Problem We Solve

Building international apps with React Native means fighting:

- ❌ Broken text rendering in RTL languages (Arabic, Hebrew)
- ❌ Inconsistent font scaling across devices
- ❌ Poor performance with animations (janky scrolling)
- ❌ Complex theming systems that are hard to maintain
- ❌ Manual internationalization setup with slow lookups
- ❌ Large bundle sizes from loading all translations upfront
- ❌ Limited support for complex scripts (Devanagari, Thai, etc.)

### Our Solution

- ✅ **Perfect RTL/LTR** support out of the box
- ✅ **Smart responsive scaling** that just works
- ✅ **Butter-smooth animations** at 60fps
- ✅ **Powerful theming** with design tokens
- ✅ **50+ writing systems** supported automatically
- ✅ **Built-in i18n** with ICU message format
- ✅ **Lightning-fast translations** with LRU caching (95%+ hit rate)
- ✅ **Lazy loading** for smaller bundles
- ✅ **Performance monitoring** built-in
- ✅ **Error boundaries** for graceful fallbacks

---

## 📊 Performance That Matters

<!-- Moved benchmarks up for credibility -->

| Operation              | AppText | RN Text | Improvement           |
| ---------------------- | ------- | ------- | --------------------- |
| Render (Latin)         | 4.2ms   | 6.8ms   | **38% faster** 🚀     |
| Render (Arabic)        | 5.1ms   | 12.3ms  | **58% faster** 🚀     |
| Translation Lookup     | 0.8ms   | N/A     | **LRU cached** ⚡     |
| Memory Usage           | 2.8MB   | 4.1MB   | **32% less** 💾       |
| Bundle Size (minified) | 18.2KB  | N/A     | **Tree-shakeable** 🌳 |
| Cache Hit Rate         | 95%+    | N/A     | **Lightning fast** ⚡ |

---

## 🌍 Built-in Internationalization (i18n)

<!-- Consolidated i18n section for clarity -->

### Simple Translation Setup

```tsx
import { LocaleProvider, useLang } from "react-native-apptext";

const translations = {
  en: {
    welcome: "Welcome, {{name}}!",
    items: "{count, plural, one {# item} other {# items}}",
  },
  es: {
    welcome: "¡Bienvenido, {{name}}!",
    items: "{count, plural, one {# artículo} other {# artículos}}",
  },
  ar: {
    welcome: "مرحباً، {{name}}!",
    items: "{count, plural, zero {لا توجد عناصر} one {عنصر واحد} two {عنصران} few {# عناصر} many {# عنصراً} other {# عنصر}}",
  },
};

export default function App() {
  return (
    <LocaleProvider
      translations={translations}
      defaultLanguage="en"
      fallbackLanguage="en"
      useICU={true}
      onMissingTranslation={(lang, key) => {
        console.warn(`Missing translation: ${key} in ${lang}`);
      }}
    >
      <AppTextProvider>
        <MyApp />
      </AppTextProvider>
    </LocaleProvider>
  );
}

function MyApp() {
  const { t, tn, changeLanguage, language } = useLang();

  return (
    <>
      {/* Simple translation */}
      <AppText.HeadlineSmall>{t("welcome", { name: "Alice" })}</AppText.HeadlineSmall>

      {/* Automatic pluralization */}
      <AppText>{t("items", { count: 5 })}</AppText>

      {/* Language switcher */}
      <Button title="English" onPress={() => changeLanguage("en")} />
      <Button title="Español" onPress={() => changeLanguage("es")} />
      <Button title="العربية" onPress={() => changeLanguage("ar")} />
    </>
  );
}
```

### Advanced i18n Features

#### 💰 ICU Message Format - Currency & Numbers

```tsx
const translations = {
  en: {
    price: "Total: {amount, number, currency}",
    percent: "Progress: {value, number, percent}",
  },
};

// Auto-detects currency based on locale
t("price", { amount: 99.99 });
// en-US: "Total: $99.99"
// en-GB: "Total: £99.99" 
// ar-SA: "الإجمالي: ٩٩٫٩٩ ر.س"

t("percent", { value: 0.856 }); // "Progress: 85.6%"
```

#### 📅 Date Formatting

```tsx
const translations = {
  en: {
    lastSeen: "Last seen: {date, date, short}",
    appointment: "Appointment: {date, date, long}",
  },
};

const today = new Date();
t("lastSeen", { date: today }); // "Last seen: 11/27/2024"
t("appointment", { date: today }); // "Appointment: November 27, 2024"
```

#### 🔢 Complex Pluralization (50+ Languages)

```tsx
// Automatically handles all plural forms for each language
const translations = {
  en: {
    items: "{count, plural, one {# item} other {# items}}",
    messages: "{count, plural, =0 {No messages} =1 {One message} other {# messages}}",
  },
  ar: {
    items: "{count, plural, zero {لا توجد عناصر} one {عنصر واحد} two {عنصران} few {# عناصر} many {# عنصراً} other {# عنصر}}",
  },
};

// English
t("items", { count: 0 }); // "0 items"
t("items", { count: 1 }); // "1 item"
t("messages", { count: 0 }); // "No messages"

// Arabic (supports zero, one, two, few, many, other)
t("items", { count: 0 }); // "لا توجد عناصر"
t("items", { count: 1 }); // "عنصر واحد"
t("items", { count: 2 }); // "عنصران"
```

#### 🎯 Conditional Text (Select)

```tsx
const translations = {
  en: {
    greeting: "{gender, select, male {He is online} female {She is online} other {They are online}}",
    permission: "{role, select, admin {Full access} user {Limited access} guest {View only} other {No access}}",
  },
};

t("greeting", { gender: "male" }); // "He is online"
t("greeting", { gender: "female" }); // "She is online"
t("permission", { role: "admin" }); // "Full access"
```

#### 📊 Ordinal Numbers

```tsx
const translations = {
  en: {
    position: "You finished {place, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}",
  },
};

t("position", { place: 1 }); // "You finished 1st"
t("position", { place: 2 }); // "You finished 2nd"
t("position", { place: 3 }); // "You finished 3rd"
t("position", { place: 21 }); // "You finished 21st"
```

#### 🔗 Combined Plural + Select

```tsx
const translations = {
  en: {
    invitation: "{gender, select, male {He sent {count, plural, one {# invitation} other {# invitations}}} female {She sent {count, plural, one {# invitation} other {# invitations}}} other {They sent {count, plural, one {# invitation} other {# invitations}}}}",
  },
};

t("invitation", { gender: "male", count: 1 }); // "He sent 1 invitation"
t("invitation", { gender: "female", count: 5 }); // "She sent 5 invitations"
```

---

## ⚡ Performance Optimization Features

<!-- Grouped all performance features together -->

### 🚀 LRU Cache System

Achieves 95%+ cache hit rates for instant translation lookups:

```tsx
import { translationCache, performanceMonitor } from "react-native-apptext";

// Check cache statistics
const stats = translationCache.getStats();
console.log(`Cache hit rate: ${stats.hitRate.toFixed(2)}%`);
console.log(`Cache size: ${stats.size}/${stats.maxSize}`);

// Monitor performance in development
if (__DEV__) {
  const perfStats = performanceMonitor.getStats("translate:welcome");
  console.log(`Average lookup: ${perfStats.mean.toFixed(2)}ms`);
  console.log(`95th percentile: ${perfStats.p95.toFixed(2)}ms`);
}
```

### 📦 Lazy Loading Translations

Reduce initial bundle size by loading translations on demand:

```tsx
import { LazyLocaleProvider } from "react-native-apptext";

const App = () => (
  <LazyLocaleProvider
    loaders={{
      en: () => import("./locales/en.json"),
      es: () => import("./locales/es.json"),
      ar: () => import("./locales/ar.json"),
      fr: () => import("./locales/fr.json"),
    }}
    defaultLanguage="en"
    preloadLanguages={["en"]} // Preload commonly used languages
    onLoadStart={(locale) => console.log(`Loading ${locale}...`)}
    onLoadComplete={(locale) => console.log(`${locale} loaded!`)}
    onLoadError={(locale, error) => console.error(`Failed:`, error)}
  >
    <YourApp />
  </LazyLocaleProvider>
);
```

### 🎯 Namespace-based Code Splitting

Organize translations by feature for better code splitting:

```tsx
import { useNamespace } from "react-native-apptext";

function DashboardScreen() {
  // Lazy load dashboard translations
  useNamespace("dashboard", () => import("./translations/dashboard"));

  const { t } = useLang();

  return (
    <View>
      <AppText>{t("title", {}, { namespace: "dashboard" })}</AppText>
      <AppText>{t("stats.users", {}, { namespace: "dashboard" })}</AppText>
    </View>
  );
}

// Translation files structure:
// - translations/
//   - common.json       (loaded upfront)
//   - dashboard.json    (lazy loaded)
//   - auth.json         (lazy loaded)
//   - settings.json     (lazy loaded)
```

### 🛡️ Error Boundaries & Memory Management

Production-ready error handling and automatic cleanup:

```tsx
import { TranslationErrorBoundary, MemoryManager } from "react-native-apptext";

function App() {
  return (
    <TranslationErrorBoundary
      fallback={<AppText>Translation system unavailable</AppText>}
      onError={(error, errorInfo) => {
        analytics.logError("TranslationError", { error, errorInfo });
      }}
    >
      <LocaleProvider translations={translations}>
        <YourApp />
      </LocaleProvider>
    </TranslationErrorBoundary>
  );
}

// Automatic memory management
useEffect(() => {
  const timer = setTimeout(() => {}, 1000);
  MemoryManager.registerTimer(timer); // Auto-cleaned up
  
  return () => MemoryManager.clearAll();
}, []);
```

---

## 🎨 Beautiful Typography

<!-- Simplified typography section -->

### Material Design 3 Support

```tsx
// Display variants (largest)
<AppText.DisplayLarge>Display Large</AppText.DisplayLarge>
<AppText.DisplayMedium>Display Medium</AppText.DisplayMedium>
<AppText.DisplaySmall>Display Small</AppText.DisplaySmall>

// Headline variants
<AppText.HeadlineLarge>Headline Large</AppText.HeadlineLarge>
<AppText.HeadlineMedium>Headline Medium</AppText.HeadlineMedium>
<AppText.HeadlineSmall>Headline Small</AppText.HeadlineSmall>

// Title variants
<AppText.TitleLarge>Title Large</AppText.TitleLarge>
<AppText.TitleMedium>Title Medium</AppText.TitleMedium>
<AppText.TitleSmall>Title Small</AppText.TitleSmall>

// Body variants (most common)
<AppText.BodyLarge>Body Large</AppText.BodyLarge>
<AppText.BodyMedium>Body Medium - Default</AppText.BodyMedium>
<AppText.BodySmall>Body Small</AppText.BodySmall>

// Label variants (smallest)
<AppText.LabelLarge>Label Large</AppText.LabelLarge>
<AppText.LabelMedium>Label Medium</AppText.LabelMedium>
<AppText.LabelSmall>Label Small</AppText.LabelSmall>

// Flexible base component
<AppText 
  variant="bodyMedium" 
  color="primary" 
  size={16} 
  weight="semibold"
  truncate={2}
>
  Customizable text
</AppText>
```

### 🌐 Automatic Script Detection

Supports 50+ writing systems with automatic optimization:

```tsx
<View>
  {/* Latin - Auto-detected, LTR, standard line height */}
  <AppText>Hello World!</AppText>

  {/* Arabic - Auto-detected, RTL, increased line height */}
  <AppText>مرحباً بكم في تطبيقنا</AppText>

  {/* Devanagari - Complex shaping, optimized line height */}
  <AppText>हमारे ऐप में आपका स्वागत है</AppText>

  {/* Japanese - Optimized for mixed scripts */}
  <AppText>こんにちは、私たちのアプリへようこそ。</AppText>

  {/* Mixed content - Smart per-character handling */}
  <AppText>Hello 你好 مرحبا 🌍</AppText>
</View>
```

**Supported scripts:** Latin, Arabic, Cyrillic, Devanagari, Bengali, Tamil, Telugu, Thai, Chinese, Japanese, Korean, Hebrew, Greek, and 35+ more!

---

## 🎭 Advanced Components

### Rich Text with Trans Component

Use custom components within translations:

```tsx
import { Trans } from "react-native-apptext";

const translations = {
  en: {
    rich_welcome: "Hello <bold>{{name}}</bold>! Welcome to our <link>amazing app</link>",
    terms: "By continuing, you agree to our <terms>Terms of Service</terms> and <privacy>Privacy Policy</privacy>",
  },
};

function MyComponent() {
  const richComponents = {
    bold: <AppText weight="bold" color="primary" />,
    link: <AppText color="info" style={{ textDecorationLine: "underline" }} />,
    terms: <AppText weight="bold" color="error" />,
    privacy: <AppText weight="bold" color="info" />,
  };

  return (
    <View>
      <Trans
        i18nKey="rich_welcome"
        values={{ name: "Sarah" }}
        components={richComponents}
        variant="bodyMedium"
      />
      
      <Trans
        i18nKey="terms"
        components={richComponents}
        variant="bodySmall"
        color="textSecondary"
      />
    </View>
  );
}
```

### Markdown Support (Coming Soon)

```tsx
import { MarkdownTrans } from "react-native-apptext";

const translations = {
  en: {
    welcome: "Welcome **{{name}}**! Check out [our website](https://example.com) for `code` examples.",
  },
};

<MarkdownTrans
  i18nKey="welcome"
  values={{ name: "Alice" }}
  markdownStyles={{
    bold: { color: "red", fontWeight: "700" },
    link: { color: "blue", textDecorationLine: "underline" },
    code: { backgroundColor: "#f0f0f0", fontFamily: "monospace" },
  }}
  onLinkPress={(url) => Linking.openURL(url)}
/>
```

### Type-Safe Translations

```typescript
// translations.ts
export const translations = {
  en: {
    auth: {
      login: "Log In",
      signup: "Sign Up",
    },
    home: {
      welcome: "Welcome back, {{name}}!",
    },
  },
} as const;

type TranslationKeys = DeepKeyOf<typeof translations.en>;
// "auth.login" | "auth.signup" | "home.welcome"

// Use with TypeScript autocomplete
const { t } = useLang<typeof translations.en>();
t("auth.login"); // ✅ Type-safe
t("auth.logout"); // ❌ TypeScript error
```

---

## 📚 API Reference

### Core Components

```tsx
// Base component with all options
<AppText 
  variant="bodyMedium"
  color="primary"
  size={16}
  weight="semibold"
  align="center"
  truncate={2}
  style={{ marginTop: 10 }}
>
  Text content
</AppText>

// Material Design 3 variants (16 total)
<AppText.DisplayLarge />
<AppText.DisplayMedium />
<AppText.DisplaySmall />
<AppText.HeadlineLarge />
<AppText.HeadlineMedium />
<AppText.HeadlineSmall />
<AppText.TitleLarge />
<AppText.TitleMedium />
<AppText.TitleSmall />
<AppText.BodyLarge />
<AppText.BodyMedium />
<AppText.BodySmall />
<AppText.LabelLarge />
<AppText.LabelMedium />
<AppText.LabelSmall />
```

### i18n Hooks & Providers

```tsx
// LocaleProvider
<LocaleProvider
  translations={translations}
  defaultLanguage="en"
  fallbackLanguage="en"
  useICU={true}
  onMissingTranslation={(lang, key) => {
    console.warn(`Missing: ${lang}.${key}`);
  }}
>
  {children}
</LocaleProvider>

// useLang hook
const {
  t,              // Translate: t(key, params?, options?)
  tn,             // Plural: tn(key, count, params?, options?) [DEPRECATED - use t() with count]
  changeLanguage, // Switch language: changeLanguage("es")
  language,       // Current language code
  direction,      // "ltr" or "rtl"
  loadNamespace,  // Load namespace dynamically
} = useLang();

// Translation options
{
  namespace?: string;
  context?: string;
  count?: number;
}
```

### Trans Component

```tsx
<Trans
  i18nKey="translation.key"
  values={{ name: "value" }}
  components={{
    bold: <AppText weight="bold" />,
    link: <AppText color="primary" />,
  }}
  variant="bodyMedium"
  color="textPrimary"
  style={{ marginTop: 10 }}
/>
```

### Performance Utilities

```tsx
import { 
  translationCache, 
  performanceMonitor, 
  MemoryManager 
} from "react-native-apptext";

// Cache management
translationCache.getStats();
translationCache.clear();

// Performance monitoring
performanceMonitor.getStats(name);
performanceMonitor.getAllStats();
performanceMonitor.clear(name?);

// Memory management
MemoryManager.registerTimer(timer);
MemoryManager.clearTimer(timer);
MemoryManager.getStats();
MemoryManager.clearAll();
```

### Number Formatting

```tsx
import { NumberFormatter } from "react-native-apptext";

NumberFormatter.format(1234.56, "en-US");
NumberFormatter.formatCurrency(99.99, "en-US", "USD");
NumberFormatter.formatPercent(0.856, "en-US");
NumberFormatter.formatCompact(1500000, "en-US"); // "1.5M"
NumberFormatter.formatSigned(-42, "en-US"); // "-42"
NumberFormatter.formatRange(10, 20, "en-US"); // "10 – 20"
```

### Ordinal Formatting

```tsx
import { OrdinalFormatter } from "react-native-apptext";

OrdinalFormatter.format(1, "en"); // "1st"
OrdinalFormatter.format(2, "en"); // "2nd"
OrdinalFormatter.format(3, "en"); // "3rd"
OrdinalFormatter.format(21, "en"); // "21st"
OrdinalFormatter.format(100, "en"); // "100th"
```

---

## 🎯 Real-World Examples

### E-commerce Product Card

```tsx
import { LazyLocaleProvider, useLang } from "react-native-apptext";

const App = () => (
  <LazyLocaleProvider
    loaders={{
      en: () => import("./locales/en.json"),
      es: () => import("./locales/es.json"),
      ar: () => import("./locales/ar.json"),
    }}
    defaultLanguage="en"
    preloadLanguages={["en"]}
  >
    <AppTextProvider>
      <ShoppingApp />
    </AppTextProvider>
  </LazyLocaleProvider>
);

function ProductCard({ product }) {
  const { t } = useLang();

  return (
    <View style={styles.card}>
      <AppText.TitleMedium>{product.name}</AppText.TitleMedium>
      
      <AppText.BodySmall color="secondary" truncate={3}>
        {product.description}
      </AppText.BodySmall>
      
      <AppText.TitleSmall color="primary">
        {t("price", { amount: product.price })}
      </AppText.TitleSmall>
      
      <AppText.LabelSmall>
        {t("reviews", { count: product.reviewCount })}
      </AppText.LabelSmall>
    </View>
  );
}
```

### Dashboard with Performance Monitoring

```tsx
function DashboardScreen() {
  useNamespace("dashboard", () => import("./translations/dashboard"));

  const { t } = useLang();
  const stats = translationCache.getStats();

  return (
    <View>
      <AppText.HeadlineSmall>
        {t("title", {}, { namespace: "dashboard" })}
      </AppText.HeadlineSmall>

      {__DEV__ && (
        <AppText.LabelSmall color="textSecondary">
          Cache hit rate: {stats.hitRate.toFixed(1)}% | 
          Size: {stats.size}/{stats.maxSize}
        </AppText.LabelSmall>
      )}

      <AppText.BodyMedium>
        {t("stats.users", { count: 1250 }, { namespace: "dashboard" })}
      </AppText.BodyMedium>
    </View>
  );
}
```

### News App with Error Boundaries

```tsx
function NewsApp() {
  const { language, changeLanguage } = useLang();

  useEffect(() => {
    if (__DEV__) {
      const stats = performanceMonitor.getAllStats();
      console.table(stats);
    }
  }, [language]);

  return (
    <TranslationErrorBoundary
      fallback={<AppText.BodyMedium>Error loading translations</AppText.BodyMedium>}
      onError={(error) => analytics.logError("i18n", error)}
    >
      <View>
        <LanguageSwitcher />
        <NewsFeed />
      </View>
    </TranslationErrorBoundary>
  );
}
```

---

## 🐛 Troubleshooting

### Cache not working?

```tsx
import { translationCache } from 'react-native-apptext';
translationCache.clear(); // Force clear cache
```

### Memory leaks?

```tsx
import { MemoryManager } from 'react-native-apptext';

useEffect(() => {
  const timer = setTimeout(/*...*/);
  MemoryManager.registerTimer(timer);
  
  return () => MemoryManager.clearAll();
}, []);
```

### Translations not lazy loading?

```tsx
// ✅ Correct - use dynamic import()
loaders: {
  en: () => import('./locales/en.json'),
}

// ❌ Wrong - don't use require()
loaders: {
  en: () => require('./locales/en.json'),
}
```

### Web platform optimization?

```typescript
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      'react-native-apptext': 'react-native-apptext'
    }
  }
};
```

---

## 🛠️ Requirements

### Peer Dependencies

```json
{
  "react": ">=17.0.0",
  "react-native": ">=0.70.0"
}
```

**Platform Support:** iOS, Android, Web  
**No additional native setup required!**

---

## 🤝 Contributing

We welcome contributions! 

```bash
# Clone and setup
git clone https://github.com/Ganesh1110/react-native-apptext.git
cd react-native-apptext
npm install

# Run tests
npm test
npm run test:coverage

# Build
npm run build
```

See [CONTRIBUTING.md](https://github.com/Ganesh1110/react-native-apptext/blob/main/CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT © [Ganesh1110](https://github.com/Ganesh1110)

---

<div align="center">

**Built with ❤️ for the React Native community**

_Making beautiful, performant text accessible to every developer, in every language_

[📖 Full Documentation](https://github.com/Ganesh1110/react-native-apptext/wiki) •
[🐛 Report Bug](https://github.com/Ganesh1110/react-native-apptext/issues) •
[💡 Request Feature](https://github.com/Ganesh1110/react-native-apptext/issues)

</div>
