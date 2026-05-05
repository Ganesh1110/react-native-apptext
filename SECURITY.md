# Security Policy

This document outlines the security policy for **react-native-text-kit**.

## Supported Versions

We actively support and provide security updates for the following versions:

| Version | Supported | Notes |
|---------|-----------|-------|
| 4.5.x | ✅ Yes | Current stable |
| 4.4.x | ⚠️ Yes | Security fixes only |
| 4.3.x | ❌ No | End-of-life |
| < 4.3.x | ❌ No | End-of-life |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **Do NOT** create a public GitHub issue for security vulnerabilities
2. Email: ganeshjayaprakash3@gmail.com with subject: `[SECURITY] react-native-text-kit`
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Fix Timeline**: Based on severity
  - Critical: 24-72 hours
  - High: 7 days
  - Medium: 30 days
  - Low: Next release

## Security Best Practices

### When Using react-native-text-kit

1. **Validate Translations**: Never trust user-provided translation keys without validation:
   ```tsx
   // Use strict key checking
   const { t } = useLang({ strict: true });
   ```

2. **Remote Translations**: If using `RemoteLocaleProvider`:
   ```tsx
   <RemoteLocaleProvider
     url="https://trusted-cdn.example.com/locales/{{lang}}.json"
     defaultLanguage="en"
     validateKeys={true} // Enable key validation
   >
   ```

3. **Content Security**: For markdown/trans content:
   ```tsx
   <MarkdownTrans
     i18nKey="content"
     allowedTags={['b', 'i', 'strong']} // Whitelist allowed tags
     onLinkPress={(url) => validateUrl(url)} // Validate URLs
   />
   ```

4. **Plugin System**: Only use trusted plugins:
   ```tsx
   registerAppTextPlugin({
     name: "trusted-plugin",
     transformString: (str) => sanitize(str),
   });
   ```

## Security Considerations

### Bundle Size & Dependencies

- We maintain minimal dependencies
- No network requests by default (except when using `RemoteLocaleProvider`)
- No sensitive data storage

### TypeScript Safety

- All exports are fully typed
- No use of `any` in public APIs
- Translation keys are type-safe

### Privacy

- No analytics or telemetry built-in (only developer tools in DEV mode)
- User translations stay on-device
- No external API calls without explicit configuration

## Security Updates

### Vulnerability Disclosure Process

1. Private report to maintainers
2. Assessment and fix development
3. Coordinated disclosure with patch

### Security Advisories

We publish security advisories on:

- [GitHub Security Advisories](https://github.com/Ganesh1110/react-native-text-kit/security/advisories)
- npm security alerts

## Acknowledgments

We thank the community for responsibly disclosing vulnerabilities. Contributors will be acknowledged (with permission).

---

**For general issues, use [GitHub Issues](https://github.com/Ganesh1110/react-native-text-kit/issues)**