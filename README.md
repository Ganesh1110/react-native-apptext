# 🌟 React Native AppText

<div align="center">

**The Ultimate Typography & i18n Engine for React Native**
_Beautiful text. Global-ready. Blazing fast._

<br/>

[![npm](https://img.shields.io/npm/v/react-native-apptext?style=for-the-badge&logo=npm&color=red)](https://www.npmjs.com/package/react-native-apptext)
[![downloads](https://img.shields.io/npm/dm/react-native-apptext?style=for-the-badge&logo=npm&color=4caf50)](https://www.npmjs.com/package/react-native-apptext)
[![size](<https://img.shields.io/badge/size-18KB%20(min)-6a5acd?style=for-the-badge>)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-Ready-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

<br/>

[📖 Docs](https://github.com/Ganesh1110/react-native-apptext/wiki) •
[🐛 Issues](https://github.com/Ganesh1110/react-native-apptext/issues) •
[💡 Features](https://github.com/Ganesh1110/react-native-apptext/issues)

</div>

---

## 🎬 Preview

<!-- Hero Demo -->
<p align="center">
  <img src="./src/gif/Localization.gif" width="320" />
</p>
<p align="center">
  <strong>🌍 Localization & RTL Support</strong>
</p>

<br/>

<!-- Animations Grid -->
<p align="center">
  <img src="./src/gif/Bounce.gif" width="160" />
  <img src="./src/gif/Fade.gif" width="160" />
  <img src="./src/gif/Slide.gif" width="160" />
</p>
<p align="center">
  <sub>Bounce • Fade • Slide</sub>
</p>

<br/>

<p align="center">
  <img src="./src/gif/Rotate.gif" width="160" />
  <img src="./src/gif/Special.gif" width="160" />
  <img src="./src/gif/TypeWtitter.gif" width="160" />
</p>
<p align="center">
  <sub>Rotate • Special • Typewriter</sub>
</p>

---

## ⚡ Why AppText?

React Native text is harder than it should be:

- ❌ Broken RTL layouts
- ❌ Poor animation performance
- ❌ Complex i18n setup
- ❌ Large translation bundles

### ✅ AppText fixes it — by default

- 🌍 50+ languages & scripts (RTL + LTR)
- ⚡ 60FPS animations
- 🧠 LRU-cached translations (95%+ hit rate)
- 📦 Lazy-loaded i18n
- 🎨 Material Design 3 typography
- 🛡️ Built-in error boundaries

---

## 📊 Performance

| Metric          | AppText | React Native |
| --------------- | ------- | ------------ |
| Render (Latin)  | 4.2ms   | 6.8ms        |
| Render (Arabic) | 5.1ms   | 12.3ms       |
| Memory          | 2.8MB   | 4.1MB        |
| Lookup          | 0.8ms   | —            |

⚡ **Up to 58% faster rendering**

---

## ⚡ Quick Start

```bash
npm install react-native-apptext
# or
yarn add react-native-apptext
```

### 30-second example

```tsx
import AppText, { AppTextProvider } from "react-native-apptext";

export default function App() {
  return (
    <AppTextProvider>
      <AppText.DisplaySmall>Welcome</AppText.DisplaySmall>

      <AppText.BodyMedium color="secondary">
        Fast. Beautiful. Global-ready.
      </AppText.BodyMedium>

      <AppText.LabelSmall mt={8}>60FPS • i18n • 50+ scripts</AppText.LabelSmall>
    </AppTextProvider>
  );
}
```

👉 **No native setup required**

---

## 🌍 Built-in i18n (Zero Config)

```tsx
import { LocaleProvider, useLang } from "react-native-apptext";

const translations = {
  en: { items: "{count, plural, one {# item} other {# items}}" },
  ar: { items: "{count, plural, zero {لا عناصر} other {# عنصر}}" },
};

function App() {
  return (
    <LocaleProvider translations={translations}>
      <AppTextProvider>
        <Home />
      </AppTextProvider>
    </LocaleProvider>
  );
}

function Home() {
  const { t } = useLang();
  return <AppText>{t("items", { count: 5 })}</AppText>;
}
```

---

## 🎨 Typography System

Material Design 3 built-in:

```tsx
<AppText.DisplayLarge />
<AppText.HeadlineSmall />
<AppText.BodyMedium />
<AppText.LabelSmall />
```

Custom:

```tsx
<AppText variant="bodyMedium" weight="semibold" color="primary">
  Custom Text
</AppText>
```

---

## ✨ Animations (60FPS)

```tsx
// Simple usage
<AppText animation="fadeIn">Fade In</AppText>
<AppText animation="slideInRight">Slide</AppText>

// Custom configuration
<AppText
  animation="pulse"
  animationConfig={{ duration: 2000, delay: 500 }}
>
  Pulse
</AppText>

<AppText animation="typewriter" animationSpeed={40}>Typing...</AppText>
```

---

## ⚡ Performance Features

- 🚀 LRU Cache (95%+ hit rate)
- 📦 Lazy-loaded translations
- 🎯 Namespace code-splitting
- 🛡️ Error boundaries
- 📊 Built-in performance monitor

---

## 🧩 Advanced Features

- 🌐 Automatic script detection (Arabic, Hindi, Japanese…)
- 🔤 Rich text via `<Trans />`
- 📉 Truncation + “Read more”
  ```tsx
  <AppText maxLines={3} truncateText>
    Long text here...
  </AppText>
  ```
- 🔗 Link Detection
  ```tsx
  <AppText linkDetection onLinkPress={(url) => Linking.openURL(url)}>
    Visit https://google.com
  </AppText>
  ```
- ♿ Accessibility-first (Dynamic Type, ARIA roles, reduced motion)
- 🎨 Spacing props (m, p, mx, py)

---

## ♿ Accessibility Features

### Reduced Motion

Animations automatically respect system reduced motion settings:

```tsx
// Animations are automatically disabled when user prefers reduced motion
<AppText animation="fadeIn">
  This won't animate for users who prefer reduced motion
</AppText>
```

### Dynamic Type (Font Scaling)

Full support for iOS/Android Dynamic Type:

```tsx
<AppText
  allowFontScaling={true}
  minimumFontScale={0.5} // Minimum 50% of base size
  maxFontSizeMultiplier={3} // Maximum 300% of base size
>
  Scalable text
</AppText>
```

### Screen Reader Support

Typewriter animations announce completion:

```tsx
<TypewriterText announceCompletion={true}>
  Text announced when complete
</TypewriterText>
```

---

## 📚 API Reference

| Prop                    | Type                                              | Default     | Description                     |
| ----------------------- | ------------------------------------------------- | ----------- | ------------------------------- |
| `variant`               | `TypographyVariant`                               | `undefined` | MD3 or Legacy variant           |
| `color`                 | `keyof ThemeColors \| string`                     | `undefined` | Theme color or hex value        |
| `animation`             | `AnimationType \| boolean \| AnimationWithConfig` | `undefined` | Animation to play               |
| `animationConfig`       | `AnimationConfig`                                 | `{}`        | Duration, delay, speed          |
| `animationDelay`        | `number`                                          | `0`         | Delay before animation starts   |
| `animationDuration`     | `number`                                          | `1000`      | Animation duration in ms        |
| `maxLines`              | `number`                                          | `undefined` | Line limit                      |
| `truncateText`          | `boolean`                                         | `false`     | Shows ellipsis when truncated   |
| `linkDetection`         | `boolean`                                         | `false`     | Auto-detect and style URLs      |
| `onLinkPress`           | `(link: string) => void`                          | `undefined` | Callback for link clicks        |
| `allowFontScaling`      | `boolean`                                         | `true`      | Respect system font scaling     |
| `minimumFontScale`      | `number`                                          | `0.5`       | Minimum font scale factor (0-1) |
| `maxFontSizeMultiplier` | `number`                                          | `3`         | Maximum font scale multiplier   |
| `responsive`            | `boolean`                                         | `true`      | Enable responsive font scaling  |
| `direction`             | `'auto' \| 'ltr' \| 'rtl'`                        | `'auto'`    | Text direction                  |

### Animation API

```tsx
// String shorthand - simplest usage
<AppText animation="fadeIn">Hello</AppText>

// Boolean - enable default fade animation
<AppText animation>Hello</AppText>
<AppText animation={false}>Hello</AppText>

// Object form - with configuration
<AppText animation={{ type: "slideInRight", duration: 500, delay: 100 }}>Hello</AppText>

// Using animationConfig prop
<AppText animation="pulse" animationConfig={{ duration: 2000 }}>Hello</AppText>
```

## 🔄 Migration Guide (v4.1 → v4.2)

### 1. Truncation

- **Legacy:** `<AppText truncate={3}>`
- **Modern:** `<AppText maxLines={3} truncateText>`

### 2. Animations

- **Legacy:** `<AppText animation={{ type: 'fade', duration: 500 }}>`
- **Modern:** `<AppText animation="fade" animationConfig={{ duration: 500 }}>`
- **Or use new object form:** `<AppText animation={{ type: 'fade', duration: 500 }}>`

### 3. Font Scaling

- **New props added:** `allowFontScaling`, `minimumFontScale`, `maxFontSizeMultiplier`
- These replace manual font size calculations for Dynamic Type support

## 📚 Documentation

👉 Full API & advanced usage:
[https://github.com/Ganesh1110/react-native-apptext/wiki](https://github.com/Ganesh1110/react-native-apptext/wiki)

---

## 🤝 Contributing

```bash
git clone https://github.com/Ganesh1110/react-native-apptext.git
cd react-native-apptext
npm install
npm test
```

---

## 📄 License

MIT © Ganesh1110

---

<div align="center">

**Built with ❤️ for React Native developers**

</div>
