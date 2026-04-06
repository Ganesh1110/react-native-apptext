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
class AppTextPluginRegistry {
    constructor() {
        this._map = new Map();
        this._sorted = [];
        this._dirty = false;
    }
    // ---- Public API ----------------------------------------------------------
    /** Register (or replace) a plugin. Calls `plugin.onMount()` on success. */
    register(plugin, opts) {
        var _a, _b, _c;
        if (!plugin.name || typeof plugin.name !== "string") {
            if (__DEV__) {
                console.warn("[AppTextPlugin] Plugin must have a non-empty string `name`.");
            }
            return;
        }
        const order = (_b = (_a = opts === null || opts === void 0 ? void 0 : opts.order) !== null && _a !== void 0 ? _a : plugin.order) !== null && _b !== void 0 ? _b : 100;
        // Unmount existing plugin with same name if present
        const existing = this._map.get(plugin.name);
        if (existing === null || existing === void 0 ? void 0 : existing.plugin.onUnmount) {
            existing.plugin.onUnmount();
        }
        this._map.set(plugin.name, { plugin, order });
        this._dirty = true;
        (_c = plugin.onMount) === null || _c === void 0 ? void 0 : _c.call(plugin);
        if (__DEV__) {
            console.log(`[AppTextPlugin] Registered: "${plugin.name}" (order: ${order})`);
        }
    }
    /** Unregister a plugin by name. Calls `plugin.onUnmount()` if present. */
    unregister(name) {
        var _a, _b;
        const entry = this._map.get(name);
        if (!entry) {
            if (__DEV__) {
                console.warn(`[AppTextPlugin] unregister: no plugin named "${name}"`);
            }
            return;
        }
        (_b = (_a = entry.plugin).onUnmount) === null || _b === void 0 ? void 0 : _b.call(_a);
        this._map.delete(name);
        this._dirty = true;
    }
    /** Returns a snapshot of all registered plugins in execution order. */
    getAll() {
        this._ensureSorted();
        return this._sorted;
    }
    /** Returns true if a plugin with `name` is currently registered. */
    has(name) {
        return this._map.has(name);
    }
    // ---- Internal helpers (used by AppText core) ----------------------------
    /**
     * Applies all registered transforms in order.
     * Returns the original string if no transforms are registered (zero allocation).
     */
    applyTransforms(text, ctx) {
        this._ensureSorted();
        if (this._sorted.length === 0)
            return text;
        let result = text;
        for (const plugin of this._sorted) {
            if (plugin.transform) {
                try {
                    result = plugin.transform(result, ctx);
                }
                catch (err) {
                    if (__DEV__) {
                        console.error(`[AppTextPlugin] Transform error in plugin "${plugin.name}":`, err);
                    }
                    // Continue pipeline — a single bad plugin should not crash the app
                }
            }
        }
        return result;
    }
    /** Collects all custom animation definitions from registered plugins. */
    getAnimations() {
        this._ensureSorted();
        const result = {};
        for (const plugin of this._sorted) {
            if (plugin.animations) {
                Object.assign(result, plugin.animations);
            }
        }
        return result;
    }
    /** Collects all theme extension patches (in order) from registered plugins. */
    getThemeExtensions() {
        this._ensureSorted();
        return this._sorted
            .filter((p) => p.themeExtension != null)
            .map((p) => p.themeExtension);
    }
    // ---- Private -------------------------------------------------------------
    _ensureSorted() {
        if (!this._dirty)
            return;
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
export const registerAppTextPlugin = (plugin, opts) => pluginRegistry.register(plugin, opts);
/**
 * Unregister a plugin by name.
 *
 * ```ts
 * unregisterAppTextPlugin('emoji-shortcodes');
 * ```
 */
export const unregisterAppTextPlugin = (name) => pluginRegistry.unregister(name);
/**
 * Returns all registered plugins in execution order.
 */
export const getRegisteredPlugins = () => pluginRegistry.getAll();
