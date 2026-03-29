import { StyleSheet } from "react-native";
export const staticStyles = StyleSheet.create({
    container: {
        overflow: "visible",
    },
    text: {
        overflow: "visible",
    },
    link: {
        textDecorationLine: "underline",
    },
    cursor: {
        color: "inherit",
    },
    errorContainer: {
        padding: 10,
        backgroundColor: "#FF000010",
    },
    errorText: {
        color: "#FF0000",
    },
    truncateText: {
        marginTop: 4,
    },
});
export const baseShadowStyle = {
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
};
