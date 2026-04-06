/**
 * RemoteLocaleProvider — Server-Driven Translation Sync
 *
 * Fetches translations from a remote endpoint and serves them into
 * AppText's existing LocaleProvider. Supports three caching strategies:
 *
 *   'stale-while-revalidate'  Serve cached immediately, refresh in background
 *   'cache-first'             Use cache if still fresh, else fetch
 *   'network-first'           Always try network, fall back to cache on error
 *
 * Design constraints:
 *  - Never blocks initial render (always renders children immediately)
 *  - In-memory cache by default; pluggable storage adapter for persistence
 *  - No AsyncStorage / no native dependency required
 *  - Falls back to `fallback` translations on network error or first load
 *
 * Usage:
 * ```tsx
 * <RemoteLocaleProvider
 *   endpoint="https://api.example.com/translations"
 *   cacheStrategy="stale-while-revalidate"
 *   cacheTTL={5 * 60 * 1000}
 *   fallback={{ en: { welcome: 'Welcome' }, fr: { welcome: 'Bienvenue' } }}
 *   onFetchError={(err) => Sentry.captureException(err)}
 * >
 *   <App />
 * </RemoteLocaleProvider>
 * ```
 */

import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RemoteCacheStrategy =
  | "stale-while-revalidate"
  | "cache-first"
  | "network-first";

export type RemoteTranslations = Record<string, Record<string, any>>;

/**
 * Optional persistence adapter. Implement this interface to persist the cache
 * across app restarts (e.g. with AsyncStorage, MMKV, or SecureStore).
 */
export interface RemoteStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export type RemoteLocaleStatus =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "stale";

export interface RemoteLocaleContextValue {
  /** Translations currently in use (may be from cache or network) */
  translations: RemoteTranslations;
  /** Fetch/cache status */
  status: RemoteLocaleStatus;
  /** Timestamp of the last successful network fetch (ms) */
  lastUpdated: number | null;
  /** Manually trigger a network refresh */
  refresh: () => void;
  /** Non-null when status === 'error' */
  error: Error | null;
}

