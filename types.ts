import { TextProps, TextStyle, StyleProp } from "react-native";

export type TypographyVariant =
  | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  | "title" | "subtitle1" | "subtitle2"
  | "body1" | "body2"
  | "caption" | "overline"
  | "button" | "code";

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
  m?: number; mt?: number; mr?: number; mb?: number; ml?: number;
  mx?: number; my?: number;
  p?: number; pt?: number; pr?: number; pb?: number; pl?: number;
  px?: number; py?: number;
}

export interface AppTextProps
  extends Omit<TextProps, "style">,
    SpacingProps {
  variant?: TypographyVariant;
  color?: keyof AppTextTheme["colors"] | string;
  size?: number | "auto";
  weight?: TextStyle["fontWeight"];
  align?: TextStyle["textAlign"];
  transform?: TextStyle["textTransform"];
  decoration?: TextStyle["textDecorationLine"];
  italic?: boolean;
  truncate?: boolean | number;
  shadow?: boolean;
  responsive?: boolean;
  style?: StyleProp<TextStyle>;
  testID?: string;
  expandText?: string; 
  collapseText?: string;
}