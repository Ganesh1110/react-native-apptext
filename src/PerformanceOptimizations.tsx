/**
 * Performance optimizations for translation system
 *
 * Features:
 * - Memoization of translations
 * - LRU cache for expensive operations
 * - Debounced updates
 * - Virtual scrolling support
 * - Memory leak prevention
 */

/**
 * LRU (Least Recently Used) Cache implementation
 */
export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }

    // Move to end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  set(key: K, value: V): void {
    // Delete if exists to update position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Add to end
    this.cache.set(key, value);

    // Remove oldest if over limit
    if (this.cache.size > this.maxSize) {
      this.evictOldestEntry();
    }
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  private evictOldestEntry(): void {
    const firstKey = this.cache.keys().next().value;
    if (firstKey !== undefined) {
      this.cache.delete(firstKey);
    }
  }

  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // Would need to track hits/misses
    };
  }
}

/**
 * Translation cache with LRU eviction
 */
export class TranslationCache {
  private cache: LRUCache<string, string>;
  private hits = 0;
  private misses = 0;

  constructor(maxSize: number = 1000) {
    this.cache = new LRUCache(maxSize);
  }

  get(
    key: string,
    locale: string,
    params?: Record<string, any>
  ): string | undefined {
    const cacheKey = this.buildKey(key, locale, params);
    const value = this.cache.get(cacheKey);

    if (value !== undefined) {
      this.hits++;
    } else {
      this.misses++;
    }

    return value;
  }

  set(
    key: string,
    locale: string,
    params: Record<string, any> | undefined,
    value: string
  ): void {
    const cacheKey = this.buildKey(key, locale, params);
    this.cache.set(cacheKey, value);
  }

  private buildKey(
    key: string,
    locale: string,
    params?: Record<string, any>
  ): string {
    const paramStr = params ? JSON.stringify(params) : "";
    return `${locale}:${key}:${paramStr}`;
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  getStats() {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      maxSize: (this.cache as any).maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0,
    };
  }
}

/**
 * Debounce helper for batching updates
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle helper for rate-limiting
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Memoization decorator for expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  maxSize: number = 100
): T {
  const cache = new LRUCache<string, ReturnType<T>>(maxSize);

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Batch processor for multiple translation requests
 */
export class TranslationBatcher {
  private queue: Array<{
    key: string;
    params?: Record<string, any>;
    resolve: (value: string) => void;
  }> = [];
  private timeout: NodeJS.Timeout | null = null;
  private batchSize = 50;
  private delay = 10; // ms

  constructor(
    private processor: (
      batch: Array<{ key: string; params?: Record<string, any> }>
    ) => Promise<string[]>
  ) {}

  add(key: string, params?: Record<string, any>): Promise<string> {
    return new Promise((resolve) => {
      this.queue.push({ key, params, resolve });

      if (this.queue.length >= this.batchSize) {
        this.flush();
      } else if (!this.timeout) {
        this.timeout = setTimeout(() => this.flush(), this.delay);
      }
    });
  }

  private async flush(): Promise<void> {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (this.queue.length === 0) {
      return;
    }

    const batch = this.queue.splice(0, this.batchSize);

    try {
      const results = await this.processor(
        batch.map(({ key, params }) => ({ key, params }))
      );

      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      console.error("Batch processing failed:", error);
      batch.forEach((item) => {
        item.resolve(item.key); // Fallback to key
      });
    }
  }
}

/**
 * Memory leak prevention utilities
 */
export class MemoryManager {
  private static timers = new Set<NodeJS.Timeout>();
  private static listeners = new Map<any, Set<() => void>>();

  static registerTimer(timer: NodeJS.Timeout): void {
    this.timers.add(timer);
  }

  static clearTimer(timer: NodeJS.Timeout): void {
    clearTimeout(timer);
    this.timers.delete(timer);
  }

  static registerListener(target: any, cleanup: () => void): void {
    if (!this.listeners.has(target)) {
      this.listeners.set(target, new Set());
    }
    this.listeners.get(target)!.add(cleanup);
  }

  static cleanupListeners(target: any): void {
    const cleanups = this.listeners.get(target);
    if (cleanups) {
      cleanups.forEach((cleanup) => cleanup());
      this.listeners.delete(target);
    }
  }

  static clearAll(): void {
    // Clear all timers
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();

    // Clear all listeners
    this.listeners.forEach((cleanups) => {
      cleanups.forEach((cleanup) => cleanup());
    });
    this.listeners.clear();
  }

  static getStats() {
    return {
      activeTimers: this.timers.size,
      registeredListeners: this.listeners.size,
    };
  }
}

/**
 * Virtual list helper for large translation lists
 */
export interface VirtualListItem {
  key: string;
  height: number;
}

export class VirtualListHelper {
  private itemHeights = new Map<string, number>();
  private defaultHeight: number;

  constructor(defaultHeight: number = 50) {
    this.defaultHeight = defaultHeight;
  }

  getItemHeight(key: string): number {
    return this.itemHeights.get(key) || this.defaultHeight;
  }

  setItemHeight(key: string, height: number): void {
    this.itemHeights.set(key, height);
  }

  getVisibleRange(
    scrollOffset: number,
    viewportHeight: number,
    items: VirtualListItem[]
  ): { startIndex: number; endIndex: number; offsetY: number } {
    let currentOffset = 0;
    let startIndex = 0;
    let endIndex = 0;
    let offsetY = 0;

    // Find start index
    for (let i = 0; i < items.length; i++) {
      const height = this.getItemHeight(items[i].key);

      if (currentOffset + height > scrollOffset) {
        startIndex = i;
        offsetY = currentOffset;
        break;
      }

      currentOffset += height;
    }

    // Find end index
    currentOffset = offsetY;
    for (let i = startIndex; i < items.length; i++) {
      const height = this.getItemHeight(items[i].key);
      currentOffset += height;

      if (currentOffset > scrollOffset + viewportHeight) {
        endIndex = i;
        break;
      }
    }

    if (endIndex === 0) {
      endIndex = items.length - 1;
    }

    return { startIndex, endIndex, offsetY };
  }

  getTotalHeight(items: VirtualListItem[]): number {
    return items.reduce((sum, item) => sum + this.getItemHeight(item.key), 0);
  }
}

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  private measurements = new Map<string, number[]>();

  measure(name: string, fn: () => void): void {
    const start = performance.now();
    fn();
    const duration = performance.now() - start;

    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    this.measurements.get(name)!.push(duration);
  }

  async measureAsync(name: string, fn: () => Promise<void>): Promise<void> {
    const start = performance.now();
    await fn();
    const duration = performance.now() - start;

    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    this.measurements.get(name)!.push(duration);
  }

  getStats(name: string) {
    const measurements = this.measurements.get(name) || [];
    if (measurements.length === 0) {
      return null;
    }

    const sorted = [...measurements].sort((a, b) => a - b);
    const sum = measurements.reduce((a, b) => a + b, 0);

    return {
      count: measurements.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean: sum / measurements.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  getAllStats() {
    const stats: Record<string, any> = {};
    for (const [name] of this.measurements) {
      stats[name] = this.getStats(name);
    }
    return stats;
  }

  clear(name?: string): void {
    if (name) {
      this.measurements.delete(name);
    } else {
      this.measurements.clear();
    }
  }
}

// Singleton instances - using the exact names from your export
export const translationCache = new TranslationCache(1000);
export const performanceMonitor = new PerformanceMonitor();
