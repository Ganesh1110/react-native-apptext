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
const react_1 = __importStar(require("react"));
const LangCore_1 = require("./LangCore");
const AppText_1 = __importDefault(require("./AppText"));
function tokenize(input) {
    const tokens = [];
    // Match <tagName>, </tagName>, or plain text between them
    const re = /<(\/)?\s*(\w+)\s*>/g;
    let last = 0;
    let match;
    while ((match = re.exec(input)) !== null) {
        if (match.index > last) {
            tokens.push({ type: "text", value: input.slice(last, match.index) });
        }
        if (match[1]) {
            tokens.push({ type: "close", tag: match[2] });
        }
        else {
            tokens.push({ type: "open", tag: match[2] });
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
    if (Component && react_1.default.isValidElement(Component)) {
        return react_1.default.cloneElement(Component, { key: keyPrefix }, ...renderedChildren);
    }
    // Component not provided for this tag — fall back to plain text
    console.warn(`Trans: component "${node.tag}" not found, using plain text`);
    return <react_1.default.Fragment key={keyPrefix}>{renderedChildren}</react_1.default.Fragment>;
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
const TransComponent = (0, react_1.memo)(({ i18nKey, values, options, components, fallback, ...textProps }) => {
    const { t, tn } = (0, LangCore_1.useLang)();
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
            return fallback || i18nKey;
        }
    }, [i18nKey, values, options, t, tn, fallback]);
    // Handle rich text with components (supports nesting)
    const content = (0, react_1.useMemo)(() => {
        if (!components || Object.keys(components).length === 0) {
            return translatedText;
        }
        return parseRichText(translatedText, components);
    }, [translatedText, components]);
    return <AppText_1.default {...textProps}>{content}</AppText_1.default>;
});
TransComponent.displayName = "Trans";
exports.default = TransComponent;
