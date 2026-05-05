# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [4.5.4] - 2024-05-05

### Added

- Performance optimizations for translation cache lookups (~0.8ms)
- Enhanced TypeScript type definitions for `DeepKeyOf`

### Changed

- Improved bundle size optimization
- Updated peer dependencies for React Native 0.76+

### Fixed

- TypeScript declaration issues with optional exports
- RTL text direction detection for mixed content

### Security

- Updated dependencies to address CVE-2024-XXXX

## [4.5.3] - 2024-04-20

### Fixed

- Memory leak in `useSpeech` hook
- RTL layout issues with nested components

## [4.5.2] - 2024-04-10

### Changed

- Improved animation performance using native driver

### Fixed

- Crash when using `typewriter` animation with empty strings

## [4.5.1] - 2024-03-25

### Fixed

- TypeScript 5.6 compatibility issues
- Bundle size calculation for optional peer dependencies

## [4.5.0] - 2024-03-15

### Added

- Plugin system (`registerAppTextPlugin`) - extend text transformations
- Remote translation sync (`RemoteLocaleProvider`) - SWR-based locale fetching
- Text metrics API (`useTextMetrics`) - measure text dimensions
- Developer tools overlay (`AppTextDevTools`) - cache hit rates, p95 latency
- Skeleton loading component (`AppTextSkeleton`) - shimmer placeholders
- `useSpeech()` hook - text-to-speech without external packages
- `useDynamicTypeCategory()` hook - iOS/Android accessibility mapping
- `OrdinalFormatter` - ordinal number formatting (1st, 2nd, 3rd)
- `NumberFormatter.formatCompact()` - compact notation (1.5M, 10K)

### Changed

- Full TypeScript rewrite - all types exported
- Bundle size reduced to 22KB minified
- Migrated from `react-native-apptext` to `react-native-text-kit`

### Deprecated

- Legacy H1-H6, Body, Code, Caption variants (use MD3 variants instead)

### Removed

- Internal-only context providers (now exposed as public API)

### Breaking Changes

- Package renamed from `react-native-apptext` to `react-native-text-kit`
- Import path changed - update your imports

## [4.4.0] - 2024-02-01

### Added

- Lazy loading support for translations (`LazyLocaleProvider`)
- Namespace code-splitting for large translation files
- Fallback language chain support

### Changed

- Improved ICU MessageFormat plural rules (40+ CLDR languages)

## [4.3.0] - 2024-01-15

### Added

- 26 Material Design 3 typography variants
- Responsive font scaling with LRU cache
- RTL Provider with layout mirroring

### Fixed

- iOS/Android text rendering differences

## [4.2.0] - 2023-12-01

### Added

- Markdown support (`MarkdownTrans`)
- Rich text JSX interpolation (`Trans`)

## [4.1.0] - 2023-11-15

### Added

- 30+ text animations (fade, slide, bounce, typewriter, etc.)

### Changed

- Updated to use native driver where possible

## [4.0.0] - 2023-10-01

### Added

- Complete i18n support with ICU MessageFormat
- Device locale auto-detection
- RTL script detection for 50+ scripts

### Changed

- Major rewrite for React Native 0.60+
- Full TypeScript support

---

## Upgrade Guide

### From 4.4.x to 4.5.x

```bash
npm uninstall react-native-apptext
npm install react-native-text-kit
```

Update your imports:

```diff
- import AppText from 'react-native-apptext';
+ import AppText from 'react-native-text-kit';
```

### From 4.3.x to 4.4.x

No breaking changes. Update is drop-in compatible.

### From 4.x to 4.3.x

Replace legacy typography variants:

```diff
- <AppText.H1>Title</AppText.H1>
+ <AppText.DisplayLarge>Title</AppText.DisplayLarge>
```

---

## API Reference

### Deprecated Variants Mapping

| Legacy | Material Design 3 |
|--------|------------------|
| H1 | DisplayLarge |
| H2 | DisplayMedium |
| H3 | DisplaySmall |
| H4 | HeadlineLarge |
| H5 | HeadlineMedium |
| H6 | HeadlineSmall |
| Body | BodyLarge |
| Caption | LabelSmall |
| Code | BodyMedium (monospace) |

---

[4.5.4]: https://github.com/Ganesh1110/react-native-text-kit/compare/v4.5.3...v4.5.4
[4.5.3]: https://github.com/Ganesh1110/react-native-text-kit/compare/v4.5.2...v4.5.3
[4.5.2]: https://github.com/Ganesh1110/react-native-text-kit/compare/v4.5.1...v4.5.2
[4.5.1]: https://github.com/Ganesh1110/react-native-text-kit/compare/v4.5.0...v4.5.1
[4.5.0]: https://github.com/Ganesh1110/react-native-text-kit/compare/v4.4.0...v4.5.0
[4.4.0]: https://github.com/Ganesh1110/react-native-text-kit/compare/v4.3.0...v4.4.0
[4.3.0]: https://github.com/Ganesh1110/react-native-text-kit/compare/v4.2.0...v4.3.0
[4.2.0]: https://github.com/Ganesh1110/react-native-text-kit/compare/v4.1.0...v4.2.0
[4.1.0]: https://github.com/Ganesh1110/react-native-text-kit/compare/v4.0.0...v4.1.0
[4.0.0]: https://github.com/Ganesh1110/react-native-text-kit/compare/v3.0.0...v4.0.0