# react-native-text-kit

**The all-in-one Text component for React Native.** Typography, i18n, RTL, animations, and accessibility — drop-in replacement for `<Text>`, zero native linking.

[![npm](https://img.shields.io/npm/v/react-native-text-kit?style=flat-square&logo=npm&color=red)](https://www.npmjs.com/package/react-native-text-kit)
[![downloads](https://img.shields.io/npm/dm/react-native-text-kit?style=flat-square&color=4caf50)](https://www.npmjs.com/package/react-native-text-kit)
[![size](https://img.shields.io/badge/size-22KB%20(min)-6a5acd?style=flat-square)](https://bundlephobia.com/package/react-native-text-kit)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## Install

```bash
npm install react-native-text-kit
# or
yarn add react-native-text-kit
```

> ✅ No `pod install`. No `react-native link`. 100% JavaScript/TypeScript.

---

## Quick Start

```tsx
import AppText, { AppTextProvider, LocaleProvider } from 'react-native-text-kit';

const translations = {
  en: { greeting: 'Hello, {{name}}!' },
  ar: { greeting: 'مرحباً، {{name}}!' },
};

export default function App() {
  return (
    <LocaleProvider translations={translations} defaultLanguage="en">
      <AppTextProvider>
        <AppText.HeadlineMedium>Title</AppText.HeadlineMedium>
        <AppText variant="bodyLarge" color="primary">Body text</AppText>
      </AppTextProvider>
    </LocaleProvider>
  );
}
```

---

## Features

| Feature | Details |
|---|---|
| **Typography** | 26 Material Design 3 variants (`DisplayLarge` → `LabelSmall`) |
| **i18n** | ICU MessageFormat, 40+ CLDR plural rules, namespaces, fallback chains |
| **RTL** | Auto script detection for 50+ scripts (Arabic, Hebrew, Devanagari…) |
| **Animations** | 30+ types — `fadeIn`, `bounce`, `typewriter`, `wave`, `neon`, `pulse`… |
| **Responsive** | `responsive` prop with LRU-cached font scaling |
| **Accessibility** | `accessibilityRole`, live regions, `useSpeech()`, Dynamic Type |
| **Performance** | Single Dimensions listener, LRU translation cache (~0.8ms lookups) |
| **CLI** | `npx react-native-text-kit extract` and `validate` for translation keys |

---

## Typography

### Material Design 3 Variants

```tsx
<AppText.DisplayLarge>Hero</AppText.DisplayLarge>       {/* 57px */}
<AppText.HeadlineMedium>Section</AppText.HeadlineMedium> {/* 28px */}
<AppText.BodyLarge>Paragraph</AppText.BodyLarge>         {/* 16px */}
<AppText.LabelSmall>Caption</AppText.LabelSmall>         {/* 11px */}

{/* Also supported: H1–H6, Body, Code, Caption (legacy) */}
```

### Common Props

```tsx
<AppText
  variant="titleMedium"   // MD3 variant or legacy
  color="primary"         // theme color key or hex
  weight="700"
  italic
  align="center"
  size={18}               // override font size
  responsive              // scale with device width
  shadow
  m={16}                  // CSS-like shorthand margin
  px={12}                 // paddingHorizontal
>
  Styled text
</AppText>
```

---

## Internationalization

```tsx
import { LocaleProvider, useLang } from 'react-native-text-kit';

const translations = {
  en: {
    items: '{count, plural, one {# item} other {# items}}',
    greeting: 'Hello, {{name}}!',
  },
  ar: {
    items: '{count, plural, zero {لا عناصر} one {# عنصر} other {# عناصر}}',
    greeting: 'مرحباً، {{name}}!',
  },
};

function Screen() {
  const { t, tn, changeLanguage, direction } = useLang();

  return (
    <>
      <AppText>{t('greeting', { name: 'Ganesh' })}</AppText>
      <AppText>{tn('items', 3)}</AppText>  {/* "3 items" */}
      <Button title="Switch to Arabic" onPress={() => changeLanguage('ar')} />
    </>
  );
}
```

**i18n features:** `{{variable}}` interpolation · ICU plural/select/selectOrdinal · nested keys (`user.profile.name`) · namespace code-splitting · fallback language chain

### Lazy Loading (Code Splitting)

```tsx
import { LazyLocaleProvider } from 'react-native-text-kit';

<LazyLocaleProvider
  loaders={{
    en: () => import('./locales/en.json'),
    ar: () => import('./locales/ar.json'),
  }}
  defaultLanguage="en"
  preloadLanguages={['ar']}
>
  <App />
</LazyLocaleProvider>
```

---

## RTL

```tsx
import { RTLProvider, useRTL, useRTLFlexDirection } from 'react-native-text-kit';

// Auto-mirrors layout for RTL languages
<RTLProvider language={currentLanguage} autoApply>
  <NavigationContainer>
    <App />
  </NavigationContainer>
</RTLProvider>

// In any component
const { isRTL } = useRTL();
const flexDir = useRTLFlexDirection('row'); // 'row' | 'row-reverse'
```

Arabic/Hebrew text direction is also auto-detected on a per-string basis — no manual `writingDirection` needed.

---

## Animations

```tsx
// Entrance
<AppText animated animation={{ type: 'fadeIn', duration: 600 }}>Fade</AppText>
<AppText animated animation={{ type: 'slideInRight' }}>Slide</AppText>
<AppText animated animation={{ type: 'bounceIn' }}>Bounce</AppText>
<AppText animated animation={{ type: 'zoomIn' }}>Zoom</AppText>

// Attention (looped)
<AppText animated animation={{ type: 'pulse' }}>Pulse</AppText>
<AppText animated animation={{ type: 'shake' }}>Shake</AppText>
<AppText animated animation={{ type: 'wave' }}>Wave</AppText>

// Special
<AppText animated animation={{ type: 'typewriter', speed: 50 }} cursor>
  Types itself out!
</AppText>
<AppText animated animation={{ type: 'neon', duration: 2000 }}>Neon</AppText>

// Exit
<AppText animated animation={{ type: 'fadeOut' }}>Fade Out</AppText>
```

All animations use `useNativeDriver: true` where possible.  
Full list: `fadeIn/Out`, `slideIn/Out` (4 directions), `bounceIn`, `zoomIn/Out`, `flipInX`, `rotateIn`, `pulse`, `shake`, `swing`, `wobble`, `rubberBand`, `tada`, `blink`, `glow`, `neon`, `gradientShift`, `typewriter`, `wave`.

---

## Rich Text

### `<Trans />` — JSX component mapping

```tsx
<Trans
  i18nKey="terms"
  components={{
    tos: <AppText color="primary" onPress={() => navigate('Terms')} />,
    privacy: <AppText color="primary" onPress={() => navigate('Privacy')} />,
  }}
/>
// translations: { terms: "I agree to the <tos>Terms</tos> and <privacy>Privacy</privacy>." }
```

### `<MarkdownTrans />` — Inline markdown

```tsx
<MarkdownTrans
  i18nKey="rich_content"
  markdownStyles={{ bold: { fontWeight: '700' }, link: { color: '#007AFF' } }}
  onLinkPress={(url) => Linking.openURL(url)}
/>
// Supports: **bold**, *italic*, __underline__, ~~strikethrough~~, `code`, [link](url)
```

---

## Truncation

```tsx
<AppText
  numberOfLines={2}
  expandText="Read more"
  collapseText="Show less"
  onExpand={() => analytics.track('expanded')}
>
  Long paragraph text that truncates after two lines...
</AppText>
```

---

## Number & Ordinal Formatting

```tsx
import { NumberFormatter, OrdinalFormatter } from 'react-native-text-kit';

NumberFormatter.formatCurrency(1234.56, 'en-US', 'USD'); // "$1,234.56"
NumberFormatter.formatCurrency(1234.56, 'de-DE', 'EUR'); // "1.234,56 €"
NumberFormatter.formatCompact(1500000, 'en-US');          // "1.5M"
NumberFormatter.formatPercent(0.856, 'en-US');            // "85.6%"
OrdinalFormatter.format(3, 'en');                         // "3rd"
```

---

## Loading States

```tsx
import { AppTextSkeleton, withLazyTranslations } from 'react-native-text-kit';

<AppTextSkeleton variant="headlineMedium" width={260} />
<AppTextSkeleton variant="bodyMedium" lines={3} lastLineWidth="45%" />
```

---

## Plugin System

```tsx
import { registerAppTextPlugin } from 'react-native-text-kit';

registerAppTextPlugin({
  name: 'emoji-expander',
  transformString: (str) => str.replace(':smile:', '😊'),
});
```

---

## Remote Translations (SWR)

```tsx
import { RemoteLocaleProvider } from 'react-native-text-kit';

<RemoteLocaleProvider
  url="https://cdn.example.com/locales/{{lang}}.json"
  defaultLanguage="en"
  strategy="stale-while-revalidate"
>
  <App />
</RemoteLocaleProvider>
```

---

## CLI

```bash
# Extract all t() / tn() / <Trans> keys from your codebase
npx react-native-text-kit extract --src ./src --output ./locales/template.json

# Validate that all keys in source are covered by your locale files
npx react-native-text-kit validate --src ./src --translations ./locales --strict

# Output as CSV or YAML
npx react-native-text-kit extract --format csv --output keys.csv
```

---

## Dev Tools

```tsx
import { AppTextDevTools } from 'react-native-text-kit';

// Renders ONLY in __DEV__ — shows LRU cache hit rate, p95 latency, locale info
<AppTextDevTools position="bottom-right" refreshInterval={2000} />
```

---

## Reanimated (Optional)

```tsx
// Zero-cost import — only include if you have react-native-reanimated installed
import { ReanimatedAppText } from 'react-native-text-kit/reanimated';

<ReanimatedAppText entering={FadeIn} exiting={FadeOut}>
  UI-thread animations
</ReanimatedAppText>
```

---

## Hooks Reference

| Hook | Returns | Use For |
|---|---|---|
| `useLang()` | `{ t, tn, changeLanguage, language, direction }` | Translations + locale |
| `useRTL()` | `{ isRTL, restartRequired }` | RTL state |
| `useRTLFlexDirection(dir)` | `'row'` \| `'row-reverse'` | Layout mirroring |
| `useAutoLocale({ supportedLocales, fallback })` | `string` | Device locale detection |
| `useDeviceLocale()` | `string` (e.g. `'en-GB'`) | Raw device locale |
| `useUpdateAppTheme()` | `(partial: Theme) => void` | Runtime theme patching |
| `useTextMetrics(text, style)` | `{ width, height, lines }` | Pre-render text measurement |
| `useNamespace(ns, loader)` | `void` | Load a translation namespace |
| `useTranslationReady(langs)` | `{ ready, progress }` | Translation load progress |
| `useSpeech()` | `{ speak, stop }` | Text-to-speech |

---

## Type-Safe Translation Keys

```ts
import type { DeepKeyOf } from 'react-native-text-kit';
import translations from './locales/en.json';

type Keys = DeepKeyOf<typeof translations>;
// TypeScript catches typos at compile time ✅
```

---

## Migration from `react-native-apptext`

```bash
npm uninstall react-native-apptext
npm install react-native-text-kit
```

```diff
- import AppText from 'react-native-apptext';
+ import AppText from 'react-native-text-kit';
```

All component APIs are **100% backward compatible** — no code changes beyond the import.

---

## Peer Dependencies

```json
{
  "react": ">=16.8.0",
  "react-native": ">=0.60.0"
}
```

`react-native-reanimated` is optional (only needed for `react-native-text-kit/reanimated`).

---

## Contributing

```bash
git clone https://github.com/Ganesh1110/react-native-text-kit.git
cd react-native-text-kit
npm install
npm test       # Jest
npm run build  # TypeScript
npm run lint   # ESLint
```

---

## License

MIT © [Ganesh Jayaprakash](https://github.com/Ganesh1110)
