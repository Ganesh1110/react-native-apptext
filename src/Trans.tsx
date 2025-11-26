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
   * Custom components for rich text translation
   * Example: { bold: <strong />, link: <a /> }
   */
  components?: Record<string, React.ReactElement>;

  /**
   * Fallback text when translation is missing
   */
  fallback?: string;
}

/**
 * Trans component for seamless translation integration with AppText
 * Supports rich text translation with components and ICU message format
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

    // Handle rich text with components
    const renderWithComponents = useMemo(() => {
      if (!components || Object.keys(components).length === 0) {
        return translatedText;
      }

      // Simple regex to find component placeholders like <0>content</0>
      const componentRegex = /<(\w+)>(.*?)<\/\1>/g;
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;

      while ((match = componentRegex.exec(translatedText)) !== null) {
        const [fullMatch, componentName, content] = match;

        // Add text before the component
        if (match.index > lastIndex) {
          parts.push(translatedText.slice(lastIndex, match.index));
        }

        // Add the component with content
        const Component = components[componentName];
        if (Component && React.isValidElement(Component)) {
          parts.push(
            React.cloneElement(Component, {
              key: `${componentName}-${match.index}`,
              children: content,
            } as any)
          );
        } else {
          // Fallback to plain text if component not found
          parts.push(content);
        }

        lastIndex = match.index + fullMatch.length;
      }

      // Add remaining text
      if (lastIndex < translatedText.length) {
        parts.push(translatedText.slice(lastIndex));
      }

      return parts.length > 0 ? parts : translatedText;
    }, [translatedText, components]);

    return <AppText {...textProps}>{renderWithComponents}</AppText>;
  }
);

TransComponent.displayName = "Trans";

export default TransComponent;
