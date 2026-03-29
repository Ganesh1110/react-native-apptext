import {
  LocaleProvider,
  useLang,
  getPluralForm,
  PLURAL_RULES,
} from "../../src/LangCore";
import { renderHook, act } from "@testing-library/react-native";
import React from "react";

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

const translations = {
  en: {
    greeting: "Hello",
    items: {
      one: "{{count}} item",
      other: "{{count}} items",
    },
  },
  ar: {
    greeting: "\u0645\u0631\u062d\u0628\u0627",
  },
  he: {
    greeting: "\u05e9\u05dc\u05d5\u05dd",
  },
};

const makeWrapper =
  (lang: string) =>
  ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      LocaleProvider,
      { translations, defaultLanguage: lang, fallbackLanguage: "en", children },
      children
    );

// ---------------------------------------------------------------------------
// Plural rules
// ---------------------------------------------------------------------------

describe("PLURAL_RULES coverage", () => {
  const cases: Array<[string, number, string]> = [
    // Germanic
    ["en", 1, "one"],
    ["en", 2, "other"],
    ["de", 1, "one"],
    ["nl", 2, "other"],
    ["sv", 1, "one"],
    ["da", 2, "other"],
    ["nb", 1, "one"],
    // Romance
    ["fr", 0, "one"],
    ["fr", 2, "other"],
    ["es", 1, "one"],
    ["it", 1, "one"],
    ["pt", 1, "one"],
    ["ro", 1, "one"],
    ["ro", 0, "few"],
    ["ro", 20, "other"],
    // Slavic
    ["ru", 1, "one"],
    ["ru", 2, "few"],
    ["ru", 5, "many"],
    ["uk", 1, "one"],
    ["uk", 2, "few"],
    ["pl", 1, "one"],
    ["pl", 2, "few"],
    ["pl", 5, "many"],
    ["cs", 1, "one"],
    ["cs", 3, "few"],
    ["cs", 5, "many"],
    // Semitic
    ["ar", 1, "one"],
    ["ar", 2, "two"],
    ["ar", 5, "few"],
    ["ar", 15, "many"],
    ["he", 1, "one"],
    ["he", 2, "two"],
    // CJK / invariant
    ["zh", 1, "other"],
    ["ja", 100, "other"],
    ["ko", 1, "other"],
    // South / SE Asian
    ["hi", 0, "one"],
    ["hi", 2, "other"],
    ["bn", 1, "one"],
    ["vi", 5, "other"],
    ["th", 1, "other"],
    ["id", 100, "other"],
    ["ms", 1, "other"],
    // Turkic
    ["tr", 1, "one"],
    ["tr", 5, "other"],
    // Finno-Ugric
    ["fi", 1, "one"],
    ["hu", 1, "one"],
    // Hellenic
    ["el", 1, "one"],
    // Iranian
    ["fa", 1, "other"],
    ["ur", 1, "one"],
  ];

  it.each(cases)(
    "getPluralForm('%s', %d) === '%s'",
    (lang, count, expected) => {
      expect(getPluralForm(lang, count)).toBe(expected);
    }
  );

  it("falls back to English rule for unknown language", () => {
    expect(getPluralForm("xx", 1)).toBe("one");
    expect(getPluralForm("xx", 5)).toBe("other");
  });

  it("handles non-finite count gracefully", () => {
    expect(() => getPluralForm("en", NaN)).not.toThrow();
    expect(() => getPluralForm("en", Infinity)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// RTL direction detection
// ---------------------------------------------------------------------------

describe("RTL language direction", () => {
  it.each(["ar", "he", "fa", "ur"])(
    "reports rtl direction for %s",
    (lang) => {
      const { result } = renderHook(() => useLang(), {
        wrapper: makeWrapper(lang),
      });
      expect(result.current.direction).toBe("rtl");
    }
  );

  it("reports ltr direction for Latin languages", () => {
    const { result } = renderHook(() => useLang(), {
      wrapper: makeWrapper("en"),
    });
    expect(result.current.direction).toBe("ltr");
  });
});

// ---------------------------------------------------------------------------
// Cache is invalidated on language change
// ---------------------------------------------------------------------------

describe("Language change invalidates singleton cache", () => {
  it("returns translated text in both old and new language after change", async () => {
    const { result } = renderHook(() => useLang(), {
      wrapper: makeWrapper("en"),
    });

    expect(result.current.t("greeting")).toBe("Hello");

    act(() => {
      result.current.changeLanguage("ar");
    });

    // After language change (debounced — advance timers)
    await act(async () => {
      await new Promise((r) => setTimeout(r, 200));
    });

    expect(result.current.t("greeting")).toBe("\u0645\u0631\u062d\u0628\u0627");
  });
});

// ---------------------------------------------------------------------------
// Missing plural form falls back to 'other'
// ---------------------------------------------------------------------------

describe("Missing plural form falls back to other", () => {
  const trWithOnlyOther = {
    en: {
      fish: { other: "{{count}} fish" },
    },
  };

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      LocaleProvider,
      {
        translations: trWithOnlyOther,
        defaultLanguage: "en",
        children,
      },
      children
    );

  it("falls back to other when one form is missing", () => {
    const { result } = renderHook(() => useLang(), { wrapper });
    // count=1 would normally use 'one' but it's missing → should use 'other'
    expect(result.current.t("fish", { count: 1 }, { count: 1 })).toBe(
      "1 fish"
    );
  });
});
