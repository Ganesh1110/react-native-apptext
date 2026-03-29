"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORDINAL_RULES = exports.PLURAL_RULES = void 0;
exports.getPluralForm = getPluralForm;
exports.getOrdinalForm = getOrdinalForm;
exports.PLURAL_RULES = {
    // Germanic
    en: (n) => (n === 1 ? "one" : "other"),
    de: (n) => (n === 1 ? "one" : "other"),
    nl: (n) => (n === 1 ? "one" : "other"),
    sv: (n) => (n === 1 ? "one" : "other"),
    da: (n) => (n === 1 ? "one" : "other"),
    nb: (n) => (n === 1 ? "one" : "other"), // Norwegian Bokmål
    // Romance
    fr: (n) => (n === 0 || n === 1 ? "one" : "other"),
    es: (n) => (n === 1 ? "one" : "other"),
    it: (n) => (n === 1 ? "one" : "other"),
    pt: (n) => (n === 0 || n === 1 ? "one" : "other"),
    ro: (n) => {
        if (n === 1)
            return "one";
        if (n === 0 || (n % 100 >= 1 && n % 100 <= 19))
            return "few";
        return "other";
    },
    // Slavic
    ru: (n) => {
        const mod10 = n % 10;
        const mod100 = n % 100;
        if (mod10 === 1 && mod100 !== 11)
            return "one";
        if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
            return "few";
        return "many";
    },
    uk: (n) => {
        const mod10 = n % 10;
        const mod100 = n % 100;
        if (mod10 === 1 && mod100 !== 11)
            return "one";
        if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
            return "few";
        return "many";
    },
    pl: (n) => {
        const mod10 = n % 10;
        const mod100 = n % 100;
        if (n === 1)
            return "one";
        if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
            return "few";
        return "many";
    },
    cs: (n) => {
        if (n === 1)
            return "one";
        if (n >= 2 && n <= 4)
            return "few";
        return "many";
    },
    // Semitic
    ar: (n) => {
        if (n === 0)
            return "zero";
        if (n === 1)
            return "one";
        if (n === 2)
            return "two";
        if (n % 100 >= 3 && n % 100 <= 10)
            return "few";
        if (n % 100 >= 11)
            return "many";
        return "other";
    },
    he: (n) => {
        if (n === 1)
            return "one";
        if (n === 2)
            return "two";
        if (n >= 11 && n % 10 === 0)
            return "many";
        return "other";
    },
    // CJK — all are invariant
    zh: () => "other",
    ja: () => "other",
    ko: () => "other",
    // South / Southeast Asian
    hi: (n) => (n === 0 || n === 1 ? "one" : "other"),
    bn: (n) => (n === 0 || n === 1 ? "one" : "other"),
    vi: () => "other",
    th: () => "other",
    id: () => "other",
    ms: () => "other",
    // Turkic
    tr: (n) => (n === 1 ? "one" : "other"),
    // Finno-Ugric
    fi: (n) => (n === 1 ? "one" : "other"),
    hu: (n) => (n === 1 ? "one" : "other"),
    // Hellenic
    el: (n) => (n === 1 ? "one" : "other"),
    // Iranian / Iranic
    fa: () => "other",
    ur: (n) => (n === 1 ? "one" : "other"),
    // Celtic
    cy: (n) => {
        if (n === 0)
            return "zero";
        if (n === 1)
            return "one";
        if (n === 2)
            return "two";
        if (n === 3)
            return "few";
        if (n === 6)
            return "many";
        return "other";
    },
    ga: (n) => {
        if (n === 1)
            return "one";
        if (n === 2)
            return "two";
        if (n >= 3 && n <= 6)
            return "few";
        if (n >= 7 && n <= 10)
            return "many";
        return "other";
    },
    // Baltic
    lt: (n) => {
        const mod10 = n % 10;
        const mod100 = n % 100;
        if (mod10 === 1 && mod100 !== 11)
            return "one";
        if (mod10 >= 2 && mod10 <= 9 && (mod100 < 11 || mod100 > 19))
            return "few";
        return "many";
    },
    lv: (n) => {
        if (n % 10 === 1 && n % 100 !== 11)
            return "one";
        if (n === 0 || (n % 100 >= 11 && n % 100 <= 19))
            return "zero";
        return "other";
    },
    // More Slavic
    sl: (n) => {
        const mod100 = n % 100;
        if (mod100 === 1)
            return "one";
        if (mod100 === 2)
            return "two";
        if (mod100 === 3 || mod100 === 4)
            return "few";
        return "other";
    },
    // Other Edge Cases
    br: (n) => {
        if (n === 1)
            return "one";
        if (n === 2)
            return "two";
        if (n === 3)
            return "few";
        if (n === 4)
            return "many";
        return "other";
    },
    mt: (n) => {
        if (n === 1)
            return "one";
        if (n === 0 || (n % 100 >= 2 && n % 100 <= 10))
            return "few";
        if (n % 100 >= 11 && n % 100 <= 19)
            return "many";
        return "other";
    },
};
exports.ORDINAL_RULES = {
    en: (n) => {
        const mod10 = n % 10;
        const mod100 = n % 100;
        if (mod10 === 1 && mod100 !== 11)
            return "one";
        if (mod10 === 2 && mod100 !== 12)
            return "two";
        if (mod10 === 3 && mod100 !== 13)
            return "few";
        return "other";
    },
    es: (n) => "other",
    ar: (n) => "other",
};
function getPluralForm(language, count) {
    if (typeof count !== "number" || !isFinite(count)) {
        count = 0;
    }
    const langCode = (language === null || language === void 0 ? void 0 : language.split("-")[0]) || "en";
    const rule = exports.PLURAL_RULES[langCode];
    if (!rule)
        return "other";
    return rule(Math.abs(Math.floor(count)));
}
function getOrdinalForm(language, count) {
    const langCode = (language === null || language === void 0 ? void 0 : language.split("-")[0]) || "en";
    const rule = exports.ORDINAL_RULES[langCode];
    if (!rule)
        return "other";
    return rule(Math.abs(Math.floor(count)));
}
