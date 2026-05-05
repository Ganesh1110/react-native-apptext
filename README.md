# react-native-text-kit

**The all-in-one Text component for React Native.** Typography, i18n, RTL, animations, and accessibility — drop-in replacement for `<Text>`, zero native linking.

[![npm](https://img.shields.io/npm/v/react-native-text-kit?style=flat-square)](https://www.npmjs.com/package/react-native-text-kit)
[![downloads](https://img.shields.io/npm/dm/react-native-text-kit?style=flat-square)](https://www.npmjs.com/package/react-native-text-kit)
[![license](https://img.shields.io/npm/l/react-native-text-kit?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

---

## 🚀 Install & Use in 60 Seconds

```bash
npm install react-native-text-kit
```

```tsx
import AppText from "react-native-text-kit";

<AppText.HeadlineMedium color="primary">Hello World</AppText.HeadlineMedium>;
```

> ✅ Zero configuration. Zero native linking. Just works.

---

## 🎯 Why react-native-text-kit?

| Feature        | react-i18next | react-native-localize | **react-native-text-kit** |
| -------------- | ------------- | --------------------- | ------------------------- |
| Bundle Size    | 400KB         | 150KB                 | **22KB** ✅               |
| Typography     | ❌            | ❌                    | **26 MD3 variants** ✅    |
| Animations     | ❌            | ❌                    | **30+ built-in** ✅       |
| RTL Support    | Manual        | Basic                 | **Auto-detect** ✅        |
| Native Linking | ❌ No         | ⚠️ Required           | **Zero** ✅               |
| TypeScript     | ✅            | ⚠️ Partial            | **Full** ✅               |

---

## 🎬 See It In Action

### 📱 Try Live Interactive Demo

[![Open in Expo Snack](https://img.shields.io/badge/Open%20in-Expo%20Snack-4630EB?style=for-the-badge&logo=expo)](https://snack.expo.dev/@ganeshvp/react-native-text-kit)

**Try all features live in your browser** — Typography, Animations, i18n, RTL, and more!

---

## ✨ Features

| Feature           | Description                                                   |
| ----------------- | ------------------------------------------------------------- |
| **Typography**    | 26 Material Design 3 variants (`DisplayLarge` → `LabelSmall`) |
| **i18n**          | ICU MessageFormat, 40+ CLDR plural rules, namespaces          |
| **RTL**           | Auto script detection for 50+ scripts (Arabic, Hebrew...)     |
| **Animations**    | 30+ types — `fadeIn`, `bounce`, `typewriter`, `wave`, `pulse` |
| **Responsive**    | Font scaling with LRU cache                                   |
| **Accessibility** | Dynamic Type, `useSpeech()`, live regions                     |
| **Performance**   | ~0.8ms translation lookups, single listener                   |
| **CLI**           | Extract & validate translation keys                           |

---

## 📖 Quick Examples

### Basic Typography

```tsx
<AppText.DisplayLarge>Hero Title</AppText.DisplayLarge>
<AppText.BodyLarge>Paragraph text</AppText.BodyLarge>
<AppText.LabelSmall>Caption</AppText.LabelSmall>
```

### Styled Text

```tsx
<AppText variant="titleMedium" color="primary" weight="700" italic>
  Styled text
</AppText>
```

### Animations

```tsx
<AppText animated animation={{ type: 'fadeIn', duration: 600 }}>
  Fade In
</AppText>

<AppText animated animation={{ type: 'typewriter', speed: 50 }} cursor>
  Types itself out!
</AppText>
```

### Internationalization (i18n)

```tsx
import { LocaleProvider, useLang } from "react-native-text-kit";

const translations = {
  en: { greeting: "Hello, {{name}}!" },
  ar: { greeting: "مرحباً، {{name}}!" },
};

function App() {
  const { t, changeLanguage } = useLang();

  return (
    <LocaleProvider translations={translations} defaultLanguage="en">
      <AppText>{t("greeting", { name: "Ganesh" })}</AppText>
      <Button onPress={() => changeLanguage("ar")} />
    </LocaleProvider>
  );
}
```

**→ [See full examples in Snack](https://snack.expo.dev/@ganeshvp/react-native-text-kit)**

---

## 📚 Core API

### Providers

- `AppTextProvider` — Theme context
- `LocaleProvider` — i18n translations
- `RTLProvider` — Right-to-left layout
- `LazyLocaleProvider` — Code splitting
- `RemoteLocaleProvider` — Remote sync

### Key Hooks

- `useLang()` — `{ t, tn, changeLanguage, language }`
- `useRTL()` — `{ isRTL, restartRequired }`
- `useSpeech()` — `{ speak, stop }` (text-to-speech)
- `useTextMetrics()` — Pre-render measurements

### Components

- `AppText` — 26 Material Design 3 variants
- `Trans` — Rich JSX interpolation
- `MarkdownTrans` — Inline markdown
- `AppTextSkeleton` — Loading placeholder

**→ [Full API Reference](https://snack.expo.dev/@ganeshvp/react-native-text-kit)**

---

## 🔧 Advanced Features

```tsx
// Rich Text with JSX
<Trans i18nKey="terms" components={{
  link: <AppText color="primary" onPress={...} />
}} />

// Markdown Support
<MarkdownTrans i18nKey="content" />
// Supports: **bold**, *italic*, [links](url)

// Number Formatting
NumberFormatter.formatCurrency(1234.56, 'en-US', 'USD') // "$1,234.56"
OrdinalFormatter.format(3, 'en') // "3rd"

// CLI Tools
npx react-native-text-kit extract --src ./src
npx react-native-text-kit validate --translations ./locales

// Plugin System
registerAppTextPlugin({ name: 'emoji', transformString: ... })
```

**→ [Interactive examples in Snack](https://snack.expo.dev/@ganeshvp/react-native-text-kit)**

---

## ❓ FAQ

**Q: Does this work with Expo?**  
A: Yes! `npx expo install react-native-text-kit` — zero config needed.

**Q: TypeScript support?**  
A: Full TypeScript types included automatically.

**Q: Bundle size?**  
A: Only **22KB** (95% smaller than react-i18next).

**Q: Expo Snack compatible?**  
A: Yes! [Try it now →](https://snack.expo.dev/@ganeshvp/react-native-text-kit)

---

## 💬 Community

- 🐛 [Report Bug](https://github.com/Ganesh1110/react-native-text-kit/issues/new?template=bug_report.md)
- 💡 [Request Feature](https://github.com/Ganesh1110/react-native-text-kit/issues/new?template=feature_request.md)
- 📰 [Changelog](./CHANGELOG.md)
- 📖 [Full Documentation](https://github.com/Ganesh1110/react-native-text-kit#readme)

---

## ⭐ Show Your Support

If this saved you time, **star the repo** ⭐️

[![Star History Chart](https://api.star-history.com/svg?repos=Ganesh1110/react-native-text-kit&type=Date)](https://star-history.com/#Ganesh1110/react-native-text-kit&Date)

---

## 📄 License

MIT © [Ganesh Jayaprakash](https://github.com/Ganesh1110)

---
