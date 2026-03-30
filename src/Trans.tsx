import React, { memo, useMemo } from "react";
import { useLang } from "./LangCore";
import AppText, { AppTextProps } from "./AppText";

export interface TransProps extends Omit<AppTextProps, "children"> {
  /**
   * Translation key
   */
  i18nKey: string;

  /**
   * Translation parameters for interpolation
   */
  values?: Record<string, any>;

  /**
   * Translation options (namespace, context, count)
   */
  options?: {
    namespace?: string;
    context?: string;
    count?: number;
    defaultValue?: string;
  };

  /**
   * Custom components for rich text translation.
   * Keys map to a tag name used in the translated string.
   * Supports nested tags: <bold>Hello <link>World</link></bold>
   *
   * Example: { bold: <Text fontWeight="700" />, link: <Text color="blue" /> }
   */
  components?: Record<string, React.ReactElement>;

  /**
   * Fallback text when translation is missing
   */
  fallback?: string;
}

// ---------------------------------------------------------------------------
// Stack-based nested-tag parser
// ---------------------------------------------------------------------------
// Replaces the old single-level regex which could not handle:
//   <bold>Hello <link>World</link></bold>
// The parser tokenizes the string into text tokens and open/close tag tokens,
// then builds a tree which is rendered as nested React elements.
// ---------------------------------------------------------------------------

type Token =
  | { type: "text"; value: string }
  | { type: "open"; tag: string }
  | { type: "close"; tag: string };

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  // Match <tagName>, </tagName>, or plain text between them
  const re = /<(\/)?\s*(\w+)\s*>/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(input)) !== null) {
    if (match.index > last) {
      tokens.push({ type: "text", value: input.slice(last, match.index) });
    }
    if (match[1]) {
      tokens.push({ type: "close", tag: match[2] });
    } else {
      tokens.push({ type: "open", tag: match[2] });
    }
    last = re.lastIndex;
  }

  if (last < input.length) {
    tokens.push({ type: "text", value: input.slice(last) });
  }

  return tokens;
}

interface TreeNode {
  tag?: string; // undefined for root
  children: Array<TreeNode | string>;
}

function buildTree(tokens: Token[]): TreeNode {
  const root: TreeNode = { children: [] };
  const stack: TreeNode[] = [root];

  for (const token of tokens) {
    const current = stack[stack.length - 1];

    if (token.type === "text") {
      current.children.push(token.value);
    } else if (token.type === "open") {
      const node: TreeNode = { tag: token.tag, children: [] };
      current.children.push(node);
      stack.push(node);
    } else {
      // close tag — pop the stack (even if tags are mismatched, best-effort)
      if (stack.length > 1) {
        stack.pop();
      }
    }
  }

  return root;
}

function renderTree(
  node: TreeNode | string,
  components: Record<string, React.ReactElement>,
  keyPrefix: string,
): React.ReactNode {
  if (typeof node === "string") return node;

  const renderedChildren = node.children.map((child, i) =>
    renderTree(child, components, `${keyPrefix}-${i}`),
  );

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

function parseRichText(
  text: string,
  components: Record<string, React.ReactElement>,
): React.ReactNode {
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
const TransComponent = memo<TransProps>(
  ({ i18nKey, values, options, components, fallback, ...textProps }) => {
    const { t, tn } = useLang();

    const translatedText = useMemo(() => {
      try {
        if (options?.count !== undefined) {
          return tn(i18nKey, options.count, values, {
            namespace: options.namespace,
          });
        }

        return t(i18nKey, values, {
          namespace: options?.namespace,
          context: options?.context,
        });
      } catch (error) {
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
  },
);

TransComponent.displayName = "Trans";

export default TransComponent;
