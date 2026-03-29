"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMarkdownTranslation = useMarkdownTranslation;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const LangCore_1 = require("./LangCore");
const AppText_1 = __importDefault(require("./AppText"));
/**
 * Parse markdown-like syntax into nodes
 */
const MARKDOWN_PATTERNS = {
    bold: /\*\*(.+?)\*\*/g,
    italic: /\*(.+?)\*/g,
    underline: /__(.+?)__/g,
    strikethrough: /~~(.+?)~~/g,
    code: /`(.+?)`/g,
    link: /\[(.+?)\]\((.+?)\)/g,
    component: /\{\{(\w+):(.+?)\}\}/g,
};
function parseMarkdown(text, enabledFeatures) {
    const nodes = [];
    let currentIndex = 0;
    // Regex patterns for different markdown elements
    const patterns = [
        {
            type: "bold",
            regex: MARKDOWN_PATTERNS.bold,
            enabled: enabledFeatures.bold,
        },
        {
            type: "italic",
            regex: MARKDOWN_PATTERNS.italic,
            enabled: enabledFeatures.italic,
        },
        {
            type: "underline",
            regex: MARKDOWN_PATTERNS.underline,
            enabled: enabledFeatures.underline,
        },
        {
            type: "strikethrough",
            regex: MARKDOWN_PATTERNS.strikethrough,
            enabled: enabledFeatures.strikethrough,
        },
        {
            type: "code",
            regex: MARKDOWN_PATTERNS.code,
            enabled: enabledFeatures.code,
        },
        {
            type: "link",
            regex: MARKDOWN_PATTERNS.link,
            enabled: enabledFeatures.links,
        },
        {
            type: "component",
            regex: MARKDOWN_PATTERNS.component,
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
const MarkdownTrans = (0, react_1.memo)(({ i18nKey, values, options, components, markdownStyles = {}, onLinkPress, enabledFeatures = {
    bold: true,
    italic: true,
    underline: true,
    strikethrough: true,
    code: true,
    links: true,
    components: true,
}, ...textProps }) => {
    const { t, tn } = (0, LangCore_1.useLang)();
    // Get translated text
    const translatedText = (0, react_1.useMemo)(() => {
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
    const parsedNodes = (0, react_1.useMemo)(() => {
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
    const renderNodes = (0, react_1.useMemo)(() => {
        return parsedNodes.map((node, index) => {
            const key = `node-${index}`;
            switch (node.type) {
                case "text":
                    return node.content;
                case "bold":
                    return (<react_native_1.Text key={key} style={[defaultStyles.bold, markdownStyles.bold]}>
                {node.content}
              </react_native_1.Text>);
                case "italic":
                    return (<react_native_1.Text key={key} style={[defaultStyles.italic, markdownStyles.italic]}>
                {node.content}
              </react_native_1.Text>);
                case "underline":
                    return (<react_native_1.Text key={key} style={[defaultStyles.underline, markdownStyles.underline]}>
                {node.content}
              </react_native_1.Text>);
                case "strikethrough":
                    return (<react_native_1.Text key={key} style={[
                            defaultStyles.strikethrough,
                            markdownStyles.strikethrough,
                        ]}>
                {node.content}
              </react_native_1.Text>);
                case "code":
                    return (<react_native_1.Text key={key} style={[defaultStyles.code, markdownStyles.code]}>
                {node.content}
              </react_native_1.Text>);
                case "link":
                    return (<react_native_1.Text key={key} style={[defaultStyles.link, markdownStyles.link]} onPress={() => onLinkPress === null || onLinkPress === void 0 ? void 0 : onLinkPress(node.url)}>
                {node.content}
              </react_native_1.Text>);
                case "component":
                    const Component = components === null || components === void 0 ? void 0 : components[node.componentName];
                    if (Component && react_1.default.isValidElement(Component)) {
                        return react_1.default.cloneElement(Component, {
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
    return <AppText_1.default {...textProps}>{renderNodes}</AppText_1.default>;
});
MarkdownTrans.displayName = "MarkdownTrans";
/**
 * Hook for parsing markdown in translations
 */
function useMarkdownTranslation(key, values, options) {
    const { t, tn } = (0, LangCore_1.useLang)();
    return (0, react_1.useMemo)(() => {
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
exports.default = MarkdownTrans;
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
