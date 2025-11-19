import React, { createContext } from "react";
import { TextProps, TextStyle, StyleProp } from "react-native";

// ============================================================================
// SCRIPT & TYPOGRAPHY TYPES (Keep existing)
// ============================================================================

export type ScriptCode =
  | "Latn"
  | "Arab"
  | "Cyrl"
  | "Deva"
  | "Hani"
  | "Hang"
  | "Hira"
  | "Kana"
  | "Beng"
  | "Taml"
  | "Telu"
  | "Gujr"
  | "Guru"
  | "Knda"
  | "Mlym"
  | "Orya"
  | "Sinh"
  | "Thai"
  | "Laoo"
  | "Mymr"
  | "Khmr"
  | "Tibt"
  | "Ethi"
  | "Geor"
  | "Armn"
  | "Hebr"
  | "Grek"
  | "Copt"
  | "Cans"
  | "Cher"
  | "Tfng"
  | "Vaii"
  | "Bamu"
  | "Nkoo"
  | "Adlm"
  | "Olck"
  | "Mtei"
  | "Java"
  | "Bali"
  | "Sund"
  | "Bugi"
  | "Cham"
  | "Tglg"
  | "Hano"
  | "Buhd"
  | "Cakm"
  | "Limb"
  | "Lisu"
  | "Yiii"
  | "Mong"
  | "Thaa"
  | "Hmng"
  | "Kali"
  | "Unknown";

export interface ScriptConfig {
  name: string;
  direction: "ltr" | "rtl";
  region: string;
  population: number;
  lineHeightMultiplier: number;
  complexShaping: boolean;
  unicodeRanges: Array<[number, number]>;
}

export type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "title"
  | "subtitle1"
  | "subtitle2"
  | "body1"
  | "body2"
  | "caption"
  | "overline"
  | "button"
  | "code";

export interface TypographyBlock {
  fontSize: number;
  lineHeight?: number;
  fontWeight?: TextStyle["fontWeight"];
  letterSpacing?: number;
  textTransform?: TextStyle["textTransform"];
  fontFamily?: string;
}

