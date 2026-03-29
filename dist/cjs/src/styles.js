"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseShadowStyle = exports.staticStyles = void 0;
const react_native_1 = require("react-native");
exports.staticStyles = react_native_1.StyleSheet.create({
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
exports.baseShadowStyle = {
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
};
