/**
 * AppText Plugin Registry
 *
 * A module-level singleton that allows third-party code to extend AppText
 * without modifying core files. Plugins are registered once at app startup
 * and apply to all AppText renders.
 *
 * Design constraints:
 *  - All transforms must be **pure + synchronous** (no async, no side effects)
 *  - Transforms run in ascending `order` (lower = earlier)
 *  - Registering a plugin with the same `name` replaces the previous one
 *  - Memo-safe: transform functions are called on already-extracted text strings,
 *    never on React nodes — so results are stable across re-renders for the same input
 *
 * Usage:
 * ```ts
 * import { registerAppTextPlugin } from 'react-native-apptext';
 *
 * registerAppTextPlugin({
 *   name: 'emoji-shortcodes',
 *   order: 10,
 *   transform: (text) => text.replace(/:smile:/g, '😊'),
 * });
 * ```
 */

import type { AppTextTheme, TypographyVariant } from "./types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Context provided to plugin transforms at render time */
export interface PluginTransformContext {
  /** Typography variant of the current AppText component */
  variant: TypographyVariant;
  /** Active locale code (e.g. "en", "ar") */
  locale: string;
  /** Whether the layout is currently RTL */
  isRTL: boolean;
  /** Whether the color scheme is dark */
  isDark: boolean;
}

/** Minimal animation definition for plugin-injected animations */
export interface PluginAnimationDefinition {
  /** A unique string key that AppText animation prop can reference */
  type: string;
  /** A factory that returns Animated.CompositeAnimation given standard animation values */
  create: (values: {
    opacity: any;
    translateY: any;
    translateX: any;
    scale: any;
  }) => any;
  /** Style getter that maps to the animated values */
  style: (values: {
    opacity: any;
    translateY: any;
    translateX: any;
    scale: any;
  }) => object;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface AppTextPlugin {
  /** Unique plugin identifier. Re-registering with the same name replaces the plugin. */
  name: string;
  /**
   * Execution priority. Lower values execute earlier in the pipeline.
   * Default: 100. Built-in transforms always run at order 0.
   */
  order?: number;
  /**
   * Pure synchronous text transform. Receives the extracted string and returns
   * a transformed string. Must be deterministic for the same inputs.
   *
   * ⚠ Do NOT perform async work, access global state, or trigger side effects here.
   */
  transform?: (text: string, ctx: PluginTransformContext) => string;
  /**
   * Custom animation definitions. Keys must be unique and will be usable
   * as `animation={{ type: 'yourKey' }}` on any AppText.
   */
  animations?: Record<string, PluginAnimationDefinition>;
  /**
   * Deep-partial theme tokens to merge into the active theme.
   * Applied after the user's own `<AppTextProvider theme={...}>` tokens.
   */
  themeExtension?: DeepPartial<AppTextTheme>;
  /** Called synchronously when the plugin is registered. */
  onMount?: () => void;
  /** Called synchronously when the plugin is unregistered. */
  onUnmount?: () => void;
}

export interface PluginRegisterOptions {
  /** Overrides `plugin.order`. Lower = runs earlier.  Default: 100. */
  order?: number;
}

// ---------------------------------------------------------------------------
// Registry (singleton)
// ---------------------------------------------------------------------------

interface RegistryEntry {
  plugin: AppTextPlugin;
  order: number;
}

class AppTextPluginRegistry {
  private _map: Map<string, RegistryEntry> = new Map();
  private _sorted: AppTextPlugin[] = [];
  private _dirty: boolean = false;

  // ---- Public API ----------------------------------------------------------

