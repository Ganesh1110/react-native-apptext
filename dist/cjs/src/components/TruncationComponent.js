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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TruncationComponent = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const context_1 = require("../context");
exports.TruncationComponent = (0, react_1.memo)(({ children, maxLines, onExpand, expandText = "Read more", collapseText = "Read less", style, }) => {
    const [isExpanded, setIsExpanded] = react_1.default.useState(false);
    const [isTruncated, setIsTruncated] = react_1.default.useState(false);
    const theme = (0, context_1.useAppTextTheme)();
    const handleTextLayout = (0, react_1.useCallback)((event) => {
        setIsTruncated(event.nativeEvent.lines.length > maxLines);
    }, [maxLines]);
    const handleToggle = (0, react_1.useCallback)(() => {
        setIsExpanded(!isExpanded);
        onExpand === null || onExpand === void 0 ? void 0 : onExpand();
    }, [isExpanded, onExpand]);
    return (<react_native_1.View>
        <react_native_1.Text style={style} numberOfLines={isExpanded ? undefined : maxLines} onTextLayout={handleTextLayout}>
          {children}
          {isTruncated && !isExpanded && "... "}
        </react_native_1.Text>
        {isTruncated && (<react_native_1.Text style={[style, { color: theme.colors.primary, marginTop: 4 }]} onPress={handleToggle}>
            {isExpanded ? collapseText : expandText}
          </react_native_1.Text>)}
      </react_native_1.View>);
});
