import { 
  getPluralForm, 
  getOrdinalForm,
  PLURAL_RULES,
  ORDINAL_RULES
} from "../../src/i18n/PluralRules";

describe("PluralRules Logic", () => {
  it("should correctly identify plural forms for English", () => {
    expect(getPluralForm("en", 1)).toBe("one");
    expect(getPluralForm("en", 0)).toBe("other");
    expect(getPluralForm("en", 2)).toBe("other");
  });

  it("should correctly identify plural forms for Russian (complex plurals)", () => {
    expect(getPluralForm("ru", 1)).toBe("one");
    expect(getPluralForm("ru", 2)).toBe("few");
    expect(getPluralForm("ru", 5)).toBe("many");
    expect(getPluralForm("ru", 21)).toBe("one");
  });

  it("should correctly identify plural forms for Arabic (very complex plurals)", () => {
    expect(getPluralForm("ar", 0)).toBe("zero");
    expect(getPluralForm("ar", 1)).toBe("one");
    expect(getPluralForm("ar", 2)).toBe("two");
    expect(getPluralForm("ar", 3)).toBe("few");
    expect(getPluralForm("ar", 11)).toBe("many");
    expect(getPluralForm("ar", 100)).toBe("other");
  });

  it("should correctly identify ordinal forms for English", () => {
    expect(getOrdinalForm("en", 1)).toBe("one");
    expect(getOrdinalForm("en", 2)).toBe("two");
    expect(getOrdinalForm("en", 3)).toBe("few");
    expect(getOrdinalForm("en", 4)).toBe("other");
    expect(getOrdinalForm("en", 11)).toBe("other");
  });

  it("should fallback to 'other' for unsupported languages or invalid counts", () => {
    expect(getPluralForm("unknown", 1)).toBe("other");
    expect(getOrdinalForm("unknown", 1)).toBe("other");
  });

  it("should provide access to rules", () => {
    expect(PLURAL_RULES).toBeDefined();
    expect(ORDINAL_RULES).toBeDefined();
  });
});
