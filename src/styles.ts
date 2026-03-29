import { StyleSheet, TextStyle, ViewStyle } from "react-native";

export const staticStyles = StyleSheet.create({
  container: {
    overflow: "visible",
  } as ViewStyle,
  text: {
    overflow: "visible",
  } as TextStyle,
  link: {
    textDecorationLine: "underline",
  } as TextStyle,
  cursor: {
    color: "inherit",
  } as TextStyle,
  errorContainer: {
    padding: 10,
    backgroundColor: "#FF000010",
  } as ViewStyle,
  errorText: {
    color: "#FF0000",
  } as TextStyle,
  truncateText: {
    marginTop: 4,
  } as TextStyle,
});

export const baseShadowStyle: TextStyle = {
  textShadowColor: "rgba(0,0,0,0.3)",
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 2,
};
