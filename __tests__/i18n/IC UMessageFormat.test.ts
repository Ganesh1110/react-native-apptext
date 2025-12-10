import { ICUMessageFormat } from "../../src/LangCore";

describe("ICUMessageFormat", () => {
  describe("Variable Interpolation", () => {
    it("should replace simple variables", () => {
      const result = ICUMessageFormat.format(
        "Hello {name}",
        { name: "John" },
        "en"
      );
      expect(result).toBe("Hello John");
    });

    it("should handle multiple variables", () => {
      const result = ICUMessageFormat.format(
        "{greeting}, {name}! You have {count} messages.",
        { greeting: "Hi", name: "Alice", count: 5 },
        "en"
      );
      expect(result).toBe("Hi, Alice! You have 5 messages.");
    });

    it("should handle missing variables", () => {
      const result = ICUMessageFormat.format("Hello {name}", {}, "en");
      expect(result).toBe("Hello {name}");
    });
  });

  describe("Plural Forms", () => {
    it("should handle English plural (one/other)", () => {
      const message = "{count, plural, one {# item} other {# items}}";

      expect(ICUMessageFormat.format(message, { count: 0 }, "en")).toBe(
        "0 items"
      );
      expect(ICUMessageFormat.format(message, { count: 1 }, "en")).toBe(
        "1 item"
      );
      expect(ICUMessageFormat.format(message, { count: 5 }, "en")).toBe(
        "5 items"
      );
    });

    it("should handle exact matches (=0, =1)", () => {
      const message =
        "{count, plural, =0 {No items} =1 {One item} other {# items}}";

      expect(ICUMessageFormat.format(message, { count: 0 }, "en")).toBe(
        "No items"
      );
      expect(ICUMessageFormat.format(message, { count: 1 }, "en")).toBe(
        "One item"
      );
      expect(ICUMessageFormat.format(message, { count: 3 }, "en")).toBe(
        "3 items"
      );
    });
  });

  describe("Select (Conditional)", () => {
    it("should handle select statements", () => {
      const message = "{gender, select, male {He} female {She} other {They}}";

      expect(ICUMessageFormat.format(message, { gender: "male" }, "en")).toBe(
        "He"
      );
      expect(ICUMessageFormat.format(message, { gender: "female" }, "en")).toBe(
        "She"
      );
      expect(ICUMessageFormat.format(message, { gender: "other" }, "en")).toBe(
        "They"
      );
    });
  });

  describe("Number Formatting", () => {
    it("should format numbers with default locale", () => {
      const result = ICUMessageFormat.formatNumber(1234.56, undefined, "en");
      expect(result).toBe("1,234.56");
    });
  });

  describe("Currency Detection", () => {
    it("should detect USD for English", () => {
      const currency = ICUMessageFormat.getCurrencyForLanguage("en");
      expect(currency.code).toBe("USD");
    });

    it("should detect EUR for German", () => {
      const currency = ICUMessageFormat.getCurrencyForLanguage("de");
      expect(currency.code).toBe("EUR");
    });
  });
});
