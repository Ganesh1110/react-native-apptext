import { TextProps, TextStyle, StyleProp } from "react-native";

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
