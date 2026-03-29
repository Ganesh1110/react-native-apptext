import React, { useState, useCallback, useMemo, useEffect, useRef, useContext, } from "react";
import { AccessibilityInfo } from "react-native";
import { LocaleContext } from "../types";
import { debounce } from "../PerformanceOptimizations";
import { TranslationManager } from "./TranslationManager";
export function LocaleProvider({ translations, defaultLanguage, fallbackLanguage = "en", useICU = true, onMissingTranslation, children, }) {
    const [language, setLanguage] = useState(defaultLanguage);
    const [loadedNamespaces, setLoadedNamespaces] = useState(new Set(["main"]));
    const initialMount = useRef(true);
    useEffect(() => {
        if (initialMount.current) {
            initialMount.current = false;
            return;
        }
        if (AccessibilityInfo === null || AccessibilityInfo === void 0 ? void 0 : AccessibilityInfo.announceForAccessibility) {
            AccessibilityInfo.announceForAccessibility(`Language changed to ${language}`);
        }
    }, [language]);
    const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];
    const direction = useMemo(() => {
        const langCode = language.split("-")[0];
        return RTL_LANGUAGES.includes(langCode) ? "rtl" : "ltr";
    }, [language]);
    const manager = useMemo(() => {
        return new TranslationManager(translations, {
            fallbackLanguage,
            shouldWarnMissing: true,
            useICU,
            onMissingKey: onMissingTranslation,
        });
    }, [translations, fallbackLanguage, useICU, onMissingTranslation]);
    const t = useCallback((key, params, options) => {
        return manager.translate(language, key, params, options);
    }, [language, manager]);
    /**
     * @deprecated Use `t(key, params, { count })` instead.
     * `tn` will be removed in a future major version.
     */
    const tn = useCallback((key, count, params, options) => {
        return manager.translatePlural(language, key, count, params, options);
    }, [language, manager]);
    const debouncedChangeLanguage = useMemo(() => debounce((lang) => {
        setLanguage(lang);
        manager.clearCache();
    }, 150), [manager]);
    const changeLanguage = useCallback((lang) => {
        debouncedChangeLanguage(lang);
    }, [debouncedChangeLanguage]);
    const loadNamespace = useCallback(async (namespace, loader) => {
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
    const value = useMemo(() => ({
        language,
        t,
        tn,
        direction,
        changeLanguage,
        loadNamespace,
    }), [language, t, tn, direction, changeLanguage, loadNamespace]);
    return (<LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>);
}
export function useLang() {
    const context = useContext(LocaleContext);
    if (!context) {
        throw new Error("useLang must be used within LocaleProvider");
    }
    return context;
}
export function useNamespace(namespace, loader) {
    const { loadNamespace } = useLang();
    useEffect(() => {
        loadNamespace(namespace, loader);
    }, [namespace, loader, loadNamespace]);
}
