import React, { createContext, useContext, useState, useCallback, useEffect, } from "react";
const LazyLocaleContext = createContext(null);
/**
 * LazyLocaleProvider with code-splitting support
 * Only loads translations when needed
 */
export function LazyLocaleProvider({ loaders, defaultLanguage, preloadLanguages = [], onLoadStart, onLoadComplete, onLoadError, children, }) {
    const [language, setLanguage] = useState(defaultLanguage);
    const [isLoading, setIsLoading] = useState(false);
    const [loadedLocales, setLoadedLocales] = useState(new Set());
    const [translations, setTranslations] = useState({});
    const loadLocale = useCallback(async (locale) => {
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
    const changeLanguage = useCallback(async (locale) => {
        await loadLocale(locale);
        setLanguage(locale);
    }, [loadLocale]);
    // Load default language on mount
    useEffect(() => {
        loadLocale(defaultLanguage);
    }, [defaultLanguage, loadLocale]);
    // Preload specified languages
    useEffect(() => {
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
export function useLazyLocale() {
    const context = useContext(LazyLocaleContext);
    if (!context) {
        throw new Error("useLazyLocale must be used within LazyLocaleProvider");
    }
    return context;
}
/**
 * Higher-order component for lazy loading translations
 */
export function withLazyTranslations(Component, requiredLocales) {
    return function LazyWrapper(props) {
        const { loadLocale, loadedLocales, isLoading } = useLazyLocale();
        const [ready, setReady] = useState(false);
        useEffect(() => {
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
export class NamespaceLoader {
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
