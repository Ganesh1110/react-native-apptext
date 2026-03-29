import { LRUCache, TranslationCache } from "../../src/PerformanceOptimizations";

describe("LRUCache", () => {
  describe("Basic Operations", () => {
    it("should store and retrieve values", () => {
      const cache = new LRUCache<string, number>(3);
      cache.set("a", 1);
      cache.set("b", 2);

      expect(cache.get("a")).toBe(1);
      expect(cache.get("b")).toBe(2);
    });

    it("should return undefined for missing keys", () => {
      const cache = new LRUCache<string, number>(3);
      expect(cache.get("missing")).toBeUndefined();
    });

    it("should check if key exists", () => {
      const cache = new LRUCache<string, number>(3);
      cache.set("a", 1);

      expect(cache.has("a")).toBe(true);
      expect(cache.has("b")).toBe(false);
    });
  });

  describe("LRU Eviction", () => {
    it("should evict least recently used item when full", () => {
      const cache = new LRUCache<string, number>(3);
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);
      cache.set("d", 4); // Should evict 'a'

      expect(cache.has("a")).toBe(false);
      expect(cache.has("b")).toBe(true);
      expect(cache.has("c")).toBe(true);
      expect(cache.has("d")).toBe(true);
    });

    it("should update access order on get", () => {
      const cache = new LRUCache<string, number>(3);
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);

      cache.get("a"); // Access 'a' to make it most recent
      cache.set("d", 4); // Should evict 'b' now

      expect(cache.has("a")).toBe(true);
      expect(cache.has("b")).toBe(false);
      expect(cache.has("c")).toBe(true);
      expect(cache.has("d")).toBe(true);
    });
  });

  describe("Cache Management", () => {
    it("should report correct size", () => {
      const cache = new LRUCache<string, number>(5);
      expect(cache.size).toBe(0);

      cache.set("a", 1);
      cache.set("b", 2);
      expect(cache.size).toBe(2);
    });

    it("should clear all entries", () => {
      const cache = new LRUCache<string, number>(5);
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);

      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.has("a")).toBe(false);
    });

    it("should provide statistics", () => {
      const cache = new LRUCache<string, number>(10);
      cache.set("a", 1);
      cache.set("b", 2);

      const stats = cache.getStats();
      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(10);
      expect(stats).toHaveProperty("hitRate");
    });
  });
});

describe("TranslationCache", () => {
  describe("Translation Caching", () => {
    it("should cache translation results", () => {
      const cache = new TranslationCache(10);
      cache.set("welcome", "en", undefined, "Welcome");

      const result = cache.get("welcome", "en", undefined);
      expect(result).toBe("Welcome");
    });

    it("should cache translations with parameters", () => {
      const cache = new TranslationCache(10);
      const params = { name: "John" };
      cache.set("greeting", "en", params, "Hello, John");

      const result = cache.get("greeting", "en", params);
      expect(result).toBe("Hello, John");
    });

    it("should differentiate by locale", () => {
      const cache = new TranslationCache(10);
      cache.set("greeting", "en", undefined, "Hello");
      cache.set("greeting", "es", undefined, "Hola");

      expect(cache.get("greeting", "en", undefined)).toBe("Hello");
      expect(cache.get("greeting", "es", undefined)).toBe("Hola");
    });
  });

  describe("Cache Statistics", () => {
    it("should track hits and misses", () => {
      const cache = new TranslationCache(10);
      cache.set("test", "en", undefined, "Test");

      cache.get("test", "en", undefined); // Hit
      cache.get("missing", "en", undefined); // Miss

      const stats = cache.getStats();
      expect(stats).toMatchObject(
        expect.objectContaining({
          hits: expect.any(Number),
          misses: expect.any(Number),
        })
      );
    });

    it("should calculate hit rate", () => {
      const cache = new TranslationCache(10);
      cache.set("test", "en", undefined, "Test");

      for (let i = 0; i < 9; i++) {
        cache.get("test", "en", undefined); // 9 hits
      }
      cache.get("missing", "en", undefined); // 1 miss

      const stats = cache.getStats();
      expect(stats.hitRate).toBeGreaterThan(80);
    });
  });

  describe("Cache Invalidation", () => {
    it("should clear all cached translations", () => {
      const cache = new TranslationCache(10);
      cache.set("test1", "en", undefined, "Test 1");
      cache.set("test2", "en", undefined, "Test 2");

      cache.clear();

      expect(cache.get("test1", "en", undefined)).toBeUndefined();
      expect(cache.get("test2", "en", undefined)).toBeUndefined();
    });
  });
});
