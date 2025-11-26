import React, { memo, useMemo } from "react";
import { Text } from "react-native";
import { useLang } from "./LangCore";
import AppText from "./AppText";
/**
 * Parse markdown-like syntax into nodes
 */
function parseMarkdown(text, enabledFeatures) {
    const nodes = [];
    let currentIndex = 0;
    // Regex patterns for different markdown elements
    const patterns = [
        {
            type: "bold",
            regex: /\*\*(.+?)\*\*/g,
            enabled: enabledFeatures.bold,
        },
        {
            type: "italic",
            regex: /\*(.+?)\*/g,
            enabled: enabledFeatures.italic,
        },
        {
            type: "underline",
            regex: /__(.+?)__/g,
            enabled: enabledFeatures.underline,
        },
        {
            type: "strikethrough",
            regex: /~~(.+?)~~/g,
            enabled: enabledFeatures.strikethrough,
        },
        { type: "code", regex: /`(.+?)`/g, enabled: enabledFeatures.code },
        {
            type: "link",
            regex: /\[(.+?)\]\((.+?)\)/g,
            enabled: enabledFeatures.links,
        },
        {
            type: "component",
            regex: /\{\{(\w+):(.+?)\}\}/g,
            enabled: enabledFeatures.components,
        },
    ];
    // Find all matches
    const matches = [];
    for (const { type, regex, enabled } of patterns) {
        if (!enabled)
            continue;
        let match;
        const regexCopy = new RegExp(regex.source, regex.flags);
        while ((match = regexCopy.exec(text)) !== null) {
            if (type === "link") {
                matches.push({
                    type,
                    start: match.index,
                    end: regexCopy.lastIndex,
                    content: match[1],
                    url: match[2],
                });
            }
            else if (type === "component") {
                matches.push({
                    type,
                    start: match.index,
                    end: regexCopy.lastIndex,
                    content: match[2],
                    componentName: match[1],
                });
            }
            else {
                matches.push({
                    type,
                    start: match.index,
                    end: regexCopy.lastIndex,
                    content: match[1],
                });
            }
        }
    }
    // Sort matches by start position
    matches.sort((a, b) => a.start - b.start);
    // Build nodes
    for (const match of matches) {
        // Add plain text before match
        if (match.start > currentIndex) {
            const plainText = text.slice(currentIndex, match.start);
            if (plainText) {
                nodes.push({ type: "text", content: plainText });
            }
        }
        // Add formatted node
        nodes.push({
            type: match.type,
            content: match.content,
            url: match.url,
            componentName: match.componentName,
        });
        currentIndex = match.end;
    }
    // Add remaining text
    if (currentIndex < text.length) {
        const remainingText = text.slice(currentIndex);
        if (remainingText) {
            nodes.push({ type: "text", content: remainingText });
        }
    }
    return nodes.length > 0 ? nodes : [{ type: "text", content: text }];
}
/**
 * MarkdownTrans component with markdown-like syntax support
 */
const MarkdownTrans = memo(({ i18nKey, values, options, components, markdownStyles = {}, onLinkPress, enabledFeatures = {
    bold: true,
    italic: true,
    underline: true,
    strikethrough: true,
    code: true,
    links: true,
    components: true,
}, ...textProps }) => {
    const { t, tn } = useLang();
    // Get translated text
    const translatedText = useMemo(() => {
        try {
            if ((options === null || options === void 0 ? void 0 : options.count) !== undefined) {
                return tn(i18nKey, options.count, values, {
                    namespace: options.namespace,
                });
            }
            return t(i18nKey, values, {
                namespace: options === null || options === void 0 ? void 0 : options.namespace,
                context: options === null || options === void 0 ? void 0 : options.context,
            });
        }
        catch (error) {
            console.warn(`Translation failed for key: ${i18nKey}`, error);
            return i18nKey;
        }
    }, [i18nKey, values, options, t, tn]);
    // Parse markdown
    const parsedNodes = useMemo(() => {
        return parseMarkdown(translatedText, enabledFeatures);
    }, [translatedText, enabledFeatures]);
    // Default markdown styles
    const defaultStyles = {
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
    // Render nodes
    const renderNodes = useMemo(() => {
        return parsedNodes.map((node, index) => {
            const key = `node-${index}`;
            switch (node.type) {
                case "text":
                    return node.content;
                case "bold":
                    return (<Text key={key} style={[defaultStyles.bold, markdownStyles.bold]}>
                {node.content}
              </Text>);
                case "italic":
                    return (<Text key={key} style={[defaultStyles.italic, markdownStyles.italic]}>
                {node.content}
              </Text>);
                case "underline":
                    return (<Text key={key} style={[defaultStyles.underline, markdownStyles.underline]}>
                {node.content}
              </Text>);
                case "strikethrough":
                    return (<Text key={key} style={[
                            defaultStyles.strikethrough,
                            markdownStyles.strikethrough,
                        ]}>
                {node.content}
              </Text>);
                case "code":
                    return (<Text key={key} style={[defaultStyles.code, markdownStyles.code]}>
                {node.content}
              </Text>);
                case "link":
                    return (<Text key={key} style={[defaultStyles.link, markdownStyles.link]} onPress={() => onLinkPress === null || onLinkPress === void 0 ? void 0 : onLinkPress(node.url)}>
                {node.content}
              </Text>);
                case "component":
                    const Component = components === null || components === void 0 ? void 0 : components[node.componentName];
                    if (Component && React.isValidElement(Component)) {
                        return React.cloneElement(Component, {
                            key,
                            children: node.content,
                        });
                    }
                    return node.content;
                default:
                    return node.content;
            }
        });
    }, [parsedNodes, markdownStyles, onLinkPress, components]);
    return <AppText {...textProps}>{renderNodes}</AppText>;
});
MarkdownTrans.displayName = "MarkdownTrans";
/**
 * Hook for parsing markdown in translations
 */
export function useMarkdownTranslation(key, values, options) {
    const { t, tn } = useLang();
    return useMemo(() => {
        try {
            const text = (options === null || options === void 0 ? void 0 : options.count) !== undefined
                ? tn(key, options.count, values, { namespace: options.namespace })
                : t(key, values, {
                    namespace: options === null || options === void 0 ? void 0 : options.namespace,
                    context: options === null || options === void 0 ? void 0 : options.context,
                });
            return parseMarkdown(text, {
                bold: true,
                italic: true,
                underline: true,
                strikethrough: true,
                code: true,
                links: true,
                components: true,
            });
        }
        catch (error) {
            console.warn(`Translation failed for key: ${key}`, error);
            return [{ type: "text", content: key }];
        }
    }, [key, values, options, t, tn]);
}
export default MarkdownTrans;
// Example usage:
/*
<MarkdownTrans
  i18nKey="welcome.message"
  values={{ name: "John" }}
  markdownStyles={{
    bold: { color: "red" },
    link: { color: "blue" },
  }}
  onLinkPress={(url) => Linking.openURL(url)}
/>

// In translations:
{
  "welcome.message": "Hello **{{name}}**! Check out [our website](https://example.com)"
}
*/
