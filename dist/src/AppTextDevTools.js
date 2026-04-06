/**
 * AppTextDevTools — Developer overlay for react-native-apptext
 *
 * Shows live stats for:
 * - LRU translation cache (hit rate, size)
 * - Performance monitor (p95 latency per key)
 * - Current language / text direction
 * - Active Dimensions listener count (shared singleton)
 *
 * Only renders in __DEV__ mode. Safe to import unconditionally.
 *
 * Usage:
 *   import { AppTextDevTools } from 'react-native-apptext';
 *   // Place anywhere inside AppTextProvider + LocaleProvider
 *   <AppTextDevTools position="bottom-right" />
 */
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { Animated, Platform, Pressable, ScrollView, StyleSheet, Text, View, } from "react-native";
import { translationCache, performanceMonitor } from "./PerformanceOptimizations";
// Only import useLang if in an i18n context — guard with try/catch at call site
let _useLang = null;
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useLang } = require("./LangCore");
    _useLang = useLang;
}
catch (_a) {
    _useLang = null;
}
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getPositionStyle(position) {
    const base = {
        position: "absolute",
        zIndex: 9999,
        maxWidth: 320,
    };
    if (position === "top-left")
        return { ...base, top: 48, left: 8 };
    if (position === "top-right")
        return { ...base, top: 48, right: 8 };
    if (position === "bottom-left")
        return { ...base, bottom: 64, left: 8 };
    return { ...base, bottom: 64, right: 8 };
}
function hitRateColor(rate) {
    if (rate >= 0.9)
        return "#4ade80"; // green
    if (rate >= 0.6)
        return "#fbbf24"; // amber
    return "#f87171"; // red
}
// ---------------------------------------------------------------------------
// Main component (no-op outside __DEV__)
// ---------------------------------------------------------------------------
export const AppTextDevTools = memo(({ position = "bottom-right", refreshInterval = 2000, defaultCollapsed = true, }) => {
    // In production, render nothing
    if (!__DEV__)
        return null;
    return (<DevToolsInner position={position} refreshInterval={refreshInterval} defaultCollapsed={defaultCollapsed}/>);
});
AppTextDevTools.displayName = "AppTextDevTools";
// ---------------------------------------------------------------------------
// Inner component (only mounted in __DEV__)
// ---------------------------------------------------------------------------
const DevToolsInner = memo(({ position, refreshInterval, defaultCollapsed }) => {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);
    const [stats, setStats] = useState(null);
    const opacityAnim = useRef(new Animated.Value(0.92)).current;
    // Try to consume i18n context
    let language = "unknown";
    let direction = "ltr";
    try {
        if (_useLang) {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const ctx = _useLang();
            language = ctx.language;
            direction = ctx.direction;
        }
    }
    catch (_a) {
        // not inside a LocaleProvider — that's fine
    }
    const collectStats = useCallback(() => {
        const cs = translationCache.getStats();
        const allPerf = performanceMonitor.getAllStats();
        // Build top-5 keys by p95
        const topKeys = Object.entries(allPerf)
            .filter(([, v]) => v !== null)
            .map(([name, v]) => {
            var _a, _b;
            return ({
                name: name.replace("translate:", ""),
                p95: Math.round(((_a = v === null || v === void 0 ? void 0 : v.p95) !== null && _a !== void 0 ? _a : 0) * 100) / 100,
                count: (_b = v === null || v === void 0 ? void 0 : v.count) !== null && _b !== void 0 ? _b : 0,
            });
        })
            .sort((a, b) => b.p95 - a.p95)
            .slice(0, 5);
        setStats({
            cacheSize: cs.size,
            cacheHitRate: cs.hitRate / 100,
            cacheHits: cs.hits,
            cacheMisses: cs.misses,
            topKeys,
            language,
            direction,
        });
    }, [language, direction]);
    // Poll on interval
    useEffect(() => {
        collectStats();
        const id = setInterval(collectStats, refreshInterval);
        return () => clearInterval(id);
    }, [collectStats, refreshInterval]);
    // Subtle pulse animation on badge
    useEffect(() => {
        Animated.loop(Animated.sequence([
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0.7,
                duration: 1000,
                useNativeDriver: true,
            }),
        ])).start();
    }, [opacityAnim]);
    const posStyle = getPositionStyle(position);
    return (<View style={[styles.container, posStyle]} pointerEvents="box-none">
        {/* Toggle button */}
        <Pressable style={styles.toggleButton} onPress={() => setCollapsed((c) => !c)} accessibilityLabel="Toggle AppText DevTools">
          <Animated.View style={{ opacity: opacityAnim }}>
            <Text style={styles.toggleIcon}>🔤</Text>
          </Animated.View>
          <Text style={styles.toggleLabel}>AppText</Text>
          {stats && (<View style={[
                styles.hitBadge,
                { backgroundColor: hitRateColor(stats.cacheHitRate) },
            ]}>
              <Text style={styles.hitBadgeText}>
                {Math.round(stats.cacheHitRate * 100)}%
              </Text>
            </View>)}
        </Pressable>

        {/* Expanded panel */}
        {!collapsed && stats && (<View style={styles.panel}>
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
              {/* Language info */}
              <Row label="Language" value={stats.language}/>
              <Row label="Direction" value={stats.direction.toUpperCase()}/>

              <Divider />

              {/* Cache stats */}
              <SectionHeader title="Translation Cache"/>
              <Row label="Hit Rate" value={`${Math.round(stats.cacheHitRate * 100)}%`} valueColor={hitRateColor(stats.cacheHitRate)}/>
              <Row label="Cache Size" value={`${stats.cacheSize} entries`}/>
              <Row label="Hits / Misses" value={`${stats.cacheHits} / ${stats.cacheMisses}`}/>

              {stats.topKeys.length > 0 && (<>
                  <Divider />
                  <SectionHeader title="Slowest Keys (p95)"/>
                  {stats.topKeys.map((k) => (<Row key={k.name} label={k.name.length > 22 ? `…${k.name.slice(-20)}` : k.name} value={`${k.p95}ms (×${k.count})`} valueColor={k.p95 > 5 ? "#f87171" : "#4ade80"}/>))}
                </>)}

              <Divider />
              <Pressable style={styles.clearButton} onPress={() => {
                translationCache.clear();
                performanceMonitor.clear();
                collectStats();
            }}>
                <Text style={styles.clearButtonText}>Clear Cache & Stats</Text>
              </Pressable>
            </ScrollView>
          </View>)}
      </View>);
});
DevToolsInner.displayName = "DevToolsInner";
// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
const Row = memo(({ label, value, valueColor }) => (<View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>));
Row.displayName = "Row";
const SectionHeader = memo(({ title }) => (<Text style={styles.sectionHeader}>{title}</Text>));
SectionHeader.displayName = "SectionHeader";
const Divider = () => <View style={styles.divider}/>;
// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
    container: {
        alignItems: "flex-end",
    },
    toggleButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(15,15,15,0.92)",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 8,
        gap: 4,
    },
    toggleIcon: { fontSize: 14 },
    toggleLabel: {
        color: "#e2e8f0",
        fontSize: 11,
        fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
        fontWeight: "600",
    },
    hitBadge: {
        borderRadius: 8,
        paddingHorizontal: 5,
        paddingVertical: 2,
        marginLeft: 2,
    },
    hitBadgeText: {
        color: "#000",
        fontSize: 9,
        fontWeight: "700",
    },
    panel: {
        marginTop: 6,
        backgroundColor: "rgba(15,15,15,0.95)",
        borderRadius: 10,
        width: 300,
        maxHeight: 360,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 12,
        overflow: "hidden",
    },
    scroll: { padding: 10 },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 3,
    },
    rowLabel: {
        color: "#94a3b8",
        fontSize: 11,
        fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
        flex: 1,
    },
    rowValue: {
        color: "#e2e8f0",
        fontSize: 11,
        fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
        fontWeight: "700",
        textAlign: "right",
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.08)",
        marginVertical: 6,
    },
    sectionHeader: {
        color: "#64748b",
        fontSize: 9,
        fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 4,
    },
    clearButton: {
        backgroundColor: "rgba(239,68,68,0.2)",
        borderRadius: 6,
        padding: 8,
        alignItems: "center",
        marginTop: 4,
        marginBottom: 4,
    },
    clearButtonText: {
        color: "#f87171",
        fontSize: 11,
        fontWeight: "600",
    },
});