export interface RemoteLocaleProviderProps {
  /** Remote endpoint that returns `{ en: {...}, fr: {...}, ... }` */
  endpoint: string;
  /** Cache strategy. Default: 'stale-while-revalidate' */
  cacheStrategy?: RemoteCacheStrategy;
  /** Cache Time-To-Live in ms. Default: 5 minutes */
  cacheTTL?: number;
  /** Translations used before the first fetch completes (or on error) */
  fallback?: RemoteTranslations;
  /** HTTP headers to include in fetch requests */
  headers?: Record<string, string>;
  /** Called when a fetch fails */
  onFetchError?: (err: Error) => void;
  /** Optional persistence adapter (AsyncStorage, MMKV, etc.) */
  storageAdapter?: RemoteStorageAdapter;
  /**
   * How to render children while translations are loading.
   * Default: render children immediately with fallback/cached translations.
   */
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// In-memory cache (module-level singleton)
// ---------------------------------------------------------------------------

interface CacheEntry {
  translations: RemoteTranslations;
  fetchedAt: number;
}

const _memoryCache = new Map<string, CacheEntry>();

const STORAGE_KEY_PREFIX = "apptext_remote_";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const RemoteLocaleContext = createContext<RemoteLocaleContextValue>({
  translations: {},
  status: "idle",
  lastUpdated: null,
  refresh: () => {},
  error: null,
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const RemoteLocaleProvider = memo<RemoteLocaleProviderProps>(
  ({
    endpoint,
    cacheStrategy = "stale-while-revalidate",
    cacheTTL = 5 * 60 * 1000,
    fallback = {},
    headers,
    onFetchError,
    storageAdapter,
    children,
  }) => {
    const isMountedRef = useRef(true);

    const [status, setStatus] = useState<RemoteLocaleStatus>("idle");
    const [translations, setTranslations] = useState<RemoteTranslations>(
      () => _memoryCache.get(endpoint)?.translations ?? fallback,
    );
    const [lastUpdated, setLastUpdated] = useState<number | null>(
      () => _memoryCache.get(endpoint)?.fetchedAt ?? null,
    );
    const [error, setError] = useState<Error | null>(null);

    // ---- Helpers ---------------------------------------------------------

    const isCacheFresh = useCallback(
      (entry: CacheEntry): boolean => Date.now() - entry.fetchedAt < cacheTTL,
      [cacheTTL],
    );

    const loadFromStorage = useCallback(async (): Promise<CacheEntry | null> => {
      if (!storageAdapter) return null;
      try {
        const raw = await storageAdapter.getItem(STORAGE_KEY_PREFIX + endpoint);
        if (!raw) return null;
        return JSON.parse(raw) as CacheEntry;
      } catch {
        return null;
      }
    }, [endpoint, storageAdapter]);

    const saveToStorage = useCallback(
      async (entry: CacheEntry): Promise<void> => {
        if (!storageAdapter) return;
        try {
          await storageAdapter.setItem(
            STORAGE_KEY_PREFIX + endpoint,
            JSON.stringify(entry),
          );
        } catch (e) {
          if (__DEV__) console.warn("[RemoteLocaleProvider] Storage write failed:", e);
        }
      },
      [endpoint, storageAdapter],
    );

    const doFetch = useCallback(async (): Promise<void> => {
      if (!isMountedRef.current) return;
      try {
        const res = await fetch(endpoint, {
          method: "GET",
          headers: { "Content-Type": "application/json", ...headers },
        });

        if (!res.ok) {
          throw new Error(
            `[RemoteLocaleProvider] HTTP ${res.status} from ${endpoint}`,
          );
        }

        const data: RemoteTranslations = await res.json();

        if (!isMountedRef.current) return;

        const entry: CacheEntry = { translations: data, fetchedAt: Date.now() };
        _memoryCache.set(endpoint, entry);
        await saveToStorage(entry);

        setTranslations(data);
        setLastUpdated(entry.fetchedAt);
        setStatus("success");
        setError(null);
      } catch (err) {
        if (!isMountedRef.current) return;
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        setStatus("error");
        onFetchError?.(e);

        if (__DEV__) {
          console.warn("[RemoteLocaleProvider] Fetch failed:", e.message);
        }
      }
    }, [endpoint, headers, onFetchError, saveToStorage]);

    // ---- Initial load ----------------------------------------------------

    useEffect(() => {
      isMountedRef.current = true;

      const init = async () => {
        // Check memory cache first
        let cached = _memoryCache.get(endpoint);

        // Then check storage adapter if not in memory
        if (!cached && storageAdapter) {
          const stored = await loadFromStorage();
          if (stored) {
            cached = stored;
            _memoryCache.set(endpoint, stored);
            if (isMountedRef.current) {
              setTranslations(stored.translations);
              setLastUpdated(stored.fetchedAt);
            }
          }
        }

        if (!isMountedRef.current) return;

        switch (cacheStrategy) {
          case "stale-while-revalidate": {
            // Serve what we have, always revalidate in background
            if (cached) {
              setStatus("stale");
            } else {
              setStatus("loading");
            }
            doFetch(); // background — never awaited
            break;
          }

          case "cache-first": {
            if (cached && isCacheFresh(cached)) {
              // Cache is fresh — skip network
              setStatus("success");
            } else {
              setStatus("loading");
              await doFetch();
            }
            break;
          }

          case "network-first": {
            setStatus("loading");
            await doFetch();
            // If fetch failed and we have a cached fallback, use it
            if (!isMountedRef.current) return;
            const fresh = _memoryCache.get(endpoint);
            if (!fresh && cached) {
              setTranslations(cached.translations);
              setLastUpdated(cached.fetchedAt);
            }
            break;
          }
        }
      };

      init();

      return () => {
        isMountedRef.current = false;
      };
    }, [endpoint, cacheStrategy, cacheTTL]); // eslint-disable-line

    // ---- Manual refresh --------------------------------------------------

    const refresh = useCallback(() => {
      setStatus("loading");
      doFetch();
    }, [doFetch]);

    // ---- Context value ---------------------------------------------------

    const value = useMemo<RemoteLocaleContextValue>(
      () => ({ translations, status, lastUpdated, refresh, error }),
      [translations, status, lastUpdated, refresh, error],
    );

    return (
      <RemoteLocaleContext.Provider value={value}>
        {children}
      </RemoteLocaleContext.Provider>
    );
  },
);

RemoteLocaleProvider.displayName = "RemoteLocaleProvider";

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Returns the current remote locale state:
 * `{ translations, status, lastUpdated, refresh, error }`
 *
 * Must be used inside `<RemoteLocaleProvider>`.
 */
export function useRemoteLocales(): RemoteLocaleContextValue {
  return useContext(RemoteLocaleContext);
}

/**
 * Programmatically clear the in-memory cache for a given endpoint.
 */
export function clearRemoteLocaleCache(endpoint: string): void {
  _memoryCache.delete(endpoint);
}

/**
 * Programmatically clear ALL remote locale caches.
 */
export function clearAllRemoteLocaleCaches(): void {
  _memoryCache.clear();
}
