import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useContext,
} from "react";
import { AccessibilityInfo } from "react-native";
import { LocaleContext, LocaleProviderProps } from "../types";
import { debounce } from "../PerformanceOptimizations";
import { TranslationManager, Translations } from "./TranslationManager";

export function LocaleProvider({
  translations,
  defaultLanguage,
  fallbackLanguage = "en",
  useICU = true,
  onMissingTranslation,
  children,
}: LocaleProviderProps & {
  fallbackLanguage?: string;
  useICU?: boolean;
  onMissingTranslation?: (
    lang: string,
    key: string,
    namespace?: string
  ) => void;
}) {
  const [language, setLanguage] = useState(defaultLanguage);
  const [loadedNamespaces, setLoadedNamespaces] = useState<Set<string>>(
    new Set(["main"])
  );

  const initialMount = useRef(true);

  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    if (AccessibilityInfo?.announceForAccessibility) {
      AccessibilityInfo.announceForAccessibility(`Language changed to ${language}`);
    }
  }, [language]);

  const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];

  const direction: "rtl" | "ltr" = useMemo(() => {
    const langCode = language.split("-")[0];
    return RTL_LANGUAGES.includes(langCode) ? "rtl" : "ltr";
  }, [language]);

  const manager = useMemo(() => {
    return new TranslationManager(translations as Record<string, Translations>, {
      fallbackLanguage,
      shouldWarnMissing: true,
      useICU,
      onMissingKey: onMissingTranslation,
    });
  }, [translations, fallbackLanguage, useICU, onMissingTranslation]);

  const t = useCallback(
    (
      key: string,
      params?: Record<string, any>,
      options?: { namespace?: string; context?: string; count?: number }
    ) => {
      return manager.translate(language, key, params, options);
    },
    [language, manager]
  );

  /**
   * @deprecated Use `t(key, params, { count })` instead.
   * `tn` will be removed in a future major version.
   */
  const tn = useCallback(
    (
      key: string,
      count: number,
      params?: Record<string, any>,
      options?: { namespace?: string }
    ) => {
      return manager.translatePlural(language, key, count, params, options);
    },
    [language, manager]
  );

  const debouncedChangeLanguage = useMemo(
    () =>
      debounce((lang: string) => {
        setLanguage(lang);
        manager.clearCache();
      }, 150),
    [manager]
  );

  const changeLanguage = useCallback(
    (lang: string) => {
      debouncedChangeLanguage(lang);
    },
    [debouncedChangeLanguage]
  );

  const loadNamespace = useCallback(
    async (namespace: string, loader: () => Promise<any>) => {
      if (loadedNamespaces.has(namespace)) return;

      try {
        const translations = await loader();
        manager.addNamespace(namespace, translations);
        setLoadedNamespaces((prev) => new Set([...prev, namespace]));
      } catch (error) {
        console.error(`Failed to load namespace: ${namespace}`, error);
      }
    },
    [manager, loadedNamespaces]
  );

  const value = useMemo(
    () => ({
      language,
      t,
      tn,
      direction,
      changeLanguage,
      loadNamespace,
    }),
    [language, t, tn, direction, changeLanguage, loadNamespace]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLang must be used within LocaleProvider");
  }
  return context;
}

export function useNamespace(namespace: string, loader: () => Promise<any>) {
  const { loadNamespace } = useLang();

  useEffect(() => {
    loadNamespace(namespace, loader);
  }, [namespace, loader, loadNamespace]);
}
