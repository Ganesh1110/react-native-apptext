import React, { memo, useMemo } from "react";
import { Text } from "react-native";
import { useLang } from "./LangCore";
import AppText from "./AppText";
const INLINE_PATTERNS = [
    { kind: "bold", open: "**", close: "**" },
    { kind: "italic", open: "*", close: "*" },
    { kind: "underline", open: "__", close: "__" },
    { kind: "strikethrough", open: "~~", close: "~~" },
    { kind: "code", open: "`", close: "`", literal: true },
];
/**
 * Parse a raw text string into a nested MarkdownToken tree.
 * Handles nesting by recursing into matched inner content.
 * Depth guard (max 8) prevents infinite loops on malformed input.
 */
function parseInline(input, features, depth = 0) {
    if (!input || depth > 8) {
        return input ? [{ kind: "text", text: input }] : [];
    }
    // Handle [link text](url) — check before delimiter patterns
    if (features.links !== false) {
        const m = /\[([^\]]+)\]\(([^)]+)\)/.exec(input);
        if (m) {
            const before = input.slice(0, m.index);
            const after = input.slice(m.index + m[0].length);
            return [
                ...parseInline(before, features, depth + 1),
                { kind: "link", text: m[1], url: m[2] },
                ...parseInline(after, features, depth + 1),
            ];
        }
    }
    // Handle {{componentName:content}}
    if (features.components !== false) {
        const m = /\{\{(\w+):([^}]+)\}\}/.exec(input);
        if (m) {
            const before = input.slice(0, m.index);
            const after = input.slice(m.index + m[0].length);
            return [
                ...parseInline(before, features, depth + 1),
                { kind: "component", name: m[1], text: m[2] },
                ...parseInline(after, features, depth + 1),
            ];
        }
    }
    // Find earliest matching inline delimiter
    let earliestIdx = Infinity;
    let chosen = null;
    for (const pat of INLINE_PATTERNS) {
        const fk = pat.kind;
        if (features[fk] === false)
            continue;
        const idx = input.indexOf(pat.open);
        if (idx !== -1 && idx < earliestIdx) {
            const closeIdx = input.indexOf(pat.close, idx + pat.open.length);
            if (closeIdx !== -1) {
                earliestIdx = idx;
                chosen = pat;
            }
        }
    }
    if (!chosen) {
        return [{ kind: "text", text: input }];
    }
    const openIdx = earliestIdx;
    const closeIdx = input.indexOf(chosen.close, openIdx + chosen.open.length);
    const inner = input.slice(openIdx + chosen.open.length, closeIdx);
    const before = input.slice(0, openIdx);
    const after = input.slice(closeIdx + chosen.close.length);
    const tokens = [];
    if (before)
        tokens.push(...parseInline(before, features, depth + 1));
    if (chosen.kind === "code") {
        tokens.push({ kind: "code", text: inner });
    }
    else {
        const innerTokens = chosen.literal
            ? [{ kind: "text", text: inner }]
            : parseInline(inner, features, depth + 1);
        tokens.push({ kind: chosen.kind, children: innerTokens });
    }
    if (after)
        tokens.push(...parseInline(after, features, depth + 1));
    return tokens;
}
// ---------------------------------------------------------------------------
// Token renderer (supports recursion for nested formatting)
// ---------------------------------------------------------------------------
function renderToken(token, index, defaultStyles, markdownStyles, onLinkPress, components, keyPrefix = "md") {
    const key = `${keyPrefix}-${index}`;
    const kids = (children) => children.map((c, i) => renderToken(c, i, defaultStyles, markdownStyles, onLinkPress, components, key));
    switch (token.kind) {
        case "text":
            return token.text;
        case "bold":
            return (<Text key={key} style={[defaultStyles.bold, markdownStyles.bold]}>
          {kids(token.children)}
        </Text>);
        case "italic":
            return (<Text key={key} style={[defaultStyles.italic, markdownStyles.italic]}>
          {kids(token.children)}
        </Text>);
        case "underline":
            return (<Text key={key} style={[defaultStyles.underline, markdownStyles.underline]}>
          {kids(token.children)}
        </Text>);
        case "strikethrough":
            return (<Text key={key} style={[defaultStyles.strikethrough, markdownStyles.strikethrough]}>
          {kids(token.children)}
        </Text>);
        case "code":
            return (<Text key={key} style={[defaultStyles.code, markdownStyles.code]}>
          {token.text}
        </Text>);
        case "link":
            return (<Text key={key} style={[defaultStyles.link, markdownStyles.link]} onPress={() => onLinkPress === null || onLinkPress === void 0 ? void 0 : onLinkPress(token.url)}>
          {token.text}
        </Text>);
        case "component": {
            const Comp = components === null || components === void 0 ? void 0 : components[token.name];
            if (Comp && React.isValidElement(Comp)) {
                return React.cloneElement(Comp, { key, children: token.text });
            }
            return token.text;
        }
        default:
            return null;
    }
}
// ---------------------------------------------------------------------------
// Default markdown styles
// ---------------------------------------------------------------------------
const DEFAULT_MARKDOWN_STYLES = {
    bold: { fontWeight: "bold" },
    italic: { fontStyle: "italic" },
    underline: { textDecorationLine: "underline" },
    strikethrough: { textDecorationLine: "line-through" },
    code: {
        fontFamily: "monospace",
        backgroundColor: "#f0f0f0",
        paddingHorizontal: 4,
        borderRadius: 3,
    },
    link: {
        color: "#007AFF",
        textDecorationLine: "underline",
    },
};
const DEFAULT_ENABLED_FEATURES = {
    bold: true, italic: true, underline: true,
    strikethrough: true, code: true, links: true, components: true,
};
// ---------------------------------------------------------------------------
// MarkdownTrans component
// ---------------------------------------------------------------------------
/**
 * MarkdownTrans — renders translated text with markdown-like inline formatting.
 *
 * Supports nested formatting (e.g. **_bold italic_**) via a recursive descent
 * parser. All markdown features are individually toggleable via `enabledFeatures`.
 *
 * @example
 * <MarkdownTrans
 *   i18nKey="welcome"
 *   markdownStyles={{ bold: { color: 'red' } }}
 *   onLinkPress={(url) => Linking.openURL(url)}
 * />
 *
 * // Translation: "Hello **world**! See [docs](https://example.com)"
 */
