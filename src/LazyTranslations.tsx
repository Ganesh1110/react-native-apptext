import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Translations } from "./types";

interface LazyTranslationConfig {
  [locale: string]: () => Promise<{ default: Translations }>;
}

interface LazyLocaleContextValue {
  language: string;
  isLoading: boolean;
  loadedLocales: Set<string>;
  loadLocale: (locale: string) => Promise<void>;
  changeLanguage: (locale: string) => Promise<void>;
  translations: Record<string, Translations>;
}

const LazyLocaleContext = createContext<LazyLocaleContextValue | null>(null);

interface LazyLocaleProviderProps {
  /**
   * Configuration object mapping locale codes to dynamic import functions
   * @example
   * {
   *   en: () => import('./locales/en.json'),
   *   es: () => import('./locales/es.json'),
   *   fr: () => import('./locales/fr.json')
   * }
   */
  loaders: LazyTranslationConfig;

  /** Default language to load on mount */
  defaultLanguage: string;

  /** Languages to preload (optional) */
  preloadLanguages?: string[];

  /** Callback when loading starts */
  onLoadStart?: (locale: string) => void;

  /** Callback when loading completes */
  onLoadComplete?: (locale: string) => void;

  /** Callback when loading fails */
  onLoadError?: (locale: string, error: Error) => void;

  children: React.ReactNode;
}

/**
 * LazyLocaleProvider with code-splitting support
 * Only loads translations when needed
 */
export function LazyLocaleProvider({
  loaders,
  defaultLanguage,
  preloadLanguages = [],
  onLoadStart,
  onLoadComplete,
  onLoadError,
  children,
}: LazyLocaleProviderProps) {
  const [language, setLanguage] = useState(defaultLanguage);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedLocales, setLoadedLocales] = useState<Set<string>>(new Set());
  const [translations, setTranslations] = useState<
    Record<string, Translations>
  >({});

  const loadLocale = useCallback(
    async (locale: string) => {
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
        onLoadStart?.(locale);

        const module = await loader();
        const localeTranslations = module.default;

        setTranslations((prev) => ({
          ...prev,
          [locale]: localeTranslations,
        }));

        setLoadedLocales((prev) => new Set([...prev, locale]));
        onLoadComplete?.(locale);
      } catch (error) {
        console.error(`Failed to load locale: ${locale}`, error);
        onLoadError?.(locale, error as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [loaders, loadedLocales, onLoadStart, onLoadComplete, onLoadError]
  );

  const changeLanguage = useCallback(
    async (locale: string) => {
      await loadLocale(locale);
      setLanguage(locale);
    },
    [loadLocale]
  );

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

  const value: LazyLocaleContextValue = {
    language,
    isLoading,
    loadedLocales,
    loadLocale,
    changeLanguage,
    translations,
  };

  return (
    <LazyLocaleContext.Provider value={value}>
      {children}
    </LazyLocaleContext.Provider>
  );
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
export function withLazyTranslations<P extends object>(
  Component: React.ComponentType<P>,
  requiredLocales: string[]
) {
  return function LazyWrapper(props: P) {
    const { loadLocale, loadedLocales, isLoading } = useLazyLocale();
    const [ready, setReady] = useState(false);

    useEffect(() => {
      const loadRequired = async () => {
        await Promise.all(
          requiredLocales
            .filter((locale) => !loadedLocales.has(locale))
            .map((locale) => loadLocale(locale))
        );
        setReady(true);
      };

      loadRequired();
    }, [loadLocale, loadedLocales]);

    if (!ready || isLoading) {
      return null; // Or return a loading component
    }

    return <Component {...props} />;
  };
}

/**
 * Namespace-based lazy loading
 */
export class NamespaceLoader {
  private cache = new Map<string, Promise<Translations>>();
  private loaded = new Set<string>();

  constructor(
    private loaders: Record<string, () => Promise<{ default: Translations }>>
  ) {}

  async load(namespace: string): Promise<Translations> {
    // Return from cache if already loaded
    if (this.loaded.has(namespace)) {
      const result = await this.cache.get(namespace);
      return result!;
    }

    // Return existing promise if currently loading
    if (this.cache.has(namespace)) {
      return this.cache.get(namespace)!;
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

  isLoaded(namespace: string): boolean {
    return this.loaded.has(namespace);
  }

  preload(namespaces: string[]): Promise<void> {
    return Promise.all(namespaces.map((ns) => this.load(ns))).then(() => {});
  }
}

// Export types
export type { LazyTranslationConfig, LazyLocaleContextValue };
