#!/usr/bin/env node
/**
 * AppText CLI — Translation Validator
 *
 * Finds missing keys (used in code but absent in locale files) and
 * dead keys (present in locale files but never used in code).
 *
 * Usage:
 *   npx apptext validate --src ./src --translations ./locales
 *
 * Exit codes:
 *   0  — no missing keys
 *   1  — missing keys found (or dead keys in --strict mode)
 */
import * as fs from "fs";
import * as path from "path";
// @ts-ignore
import * as glob from "glob";
// @ts-ignore
import * as yaml from "js-yaml";
import { TranslationExtractor } from "./extract";
// ---------------------------------------------------------------------------
// Key flattening helpers
// ---------------------------------------------------------------------------
function flattenKeys(obj, prefix = "") {
    const keys = [];
    for (const [k, v] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${k}` : k;
        if (v !== null && typeof v === "object" && !Array.isArray(v)) {
            keys.push(...flattenKeys(v, fullKey));
        }
        else {
            keys.push(fullKey);
        }
    }
    return keys;
}
function loadLocaleFile(filePath) {
    const content = fs.readFileSync(filePath, "utf-8");
    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".yaml" || ext === ".yml") {
        return yaml.load(content) || {};
    }
    return JSON.parse(content);
}
// ---------------------------------------------------------------------------
// Validator
// ---------------------------------------------------------------------------
class TranslationValidator {
    constructor(opts) {
        this.options = {
            src: opts.src || ["./src"],
            translations: opts.translations || "./locales",
            format: opts.format || "table",
            strict: opts.strict || false,
            verbose: opts.verbose || false,
            extensions: opts.extensions || [".ts", ".tsx", ".js", ".jsx"],
            ignore: opts.ignore || ["**/node_modules/**", "**/dist/**", "**/*.test.*"],
            namespace: opts.namespace || "default",
        };
    }
    async validate() {
        console.log("\n🔍 AppText Translation Validator\n");
        // Step 1: Extract code keys
        console.log("📂 Extracting translation keys from source...");
        const extractor = new TranslationExtractor({
            src: this.options.src,
            extensions: this.options.extensions,
            ignore: this.options.ignore,
            verbose: this.options.verbose,
            output: "/dev/null",
            format: "json",
        });
        // Access internal key map via extraction
        const codeKeys = await this._extractCodeKeys();
        console.log(`   Found ${codeKeys.size} unique keys in code\n`);
        // Step 2: Load locale files
        const localeFiles = this._findLocaleFiles();
        if (localeFiles.length === 0) {
            console.error(`❌ No locale files found in: ${this.options.translations}`);
            process.exit(1);
        }
        console.log(`📁 Found ${localeFiles.length} locale file(s)\n`);
        // Step 3: Validate each locale
        const results = [];
        for (const localeFile of localeFiles) {
            const result = this._validateLocale(localeFile, codeKeys);
            results.push(result);
        }
        // Step 4: Build report
        const totalMissing = results.reduce((s, r) => s + r.missingKeys.length, 0);
        const totalDead = results.reduce((s, r) => s + r.deadKeys.length, 0);
        const avgCoverage = results.reduce((s, r) => s + r.coverage, 0) / (results.length || 1);
        const passed = totalMissing === 0 && (this.options.strict ? totalDead === 0 : true);
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                localesChecked: results.length,
                totalMissing,
                totalDead,
                overallCoverage: Math.round(avgCoverage * 10) / 10,
                passed,
            },
            results,
        };
        // Step 5: Output
        if (this.options.format === "json") {
            console.log(JSON.stringify(report, null, 2));
        }
        else {
            this._printTable(report);
        }
        return report;
    }
    // ---- Private helpers -------------------------------------------------------
    async _extractCodeKeys() {
        // Lightweight re-implementation using the extractor's internals
        // We run a custom extraction to get the raw key map
        const keys = new Map();
        const files = this._findSourceFiles();
        for (const file of files) {
            try {
                const { parse } = require("@babel/parser");
                const traverse = require("@babel/traverse").default;
                const content = fs.readFileSync(file, "utf-8");
                const ast = parse(content, {
                    sourceType: "module",
                    plugins: ["jsx", "typescript"],
                    errorRecovery: true,
                });
                traverse(ast, {
                    CallExpression: (nodePath) => {
                        var _a, _b, _c;
                        const { node } = nodePath;
                        const calleeName = node.callee.name || ((_a = node.callee.property) === null || _a === void 0 ? void 0 : _a.name);
                        if (calleeName === "t" || calleeName === "tn") {
                            const keyArg = node.arguments[0];
                            if ((keyArg === null || keyArg === void 0 ? void 0 : keyArg.type) === "StringLiteral") {
                                const k = keyArg.value;
                                const existing = keys.get(k) || [];
                                existing.push({
                                    key: k,
                                    file: path.relative(process.cwd(), file),
                                    line: ((_b = node.loc) === null || _b === void 0 ? void 0 : _b.start.line) || 0,
                                    column: ((_c = node.loc) === null || _c === void 0 ? void 0 : _c.start.column) || 0,
                                    count: calleeName === "tn",
                                });
                                keys.set(k, existing);
                            }
                        }
                    },
                    JSXOpeningElement: (nodePath) => {
                        var _a, _b, _c, _d;
                        const name = (_a = nodePath.node.name) === null || _a === void 0 ? void 0 : _a.name;
                        if (name === "Trans" || name === "MarkdownTrans") {
                            const attr = (_b = nodePath.node.attributes) === null || _b === void 0 ? void 0 : _b.find((a) => { var _a; return ((_a = a.name) === null || _a === void 0 ? void 0 : _a.name) === "i18nKey"; });
                            if (((_c = attr === null || attr === void 0 ? void 0 : attr.value) === null || _c === void 0 ? void 0 : _c.type) === "StringLiteral") {
                                const k = attr.value.value;
                                const existing = keys.get(k) || [];
                                existing.push({
                                    key: k,
                                    file: path.relative(process.cwd(), file),
                                    line: ((_d = nodePath.node.loc) === null || _d === void 0 ? void 0 : _d.start.line) || 0,
                                    column: 0,
                                });
                                keys.set(k, existing);
                            }
                        }
                    },
                });
            }
            catch (e) {
                if (this.options.verbose) {
                    console.warn(`  ⚠ Could not parse: ${path.relative(process.cwd(), file)}`);
                }
            }
        }
        return keys;
    }
    _findSourceFiles() {
        const all = [];
        for (const src of this.options.src) {
            const pattern = `${src}/**/*{${this.options.extensions.join(",")}}`;
            all.push(...glob.sync(pattern, {
                ignore: this.options.ignore,
                absolute: true,
            }));
        }
        return [...new Set(all)];
    }
    _findLocaleFiles() {
        if (!fs.existsSync(this.options.translations))
            return [];
        return glob.sync(`${this.options.translations}/**/*.{json,yaml,yml}`, { absolute: true });
    }
    _validateLocale(filePath, codeKeys) {
        const locale = path
            .basename(filePath, path.extname(filePath))
            .toLowerCase();
        let localeData = {};
        try {
            localeData = loadLocaleFile(filePath);
        }
        catch (_a) {
            console.error(`  ❌ Could not parse locale file: ${filePath}`);
        }
        const localeKeys = new Set(flattenKeys(localeData));
        const codeKeySet = new Set(codeKeys.keys());
        // Missing: in code but NOT in locale
        const missingKeys = [...codeKeySet].filter((k) => !localeKeys.has(k));
        // Dead: in locale but NOT in code
        const deadKeys = [...localeKeys].filter((k) => !codeKeySet.has(k));
        const coverage = codeKeySet.size > 0
            ? ((codeKeySet.size - missingKeys.length) / codeKeySet.size) * 100
            : 100;
        return {
            locale,
            file: path.relative(process.cwd(), filePath),
            missingKeys,
            deadKeys,
            totalCodeKeys: codeKeySet.size,
            totalLocaleKeys: localeKeys.size,
            coverage: Math.round(coverage * 10) / 10,
        };
    }
    _printTable(report) {
        const { summary, results } = report;
        console.log("─".repeat(60));
        for (const r of results) {
            const status = r.missingKeys.length === 0 ? "✅" : "❌";
            console.log(`\n${status} ${r.locale.toUpperCase()} (${r.file})`);
            console.log(`   Coverage: ${r.coverage}% | Keys: ${r.totalLocaleKeys}/${r.totalCodeKeys}`);
            if (r.missingKeys.length > 0) {
                console.log(`\n   🔴 Missing keys (${r.missingKeys.length}):`);
                r.missingKeys.forEach((k) => console.log(`      • ${k}`));
            }
            if (r.deadKeys.length > 0 && this.options.strict) {
                console.log(`\n   🟡 Dead keys (${r.deadKeys.length}):`);
                r.deadKeys.forEach((k) => console.log(`      • ${k}`));
            }
            else if (r.deadKeys.length > 0) {
                console.log(`\n   🟡 Dead keys: ${r.deadKeys.length} (run with --strict to error on these)`);
            }
        }
        console.log("\n" + "─".repeat(60));
        console.log("\n📊 Report Summary:");
        console.log(`   Locales checked : ${summary.localesChecked}`);
        console.log(`   Overall coverage: ${summary.overallCoverage}%`);
        console.log(`   Missing keys    : ${summary.totalMissing}`);
        console.log(`   Dead keys       : ${summary.totalDead}`);
        console.log(`\n   Result: ${summary.passed ? "✅ PASSED" : "❌ FAILED"}\n`);
    }
}
// ---------------------------------------------------------------------------
// CLI interface
// ---------------------------------------------------------------------------
function parseValidateArgs() {
    const args = process.argv.slice(3); // skip 'node', scriptPath, 'validate'
    const opts = {};
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const next = args[i + 1];
        switch (arg) {
            case "--src":
            case "-s":
                opts.src = next.split(",");
                i++;
                break;
            case "--translations":
            case "-t":
                opts.translations = next;
                i++;
                break;
            case "--format":
            case "-f":
                opts.format = next;
                i++;
                break;
            case "--strict":
                opts.strict = true;
                break;
            case "--verbose":
            case "-v":
                opts.verbose = true;
                break;
        }
    }
    return opts;
}
function printValidateHelp() {
    console.log(`
AppText Translation Validator

Usage:
  npx apptext validate [options]

Options:
  -s, --src <paths>          Source directories (comma-separated). Default: ./src
  -t, --translations <dir>   Translations directory.               Default: ./locales
  -f, --format <type>        Output: table (default) | json
      --strict               Exit 1 for dead keys too (not just missing)
  -v, --verbose              Show each file scanned

Exit codes:
  0  No missing keys (or dead keys in --strict mode)
  1  Validation failed

Examples:
  npx apptext validate
  npx apptext validate --src ./src --translations ./locales
  npx apptext validate --strict --format json > report.json
  `);
}
export async function runValidate() {
    if (process.argv.includes("--help") || process.argv.includes("-h")) {
        printValidateHelp();
        process.exit(0);
    }
    const opts = parseValidateArgs();
    const validator = new TranslationValidator(opts);
    try {
        const report = await validator.validate();
        process.exit(report.summary.passed ? 0 : 1);
    }
    catch (err) {
        console.error("❌ Validation error:", err instanceof Error ? err.message : err);
        process.exit(1);
    }
}
if (require.main === module) {
    runValidate();
}
export { TranslationValidator };