export interface AppTextTheme {
  colors: {
    primary: string;
    secondary: string;
    text: string;
    textSecondary: string;
    background: string;
    surface: string;
    error: string;
    warning: string;
    info: string;
    success: string;
  };
  typography: {
    [K in TypographyVariant]: TypographyBlock;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

export interface SpacingProps {
  m?: number;
  mt?: number;
  mr?: number;
  mb?: number;
  ml?: number;
  mx?: number;
  my?: number;
  p?: number;
  pt?: number;
  pr?: number;
  pb?: number;
  pl?: number;
  px?: number;
  py?: number;
}

export interface AppTextProps extends Omit<TextProps, "style">, SpacingProps {
  variant?: TypographyVariant;
  color?: keyof AppTextTheme["colors"] | string;
  size?: number | "auto";
  weight?: TextStyle["fontWeight"];
  align?: TextStyle["textAlign"];
  transform?: TextStyle["textTransform"];
  decoration?: TextStyle["textDecorationLine"];
  italic?: boolean;
  truncate?: boolean | number;
  gradient?: boolean;
  shadow?: boolean;
  animated?: boolean;
  script?: ScriptCode;
  direction?: "auto" | "ltr" | "rtl";
  responsive?: boolean;
  style?: StyleProp<TextStyle>;
  testID?: string;
  hyphenationFrequency?: "none" | "normal" | "full";
  textBreakStrategy?: "simple" | "highQuality" | "balanced";
}

// ============================================================================
// ENHANCED TRANSLATION TYPES
// ============================================================================

/**
 * Plural form selector based on count and language
 * Different languages have different plural rules
 */
export type PluralForm = "zero" | "one" | "two" | "few" | "many" | "other";

/**
 * Translation object with plural support
 */
export interface PluralTranslation {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string; // Required fallback
}

/**
 * Translation value can be:
 * - Simple string: "Hello"
 * - ICU MessageFormat string: "You have {count, plural, one {# item} other {# items}}"
 * - Plural object: { one: "1 item", other: "{{count}} items" }
 */
export type TranslationValue = string | PluralTranslation;

/**
 * Nested translation structure
 * Supports infinite nesting: { user: { profile: { name: "Name" } } }
 */
export interface Translations {
  [key: string]: TranslationValue | Translations;
}

/**
 * Translation options for advanced features
 */
export interface TranslationOptions {
  /** Namespace for code-splitting (e.g., "auth", "dashboard") */
  namespace?: string;

  /** Context for variations (e.g., "male", "female", "formal") */
  context?: string;

  /** Count for plural selection */
  count?: number;

  /** Default value if translation missing */
  defaultValue?: string;

  /** Post-process the translation result */
  postProcess?: (value: string) => string;
}

/**
 * Enhanced LocaleContext with all features
 */
export interface LocaleContextValue {
  /** Current language code (e.g., "en", "fr-FR") */
  language: string;

  /** Text direction based on language */
  direction: "rtl" | "ltr";

  /**
   * Translate a key with optional parameters
   * @param key - Translation key (supports nesting: "user.profile.name")
   * @param params - Values for interpolation
   * @param options - Advanced options (namespace, context, count)
   *
   * @example
   * t("welcome.message", { name: "John" })
   * t("items", { count: 5 }, { count: 5 })
   * t("greeting", { name: "John" }, { context: "formal" })
   */
  t: (
    key: string,
    params?: Record<string, any>,
    options?: TranslationOptions
  ) => string;

  /**
   * Translate with plural support
   * @param key - Translation key
   * @param count - Number for plural selection
   * @param params - Additional parameters
   * @param options - Namespace and other options
   *
   * @example
   * tn("items", 5) // "5 items"
   * tn("items", 1) // "1 item"
   */
  tn: (
    key: string,
    count: number,
    params?: Record<string, any>,
    options?: { namespace?: string }
  ) => string;

  /**
   * Change the current language
   * @param lang - New language code
   */
  changeLanguage: (lang: string) => void;

  /**
   * Load a namespace dynamically (for code-splitting)
   * @param namespace - Namespace identifier
   * @param loader - Async function that returns translations
   *
   * @example
   * loadNamespace("dashboard", () => import("./translations/dashboard"))
   */
  loadNamespace: (
    namespace: string,
    loader: () => Promise<any>
  ) => Promise<void>;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Props for LocaleProvider
 */
export interface LocaleProviderProps {
  /** Translation object organized by language */
  translations: Record<string, Translations>;

  /** Default language to use on initialization */
  defaultLanguage: string;

  /** Fallback language when translation is missing (default: "en") */
  fallbackLanguage?: string;

  /** Enable ICU MessageFormat syntax (default: true) */
  useICU?: boolean;

  /** Callback when a translation key is missing */
  onMissingTranslation?: (
    lang: string,
    key: string,
    namespace?: string
  ) => void;

  /** Child components */
  children: React.ReactNode;
}

// ============================================================================
// TYPE-SAFE TRANSLATION KEYS (Optional, for TypeScript users)
// ============================================================================

/**
 * Helper type to extract all nested keys from translation object
 * Usage: type TranslationKeys = DeepKeyOf<typeof translations.en>
 */
export type DeepKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}` | `${K}.${DeepKeyOf<T[K]>}`
          : `${K}`
        : never;
    }[keyof T]
  : never;

/**
 * Type-safe translation hook
 * Usage: const { t } = useTypedLang<typeof translations.en>()
 */
export interface TypedLocaleContextValue<T extends Translations> {
  language: string;
  direction: "rtl" | "ltr";
  t: (
    key: DeepKeyOf<T>,
    params?: Record<string, any>,
    options?: TranslationOptions
  ) => string;
  tn: (
    key: DeepKeyOf<T>,
    count: number,
    params?: Record<string, any>,
    options?: { namespace?: string }
  ) => string;
  changeLanguage: (lang: string) => void;
  loadNamespace: (
    namespace: string,
    loader: () => Promise<any>
  ) => Promise<void>;
}

// ============================================================================
// FORMATTING OPTIONS
// ============================================================================

/**
 * Number formatting options for ICU MessageFormat
 */
export interface NumberFormatOptions {
  style?: "decimal" | "currency" | "percent";
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Date formatting options for ICU MessageFormat
 */
export interface DateFormatOptions {
  dateStyle?: "full" | "long" | "medium" | "short";
  timeStyle?: "full" | "long" | "medium" | "short";
  year?: "numeric" | "2-digit";
  month?: "numeric" | "2-digit" | "long" | "short" | "narrow";
  day?: "numeric" | "2-digit";
}