const MarkdownTrans = memo(({ i18nKey, values, options, components, markdownStyles = {}, onLinkPress, enabledFeatures = DEFAULT_ENABLED_FEATURES, ...textProps }) => {
    const { t, tn } = useLang();
    const translatedText = useMemo(() => {
        try {
            if ((options === null || options === void 0 ? void 0 : options.count) !== undefined) {
                return tn(i18nKey, options.count, values, { namespace: options.namespace });
            }
            return t(i18nKey, values, {
                namespace: options === null || options === void 0 ? void 0 : options.namespace,
                context: options === null || options === void 0 ? void 0 : options.context,
            });
        }
        catch (err) {
            console.warn(`[MarkdownTrans] Translation failed for key: ${i18nKey}`, err);
            return i18nKey;
        }
    }, [i18nKey, values, options, t, tn]);
    const parsedTokens = useMemo(() => parseInline(translatedText, enabledFeatures), [translatedText, enabledFeatures]);
    const renderedNodes = useMemo(() => parsedTokens.map((token, i) => renderToken(token, i, DEFAULT_MARKDOWN_STYLES, markdownStyles, onLinkPress, components)), [parsedTokens, markdownStyles, onLinkPress, components]);
    return <AppText {...textProps}>{renderedNodes}</AppText>;
});
MarkdownTrans.displayName = "MarkdownTrans";
// ---------------------------------------------------------------------------
// useMarkdownTranslation hook
// ---------------------------------------------------------------------------
/**
 * Returns a parsed MarkdownToken[] array for a translation key.
 * Useful for building custom rendering pipelines without the MarkdownTrans component.
 *
 * @example
 * const tokens = useMarkdownTranslation('key', { name: 'World' });
 * // tokens: [{ kind: 'text', text: 'Hello ' }, { kind: 'bold', children: [...] }]
 */
export function useMarkdownTranslation(key, values, options) {
    const { t, tn } = useLang();
    return useMemo(() => {
        try {
            const text = (options === null || options === void 0 ? void 0 : options.count) !== undefined
                ? tn(key, options.count, values, { namespace: options.namespace })
                : t(key, values, { namespace: options === null || options === void 0 ? void 0 : options.namespace, context: options === null || options === void 0 ? void 0 : options.context });
            return parseInline(text, DEFAULT_ENABLED_FEATURES);
        }
        catch (err) {
            console.warn(`[useMarkdownTranslation] Failed for key: ${key}`, err);
            return [{ kind: "text", text: key }];
        }
    }, [key, values, options, t, tn]);
}
export default MarkdownTrans;
