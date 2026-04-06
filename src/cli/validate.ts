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
import { TranslationExtractor, TranslationKey } from "./extract";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ValidateOptions {
  src: string[];
  translations: string;
  format: "table" | "json";
  strict: boolean;
  verbose: boolean;
  extensions: string[];
  ignore: string[];
  namespace: string;
}

interface ValidationResult {
  locale: string;
  file: string;
  missingKeys: string[];
  deadKeys: string[];
  totalCodeKeys: number;
  totalLocaleKeys: number;
  coverage: number; // 0–100
}

interface ValidationReport {
  timestamp: string;
  summary: {
    localesChecked: number;
    totalMissing: number;
    totalDead: number;
    overallCoverage: number;
    passed: boolean;
  };
  results: ValidationResult[];
}

// ---------------------------------------------------------------------------
// Key flattening helpers
// ---------------------------------------------------------------------------

function flattenKeys(
  obj: Record<string, any>,
  prefix: string = "",
): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...flattenKeys(v, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function loadLocaleFile(filePath: string): Record<string, any> {
  const content = fs.readFileSync(filePath, "utf-8");
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".yaml" || ext === ".yml") {
    return (yaml.load(content) as Record<string, any>) || {};
  }
  return JSON.parse(content);
}

// ---------------------------------------------------------------------------
// Validator
// ---------------------------------------------------------------------------

class TranslationValidator {
  private options: ValidateOptions;

