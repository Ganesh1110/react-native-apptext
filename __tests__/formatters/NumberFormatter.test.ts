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

  describe("Edge Cases — NaN / Infinity", () => {
    it("should return 'NaN' string for NaN input", () => {
      expect(NumberFormatter.format(NaN, "en-US")).toBe("NaN");
    });

    it("should return 'Infinity' string for Infinity input", () => {
      expect(NumberFormatter.format(Infinity, "en-US")).toBe("Infinity");
    });

    it("should return '-Infinity' string for negative Infinity input", () => {
      expect(NumberFormatter.format(-Infinity, "en-US")).toBe("-Infinity");
    });

    it("should format negative numbers correctly", () => {
      const result = NumberFormatter.format(-1234.56, "en-US");
      expect(result).toContain("1,234.56");
      expect(result).toContain("-");
    });

    it("should format zero", () => {
      const result = NumberFormatter.format(0, "en-US");
      expect(result).toMatch(/^0/);
    });
  });

  describe("Fallback when Intl is not available", () => {
    let originalIntl: typeof Intl;

    beforeEach(() => {
      originalIntl = (global as any).Intl;
    });

    afterEach(() => {
      (global as any).Intl = originalIntl;
    });

    it("uses fallback formatter when Intl is undefined", () => {
      (global as any).Intl = undefined;
      // Should not throw — fallback formatter is used
      const result = NumberFormatter.format(42.5, "en-US");
      expect(result).toBeTruthy();
    });

    it("uses currency fallback when Intl is undefined", () => {
      (global as any).Intl = undefined;
      const result = NumberFormatter.formatCurrency(99.99, "en-US", "USD");
      expect(result).toContain("99.99");
    });
  });
});

