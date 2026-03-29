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
exports.LocaleProvider = LocaleProvider;
exports.useLang = useLang;
exports.useNamespace = useNamespace;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const types_1 = require("../types");
const PerformanceOptimizations_1 = require("../PerformanceOptimizations");
const TranslationManager_1 = require("./TranslationManager");
function LocaleProvider({ translations, defaultLanguage, fallbackLanguage = "en", useICU = true, onMissingTranslation, children, }) {
    const [language, setLanguage] = (0, react_1.useState)(defaultLanguage);
    const [loadedNamespaces, setLoadedNamespaces] = (0, react_1.useState)(new Set(["main"]));
    const initialMount = (0, react_1.useRef)(true);
    (0, react_1.useEffect)(() => {
        if (initialMount.current) {
            initialMount.current = false;
            return;
        }
        if (react_native_1.AccessibilityInfo === null || react_native_1.AccessibilityInfo === void 0 ? void 0 : react_native_1.AccessibilityInfo.announceForAccessibility) {
            react_native_1.AccessibilityInfo.announceForAccessibility(`Language changed to ${language}`);
        }
    }, [language]);
    const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];
    const direction = (0, react_1.useMemo)(() => {
        const langCode = language.split("-")[0];
        return RTL_LANGUAGES.includes(langCode) ? "rtl" : "ltr";
    }, [language]);
    const manager = (0, react_1.useMemo)(() => {
        return new TranslationManager_1.TranslationManager(translations, {
            fallbackLanguage,
            shouldWarnMissing: true,
            useICU,
            onMissingKey: onMissingTranslation,
        });
    }, [translations, fallbackLanguage, useICU, onMissingTranslation]);
    const t = (0, react_1.useCallback)((key, params, options) => {
        return manager.translate(language, key, params, options);
    }, [language, manager]);
    /**
     * @deprecated Use `t(key, params, { count })` instead.
     * `tn` will be removed in a future major version.
     */
    const tn = (0, react_1.useCallback)((key, count, params, options) => {
        return manager.translatePlural(language, key, count, params, options);
    }, [language, manager]);
    const debouncedChangeLanguage = (0, react_1.useMemo)(() => (0, PerformanceOptimizations_1.debounce)((lang) => {
        setLanguage(lang);
        manager.clearCache();
    }, 150), [manager]);
    const changeLanguage = (0, react_1.useCallback)((lang) => {
        debouncedChangeLanguage(lang);
    }, [debouncedChangeLanguage]);
    const loadNamespace = (0, react_1.useCallback)(async (namespace, loader) => {
        if (loadedNamespaces.has(namespace))
            return;
        try {
            const translations = await loader();
            manager.addNamespace(namespace, translations);
            setLoadedNamespaces((prev) => new Set([...prev, namespace]));
        }
        catch (error) {
            console.error(`Failed to load namespace: ${namespace}`, error);
        }
    }, [manager, loadedNamespaces]);
    const value = (0, react_1.useMemo)(() => ({
        language,
        t,
        tn,
        direction,
        changeLanguage,
        loadNamespace,
    }), [language, t, tn, direction, changeLanguage, loadNamespace]);
    return (<types_1.LocaleContext.Provider value={value}>{children}</types_1.LocaleContext.Provider>);
}
function useLang() {
    const context = (0, react_1.useContext)(types_1.LocaleContext);
    if (!context) {
        throw new Error("useLang must be used within LocaleProvider");
    }
    return context;
}
function useNamespace(namespace, loader) {
    const { loadNamespace } = useLang();
    (0, react_1.useEffect)(() => {
        loadNamespace(namespace, loader);
    }, [namespace, loader, loadNamespace]);
}