  constructor(opts: Partial<ValidateOptions>) {
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

  async validate(): Promise<ValidationReport> {
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
    const results: ValidationResult[] = [];
    for (const localeFile of localeFiles) {
      const result = this._validateLocale(localeFile, codeKeys);
      results.push(result);
    }

    // Step 4: Build report
    const totalMissing = results.reduce((s, r) => s + r.missingKeys.length, 0);
    const totalDead = results.reduce((s, r) => s + r.deadKeys.length, 0);
    const avgCoverage =
      results.reduce((s, r) => s + r.coverage, 0) / (results.length || 1);

    const passed =
      totalMissing === 0 && (this.options.strict ? totalDead === 0 : true);

    const report: ValidationReport = {
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
    } else {
      this._printTable(report);
    }

    return report;
  }

  // ---- Private helpers -------------------------------------------------------

  private async _extractCodeKeys(): Promise<Map<string, TranslationKey[]>> {
    // Lightweight re-implementation using the extractor's internals
    // We run a custom extraction to get the raw key map
    const keys = new Map<string, TranslationKey[]>();
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
          CallExpression: (nodePath: any) => {
            const { node } = nodePath;
            const calleeName =
              node.callee.name || node.callee.property?.name;
            if (calleeName === "t" || calleeName === "tn") {
              const keyArg = node.arguments[0];
              if (keyArg?.type === "StringLiteral") {
                const k = keyArg.value;
                const existing = keys.get(k) || [];
                existing.push({
                  key: k,
                  file: path.relative(process.cwd(), file),
                  line: node.loc?.start.line || 0,
                  column: node.loc?.start.column || 0,
                  count: calleeName === "tn",
                });
                keys.set(k, existing);
              }
            }
          },
          JSXOpeningElement: (nodePath: any) => {
            const name = nodePath.node.name?.name;
            if (name === "Trans" || name === "MarkdownTrans") {
              const attr = nodePath.node.attributes?.find(
                (a: any) => a.name?.name === "i18nKey",
              );
              if (attr?.value?.type === "StringLiteral") {
                const k = attr.value.value;
                const existing = keys.get(k) || [];
                existing.push({
                  key: k,
                  file: path.relative(process.cwd(), file),
                  line: nodePath.node.loc?.start.line || 0,
                  column: 0,
                });
                keys.set(k, existing);
              }
            }
          },
        });
      } catch (e) {
        if (this.options.verbose) {
          console.warn(`  ⚠ Could not parse: ${path.relative(process.cwd(), file)}`);
        }
      }
    }

    return keys;
  }

  private _findSourceFiles(): string[] {
    const all: string[] = [];
    for (const src of this.options.src) {
      const pattern = `${src}/**/*{${this.options.extensions.join(",")}}`;
      all.push(
        ...(glob.sync(pattern, {
          ignore: this.options.ignore,
          absolute: true,
        }) as string[]),
      );
    }
    return [...new Set(all)];
  }

  private _findLocaleFiles(): string[] {
    if (!fs.existsSync(this.options.translations)) return [];
    return glob.sync(
      `${this.options.translations}/**/*.{json,yaml,yml}`,
      { absolute: true },
    ) as string[];
  }

  private _validateLocale(
    filePath: string,
    codeKeys: Map<string, TranslationKey[]>,
  ): ValidationResult {
    const locale = path
      .basename(filePath, path.extname(filePath))
      .toLowerCase();

    let localeData: Record<string, any> = {};
    try {
      localeData = loadLocaleFile(filePath);
    } catch {
      console.error(`  ❌ Could not parse locale file: ${filePath}`);
    }

    const localeKeys = new Set(flattenKeys(localeData));
    const codeKeySet = new Set(codeKeys.keys());

    // Missing: in code but NOT in locale
    const missingKeys = [...codeKeySet].filter((k) => !localeKeys.has(k));

    // Dead: in locale but NOT in code
    const deadKeys = [...localeKeys].filter((k) => !codeKeySet.has(k));

    const coverage =
      codeKeySet.size > 0
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

  private _printTable(report: ValidationReport): void {
    const { summary, results } = report;

    console.log("─".repeat(60));

    for (const r of results) {
      const status = r.missingKeys.length === 0 ? "✅" : "❌";
      console.log(
        `\n${status} ${r.locale.toUpperCase()} (${r.file})`,
      );
      console.log(
        `   Coverage: ${r.coverage}% | Keys: ${r.totalLocaleKeys}/${r.totalCodeKeys}`,
      );

      if (r.missingKeys.length > 0) {
        console.log(`\n   🔴 Missing keys (${r.missingKeys.length}):`);
        r.missingKeys.forEach((k) => console.log(`      • ${k}`));
      }

      if (r.deadKeys.length > 0 && this.options.strict) {
        console.log(`\n   🟡 Dead keys (${r.deadKeys.length}):`);
        r.deadKeys.forEach((k) => console.log(`      • ${k}`));
      } else if (r.deadKeys.length > 0) {
        console.log(
          `\n   🟡 Dead keys: ${r.deadKeys.length} (run with --strict to error on these)`,
        );
      }
    }

    console.log("\n" + "─".repeat(60));
    console.log("\n📊 Report Summary:");
    console.log(
      `   Locales checked : ${summary.localesChecked}`,
    );
    console.log(
      `   Overall coverage: ${summary.overallCoverage}%`,
    );
    console.log(
      `   Missing keys    : ${summary.totalMissing}`,
    );
    console.log(
      `   Dead keys       : ${summary.totalDead}`,
    );
    console.log(
      `\n   Result: ${summary.passed ? "✅ PASSED" : "❌ FAILED"}\n`,
    );
  }
}

// ---------------------------------------------------------------------------
// CLI interface
// ---------------------------------------------------------------------------

function parseValidateArgs(): Partial<ValidateOptions> {
  const args = process.argv.slice(3); // skip 'node', scriptPath, 'validate'
  const opts: Partial<ValidateOptions> = {};

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
        opts.format = next as "table" | "json";
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

function printValidateHelp(): void {
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

export async function runValidate(): Promise<void> {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    printValidateHelp();
    process.exit(0);
  }

  const opts = parseValidateArgs();
  const validator = new TranslationValidator(opts);

  try {
    const report = await validator.validate();
    process.exit(report.summary.passed ? 0 : 1);
  } catch (err) {
    console.error("❌ Validation error:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

if (require.main === module) {
  runValidate();
}

export { TranslationValidator, ValidateOptions, ValidationReport, ValidationResult };
