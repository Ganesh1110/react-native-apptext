import React, { memo, useMemo } from "react";
import { useLang } from "./LangCore";
import AppText from "./AppText";
function tokenize(input) {
    const tokens = [];
    // Match <tagName>, </tagName>, <tagName />, or <tagName attr="val">
    const re = /<(\/)?\s*(\w+)(?:\s+[^>]+)?\s*(\/)?>/g;
    let last = 0;
    let match;
    while ((match = re.exec(input)) !== null) {
        if (match.index > last) {
            tokens.push({ type: "text", value: input.slice(last, match.index) });
        }
        const isClosing = !!match[1];
        const tagName = match[2];
        const isSelfClosing = !!match[3];
        if (isClosing) {
            tokens.push({ type: "close", tag: tagName });
        }
        else if (isSelfClosing) {
            tokens.push({ type: "selfClosing", tag: tagName });
        }
        else {
            tokens.push({ type: "open", tag: tagName });
        }
        last = re.lastIndex;
    }
    if (last < input.length) {
        tokens.push({ type: "text", value: input.slice(last) });
    }
    return tokens;
}
function buildTree(tokens) {
    const root = { children: [] };
    const stack = [root];
    for (const token of tokens) {
        const current = stack[stack.length - 1];
        if (token.type === "text") {
            current.children.push(token.value);
        }
        else if (token.type === "open") {
            const node = { tag: token.tag, children: [] };
            current.children.push(node);
            stack.push(node);
        }
        else if (token.type === "selfClosing") {
            const node = { tag: token.tag, children: [] };
            current.children.push(node);
        }
        else {
            // close tag — pop the stack (even if tags are mismatched, best-effort)
            if (stack.length > 1) {
                stack.pop();
            }
        }
    }
    return root;
}
function renderTree(node, components, keyPrefix) {
    if (typeof node === "string")
        return node;
    const renderedChildren = node.children.map((child, i) => renderTree(child, components, `${keyPrefix}-${i}`));
    if (!node.tag) {
        // Root node — return children as a fragment
        return <>{renderedChildren}</>;
    }
    const Component = components[node.tag];
    if (Component && React.isValidElement(Component)) {
        return React.cloneElement(Component, { key: keyPrefix }, renderedChildren);
    }
    // Component not provided for this tag — fall back to plain text
    console.warn(`Trans: component "${node.tag}" not found, using plain text`);
    return <React.Fragment key={keyPrefix}>{renderedChildren}</React.Fragment>;
}
function parseRichText(text, components) {
    const tokens = tokenize(text);
    const tree = buildTree(tokens);
    return renderTree(tree, components, "trans");
}
// ---------------------------------------------------------------------------
// Trans Component
// ---------------------------------------------------------------------------
/**
 * Trans component for seamless translation integration with AppText.
 * Supports rich text translation with nested components and ICU message format.
 */
const TransComponent = memo(({ i18nKey, values, options, components, fallback, ...textProps }) => {
    const { t, tn } = useLang();
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
            return fallback || i18nKey;
        }
    }, [i18nKey, values, options, t, tn, fallback]);
    // Handle rich text with components (supports nesting)
    const content = useMemo(() => {
        if (!components || Object.keys(components).length === 0) {
            return translatedText;
        }
        return parseRichText(translatedText, components);
    }, [translatedText, components]);
    return <AppText {...textProps}>{content}</AppText>;
});
TransComponent.displayName = "Trans";
export default TransComponent;
