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
exports.NamespaceLoader = void 0;
exports.LazyLocaleProvider = LazyLocaleProvider;
exports.useLazyLocale = useLazyLocale;
exports.withLazyTranslations = withLazyTranslations;
const react_1 = __importStar(require("react"));
const LazyLocaleContext = (0, react_1.createContext)(null);
/**
 * LazyLocaleProvider with code-splitting support
 * Only loads translations when needed
 */
function LazyLocaleProvider({ loaders, defaultLanguage, preloadLanguages = [], onLoadStart, onLoadComplete, onLoadError, children, }) {
    const [language, setLanguage] = (0, react_1.useState)(defaultLanguage);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [loadedLocales, setLoadedLocales] = (0, react_1.useState)(new Set());
    const [translations, setTranslations] = (0, react_1.useState)({});
    const loadLocale = (0, react_1.useCallback)(async (locale) => {
        // Skip if already loaded
        if (loadedLocales.has(locale)) {
            return;
        }
        const loader = loaders[locale];
        if (!loader) {
            console.warn(`No loader found for locale: ${locale}`);
            return;
        }
        try {
            setIsLoading(true);
            onLoadStart === null || onLoadStart === void 0 ? void 0 : onLoadStart(locale);
            const module = await loader();
            const localeTranslations = module.default;
            setTranslations((prev) => ({
                ...prev,
                [locale]: localeTranslations,
            }));
            setLoadedLocales((prev) => new Set([...prev, locale]));
            onLoadComplete === null || onLoadComplete === void 0 ? void 0 : onLoadComplete(locale);
        }
        catch (error) {
            console.error(`Failed to load locale: ${locale}`, error);
            onLoadError === null || onLoadError === void 0 ? void 0 : onLoadError(locale, error);
        }
        finally {
            setIsLoading(false);
        }
    }, [loaders, loadedLocales, onLoadStart, onLoadComplete, onLoadError]);
    const changeLanguage = (0, react_1.useCallback)(async (locale) => {
        await loadLocale(locale);
        setLanguage(locale);
    }, [loadLocale]);
    // Load default language on mount
    (0, react_1.useEffect)(() => {
        loadLocale(defaultLanguage);
    }, [defaultLanguage, loadLocale]);
    // Preload specified languages
    (0, react_1.useEffect)(() => {
        preloadLanguages.forEach((locale) => {
            if (!loadedLocales.has(locale)) {
                loadLocale(locale);
            }
        });
    }, [preloadLanguages, loadedLocales, loadLocale]);
    const value = {
        language,
        isLoading,
        loadedLocales,
        loadLocale,
        changeLanguage,
        translations,
    };
    return (<LazyLocaleContext.Provider value={value}>
      {children}
    </LazyLocaleContext.Provider>);
}
/**
 * Hook to access lazy translation context
 */
function useLazyLocale() {
    const context = (0, react_1.useContext)(LazyLocaleContext);
    if (!context) {
        // Return a safe fallback instead of throwing
        return {
            language: "",
            isLoading: false,
            loadedLocales: new Set(),
            loadLocale: async () => { },
            changeLanguage: async () => { },
            translations: {},
        };
    }
    return context;
}
/**
 * Higher-order component for lazy loading translations
 */
function withLazyTranslations(Component, requiredLocales) {
    return function LazyWrapper(props) {
        const { loadLocale, loadedLocales, isLoading } = useLazyLocale();
        const [ready, setReady] = (0, react_1.useState)(false);
        (0, react_1.useEffect)(() => {
            const loadRequired = async () => {
                await Promise.all(requiredLocales
                    .filter((locale) => !loadedLocales.has(locale))
                    .map((locale) => loadLocale(locale)));
                setReady(true);
            };
            loadRequired();
        }, [loadLocale, loadedLocales]);
        if (!ready || isLoading) {
            return null; // Or return a loading component
        }
        return <Component {...props}/>;
    };
}
/**
 * Namespace-based lazy loading
 */
class NamespaceLoader {
    constructor(loaders) {
        this.loaders = loaders;
        this.cache = new Map();
        this.loaded = new Set();
    }
    async load(namespace) {
        // Return from cache if already loaded
        if (this.loaded.has(namespace)) {
            const result = await this.cache.get(namespace);
            return result;
        }
        // Return existing promise if currently loading
        if (this.cache.has(namespace)) {
            return this.cache.get(namespace);
        }
        // Start loading
        const loader = this.loaders[namespace];
        if (!loader) {
            throw new Error(`No loader found for namespace: ${namespace}`);
        }
        const promise = loader().then((module) => {
            this.loaded.add(namespace);
            return module.default;
        });
        this.cache.set(namespace, promise);
        return promise;
    }
    isLoaded(namespace) {
        return this.loaded.has(namespace);
    }
    preload(namespaces) {
        return Promise.all(namespaces.map((ns) => this.load(ns))).then(() => { });
    }
}
exports.NamespaceLoader = NamespaceLoader;
