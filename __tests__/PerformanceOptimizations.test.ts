import { 
  performanceMonitor, 
  MemoryManager,
  LRUCache
} from "../src/PerformanceOptimizations";

describe("Performance Optimizations Utility", () => {
  describe("PerformanceMonitor", () => {
    it("should measure operations", () => {
      performanceMonitor.measure("test-op", () => {
        // Simulate operation
        for (let i = 0; i < 1000; i++) {}
      });
      const stats = performanceMonitor.getStats("test-op");
      expect(stats).toBeDefined();
      expect(stats?.count).toBe(1);
    });

    it("should clear stats", () => {
      performanceMonitor.measure("to-clear", () => {});
      performanceMonitor.clear("to-clear");
      expect(performanceMonitor.getStats("to-clear")).toBeNull();
    });

    it("should return null for non-existent stats", () => {
      expect(performanceMonitor.getStats("not-started")).toBeNull();
    });
  });

  describe("MemoryManager", () => {
    it("should register and clear timers", () => {
      const timer = setTimeout(() => {}, 1000);
      MemoryManager.registerTimer(timer);
      expect(MemoryManager.getStats().activeTimers).toBe(1);
      
      MemoryManager.clearTimer(timer);
      expect(MemoryManager.getStats().activeTimers).toBe(0);
    });

    it("should register and cleanup listeners", () => {
      const target = {};
      const cleanup = jest.fn();
      
      MemoryManager.registerListener(target, cleanup);
      expect(MemoryManager.getStats().registeredListeners).toBe(1);
      
      MemoryManager.cleanupListeners(target);
      expect(cleanup).toHaveBeenCalled();
      expect(MemoryManager.getStats().registeredListeners).toBe(0);
    });

    it("should clear all", () => {
      MemoryManager.registerTimer(setTimeout(() => {}, 1000));
      MemoryManager.registerListener({}, () => {});
      
      MemoryManager.clearAll();
      expect(MemoryManager.getStats().activeTimers).toBe(0);
      expect(MemoryManager.getStats().registeredListeners).toBe(0);
    });
  });

  describe("LRUCache", () => {
    it("should store and retrieve values", () => {
      const cache = new LRUCache<string, string>(2);
      cache.set("a", "val-a");
      expect(cache.get("a")).toBe("val-a");
    });

    it("should evict least recently used item", () => {
      const cache = new LRUCache<string, string>(2);
      cache.set("a", "val-a");
      cache.set("b", "val-b");
      cache.set("c", "val-c"); // Should evict "a"
      expect(cache.has("a")).toBe(false);
      expect(cache.has("b")).toBe(true);
      expect(cache.has("c")).toBe(true);
    });

    it("should update usage on get", () => {
      const cache = new LRUCache<string, string>(2);
      cache.set("a", "val-a");
      cache.set("b", "val-b");
      cache.get("a"); // "a" is now most recent
      cache.set("c", "val-c"); // Should evict "b"
      expect(cache.has("b")).toBe(false);
      expect(cache.has("a")).toBe(true);
    });
  });
});