  /** Register (or replace) a plugin. Calls `plugin.onMount()` on success. */
  register(plugin: AppTextPlugin, opts?: PluginRegisterOptions): void {
    if (!plugin.name || typeof plugin.name !== "string") {
      if (__DEV__) {
        console.warn("[AppTextPlugin] Plugin must have a non-empty string `name`.");
      }
      return;
    }

    const order = opts?.order ?? plugin.order ?? 100;

    // Unmount existing plugin with same name if present
    const existing = this._map.get(plugin.name);
    if (existing?.plugin.onUnmount) {
      existing.plugin.onUnmount();
    }

    this._map.set(plugin.name, { plugin, order });
    this._dirty = true;
    plugin.onMount?.();

    if (__DEV__) {
      console.log(`[AppTextPlugin] Registered: "${plugin.name}" (order: ${order})`);
    }
  }

  /** Unregister a plugin by name. Calls `plugin.onUnmount()` if present. */
  unregister(name: string): void {
    const entry = this._map.get(name);
    if (!entry) {
      if (__DEV__) {
        console.warn(`[AppTextPlugin] unregister: no plugin named "${name}"`);
      }
      return;
    }
    entry.plugin.onUnmount?.();
    this._map.delete(name);
    this._dirty = true;
  }

  /** Returns a snapshot of all registered plugins in execution order. */
  getAll(): ReadonlyArray<AppTextPlugin> {
    this._ensureSorted();
    return this._sorted;
  }

  /** Returns true if a plugin with `name` is currently registered. */
  has(name: string): boolean {
    return this._map.has(name);
  }

  // ---- Internal helpers (used by AppText core) ----------------------------

  /**
   * Applies all registered transforms in order.
   * Returns the original string if no transforms are registered (zero allocation).
   */
  applyTransforms(text: string, ctx: PluginTransformContext): string {
    this._ensureSorted();
    if (this._sorted.length === 0) return text;

    let result = text;
    for (const plugin of this._sorted) {
      if (plugin.transform) {
        try {
          result = plugin.transform(result, ctx);
        } catch (err) {
          if (__DEV__) {
            console.error(
              `[AppTextPlugin] Transform error in plugin "${plugin.name}":`,
              err,
            );
          }
          // Continue pipeline — a single bad plugin should not crash the app
        }
      }
    }
    return result;
  }

  /** Collects all custom animation definitions from registered plugins. */
  getAnimations(): Record<string, PluginAnimationDefinition> {
    this._ensureSorted();
    const result: Record<string, PluginAnimationDefinition> = {};
    for (const plugin of this._sorted) {
      if (plugin.animations) {
        Object.assign(result, plugin.animations);
      }
    }
    return result;
  }

  /** Collects all theme extension patches (in order) from registered plugins. */
  getThemeExtensions(): ReadonlyArray<DeepPartial<AppTextTheme>> {
    this._ensureSorted();
    return this._sorted
      .filter((p) => p.themeExtension != null)
      .map((p) => p.themeExtension!);
  }

  // ---- Private -------------------------------------------------------------

  private _ensureSorted(): void {
    if (!this._dirty) return;
    this._sorted = Array.from(this._map.values())
      .sort((a, b) => a.order - b.order)
      .map((e) => e.plugin);
    this._dirty = false;
  }
}

// ---------------------------------------------------------------------------
// Singleton export
// ---------------------------------------------------------------------------

/** The global plugin registry instance. */
export const pluginRegistry = new AppTextPluginRegistry();

/**
 * Register an AppText plugin.
 *
 * ```ts
 * registerAppTextPlugin({
 *   name: 'emoji-shortcodes',
 *   order: 10,
 *   transform: (text) => text.replace(/:smile:/g, '😊'),
 * });
 * ```
 */
export const registerAppTextPlugin = (
  plugin: AppTextPlugin,
  opts?: PluginRegisterOptions,
): void => pluginRegistry.register(plugin, opts);

/**
 * Unregister a plugin by name.
 *
 * ```ts
 * unregisterAppTextPlugin('emoji-shortcodes');
 * ```
 */
export const unregisterAppTextPlugin = (name: string): void =>
  pluginRegistry.unregister(name);

/**
 * Returns all registered plugins in execution order.
 */
export const getRegisteredPlugins = (): ReadonlyArray<AppTextPlugin> =>
  pluginRegistry.getAll();
