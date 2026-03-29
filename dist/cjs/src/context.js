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
exports.useAppTextTheme = exports.AppTextProvider = void 0;
const react_1 = __importStar(require("react"));
const theme_1 = require("./theme");
const AppTextContext = react_1.default.createContext(null);
function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            const sourceValue = source[key];
            const targetValue = result[key];
            if (sourceValue &&
                typeof sourceValue === "object" &&
                !Array.isArray(sourceValue) &&
                targetValue &&
                typeof targetValue === "object" &&
                !Array.isArray(targetValue)) {
                result[key] = deepMerge(targetValue, sourceValue);
            }
            else if (sourceValue !== undefined) {
                result[key] = sourceValue;
            }
        }
    }
    return result;
}
const AppTextProvider = ({ theme: customTheme, children }) => {
    const [theme, setTheme] = (0, react_1.useState)(() => deepMerge(theme_1.DEFAULT_THEME, customTheme || {}));
    const updateTheme = (0, react_1.useCallback)((newTheme) => {
        setTheme((prevTheme) => deepMerge(prevTheme, newTheme));
    }, []);
    const contextValue = (0, react_1.useMemo)(() => ({ theme, updateTheme }), [theme, updateTheme]);
    return (<AppTextContext.Provider value={contextValue}>
      {children}
    </AppTextContext.Provider>);
};
exports.AppTextProvider = AppTextProvider;
const useAppTextTheme = () => {
    var _a;
    const context = (0, react_1.useContext)(AppTextContext);
    return (_a = context === null || context === void 0 ? void 0 : context.theme) !== null && _a !== void 0 ? _a : theme_1.DEFAULT_THEME;
};
exports.useAppTextTheme = useAppTextTheme;
