import { NumberFormatter } from "../../src/NumberFormatter";

describe("NumberFormatter", () => {
  afterEach(() => {
    NumberFormatter.clearCache();
  });

  describe("Basic Number Formatting", () => {
    it("should format numbers with thousand separators", () => {
      const result = NumberFormatter.format(1234.56, "en-US");
      expect(result).toBe("1,234.56");
    });

    it("should format numbers for different locales", () => {
      const resultUS = NumberFormatter.format(1234.56, "en-US");
      const resultDE = NumberFormatter.format(1234.56, "de-DE");

      expect(resultUS).toBe("1,234.56");
      expect(resultDE).toBe("1.234,56");
    });
  });

  describe("Currency Formatting", () => {
    it("should format currency with default options", () => {
      const result = NumberFormatter.formatCurrency(99.99, "en-US", "USD");
      expect(result).toContain("99.99");
      expect(result).toContain("$");
    });

    it("should format different currencies", () => {
      const resultUSD = NumberFormatter.formatCurrency(100, "en-US", "USD");
      const resultEUR = NumberFormatter.formatCurrency(100, "de-DE", "EUR");

      expect(resultUSD).toContain("$");
      expect(resultEUR).toContain("€");
    });
  });

  describe("Percentage Formatting", () => {
    it("should format percentages", () => {
      const result = NumberFormatter.formatPercent(0.856, "en-US");
      expect(result).toContain("85");
      expect(result).toContain("%");
    });

    it("should handle decimal percentages", () => {
      const result = NumberFormatter.formatPercent(0.1234, "en-US");
      expect(result).toContain("12");
    });
  });

  describe("Compact Formatting", () => {
    it("should format large numbers compactly", () => {
      const result = NumberFormatter.formatCompact(1500000, "en-US");
      expect(result).toMatch(/1\.5\s*M/i);
    });

    it("should format thousands compactly", () => {
      const result = NumberFormatter.formatCompact(1500, "en-US");
      expect(result).toMatch(/1\.5\s*K/i);
    });
  });

  describe("Signed Number Formatting", () => {
    it("should always show positive sign", () => {
      const result = NumberFormatter.formatSigned(42, "en-US");
      expect(result).toContain("+");
    });

    it("should show negative sign", () => {
      const result = NumberFormatter.formatSigned(-42, "en-US");
      expect(result).toContain("-");
    });
  });

  describe("Range Formatting", () => {
    it("should format number ranges", () => {
      const result = NumberFormatter.formatRange(10, 20, "en-US");
      expect(result).toMatch(/10.*20/);
    });
  });

  describe("Cache Management", () => {
    it("should cache formatters", () => {
      NumberFormatter.format(1234, "en-US");
      NumberFormatter.format(5678, "en-US"); // Should use cached formatter

      const stats = NumberFormatter.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);
    });

    it("should clear cache", () => {
      NumberFormatter.format(1234, "en-US");
      NumberFormatter.clearCache();

      const stats = NumberFormatter.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it("should respect max cache size", () => {
      // Fill cache beyond max size
      for (let i = 0; i < 150; i++) {
        NumberFormatter.format(i, `en-US`, { minimumFractionDigits: i % 3 });
      }

      const stats = NumberFormatter.getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(stats.maxSize);
    });
  });
});
