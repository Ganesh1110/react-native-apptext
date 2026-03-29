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
  private hits = 0;
  private misses = 0;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      this.misses++;
      return undefined;
    }

    this.hits++;
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
    this.hits = 0;
    this.misses = 0;
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

  getStats(): { size: number; maxSize: number; hitRate: number; hits: number; misses: number } {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: total === 0 ? 0 : Math.round((this.hits / total) * 100) / 100,
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
    if (!params) return `${locale}:${key}`;
    // Simple stable key for params without full stringify
    const paramKey = Object.keys(params)
      .sort()
      .map(k => `${k}:${params[k]}`)
      .join(",");
    return `${locale}:${key}:${paramKey}`;
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
  private timeout: ReturnType<typeof setTimeout> | null = null;
  private batchSize = 50;
  private delay = 10;

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

// Singleton instances
export const translationCache = new TranslationCache(1000);
