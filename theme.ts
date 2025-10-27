import { AppTextTheme } from "./types";
import { Platform } from "react-native";

export const DEFAULT_THEME: AppTextTheme = {
  colors: {
    primary: "#007AFF",
    secondary: "#5856D6",
    text: "#000000",
    textSecondary: "#666666",
    background: "#FFFFFF",
    surface: "#F8F9FA",
    error: "#FF3B30",
    warning: "#FF9500",
    info: "#5AC8FA",
    success: "#34C759",
  },
  typography: {
    h1: { fontSize: 32, fontWeight: "bold", lineHeight: 40 },
    h2: { fontSize: 28, fontWeight: "bold", lineHeight: 36 },
    h3: { fontSize: 24, fontWeight: "600", lineHeight: 32 },
    h4: { fontSize: 20, fontWeight: "600", lineHeight: 28 },
    h5: { fontSize: 18, fontWeight: "600", lineHeight: 26 },
    h6: { fontSize: 16, fontWeight: "600", lineHeight: 24 },
    title: { fontSize: 22, fontWeight: "600", lineHeight: 30 },
    subtitle1: { fontSize: 18, fontWeight: "500", lineHeight: 26 },
    subtitle2: { fontSize: 16, fontWeight: "500", lineHeight: 24 },
    body1: { fontSize: 16, lineHeight: 24 },
    body2: { fontSize: 14, lineHeight: 22 },
    caption: { fontSize: 12, lineHeight: 18 },
    overline: {
      fontSize: 10,
      lineHeight: 16,
      textTransform: "uppercase",
      letterSpacing: 1.5,
    },
    button: {
      fontSize: 16,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    code: {
      fontSize: 14,
      fontWeight: "400",
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    },
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
};