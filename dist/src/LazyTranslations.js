import React, { createContext, useContext, useState, useCallback, useEffect, useRef, } from "react";
const LazyLocaleContext = createContext(null);
/**
 * LazyLocaleProvider with code-splitting support
 * Only loads translations when needed
 */
export function LazyLocaleProvider({ loaders, defaultLanguage, preloadLanguages = [], onLoadStart, onLoadComplete, onLoadError, children, }) {
    const [language, setLanguage] = useState(defaultLanguage);
    const [isLoading, setIsLoading] = useState(false);
    const [loadedLocales, setLoadedLocales] = useState(new Set());
    const [loadingProgress, setLoadingProgress] = useState(new Map());
    const [translations, setTranslations] = useState({});
    const inflightRequests = useRef(new Map());
    const loadLocale = useCallback(async (locale) => {
        // Skip if already loaded
        if (loadedLocales.has(locale)) {
            return;
        }
        // Return inflight request if exists (concurrency safety)
        if (inflightRequests.current.has(locale)) {
            return inflightRequests.current.get(locale);
        }
        const loader = loaders[locale];
        if (!loader) {
            console.warn(`No loader found for locale: ${locale}`);
            return;
        }
        const promise = (async () => {
            try {
                setIsLoading(true);
                // Mark as in-progress (0.5 = loading, 0 = not started, 1 = done)
                setLoadingProgress((prev) => new Map(prev).set(locale, 0.5));
                onLoadStart === null || onLoadStart === void 0 ? void 0 : onLoadStart(locale);
                const module = await loader();
                const localeTranslations = module.default;
                setTranslations((prev) => ({
                    ...prev,
                    [locale]: localeTranslations,
                }));
                setLoadedLocales((prev) => new Set([...prev, locale]));
                setLoadingProgress((prev) => new Map(prev).set(locale, 1));
                onLoadComplete === null || onLoadComplete === void 0 ? void 0 : onLoadComplete(locale);
            }
            catch (error) {
                console.warn(`Failed to load locale: ${locale}`, error);
                setLoadingProgress((prev) => new Map(prev).set(locale, 0));
                onLoadError === null || onLoadError === void 0 ? void 0 : onLoadError(locale, error);
            }
            finally {
                setIsLoading(false);
                inflightRequests.current.delete(locale);
            }
        })();
        inflightRequests.current.set(locale, promise);
        return promise;
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
            loadLocale(locale);
        });
    }, [preloadLanguages, loadLocale]);
    const value = {
        language,
        isLoading,
        loadedLocales,
        loadingProgress,
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
        throw new Error("useLazyLocale must be used within a LazyLocaleProvider");
    }
    return context;
}
/**
 * Higher-order component for lazy loading translations.
 *
 * Now accepts an optional `loadingFallback` node (shown during locale load)
 * so callers are not left with a blank screen.
 *
 * @example
 * const DashboardWithLocale = withLazyTranslations(
 *   DashboardScreen,
 *   ['en', 'fr'],
 *   { loadingFallback: <AppTextSkeleton variant="bodyMedium" lines={3} /> }
 * );
 */
export function withLazyTranslations(Component, requiredLocales, options = {}) {
    var _a, _b;
    const { loadingFallback = null } = options;
    const LazyWrapper = function (props) {
        const { loadLocale, loadedLocales } = useLazyLocale();
        const [ready, setReady] = useState(false);
        useEffect(() => {
            let cancelled = false;
            const loadRequired = async () => {
                await Promise.all(requiredLocales
                    .filter((locale) => !loadedLocales.has(locale))
                    .map((locale) => loadLocale(locale)));
                if (!cancelled)
                    setReady(true);
            };
            loadRequired();
            return () => { cancelled = true; };
        }, [loadLocale, loadedLocales]);
        if (!ready) {
            return <>{loadingFallback}</>;
        }
        return <Component {...props}/>;
    };
    LazyWrapper.displayName = `withLazyTranslations(${(_b = (_a = Component.displayName) !== null && _a !== void 0 ? _a : Component.name) !== null && _b !== void 0 ? _b : 'Component'})`;
    return LazyWrapper;
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
        const promise = loader()
            .then((module) => {
            this.loaded.add(namespace);
            return module.default;
        })
            .catch((err) => {
            this.cache.delete(namespace);
            throw err;
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
// ---------------------------------------------------------------------------
// useTranslationReady — fine-grained locale loading state
// ---------------------------------------------------------------------------
/**
 * Returns whether all `requiredLocales` are fully loaded.
 *
 * @example
 * const { ready, progress } = useTranslationReady(['en', 'ar']);
 * if (!ready) return <ProgressBar value={progress} />;
 */
export function useTranslationReady(requiredLocales) {
    const { loadedLocales, loadingProgress } = useLazyLocale();
    const loaded = requiredLocales.filter((l) => loadedLocales.has(l)).length;
    const total = requiredLocales.length;
    if (total === 0)
        return { ready: true, progress: 1 };
    // Calculate weighted progress
    const totalProgress = requiredLocales.reduce((sum, locale) => {
        var _a;
        if (loadedLocales.has(locale))
            return sum + 1;
        return sum + ((_a = loadingProgress.get(locale)) !== null && _a !== void 0 ? _a : 0);
    }, 0);
    return {
        ready: loaded === total,
        progress: Math.min(totalProgress / total, 1),
    };
}
