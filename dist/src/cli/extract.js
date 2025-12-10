#!/usr/bin/env node
/**
 * React Native AppText - Translation Key Extractor
 *
 * Scans your codebase for t() and tn() calls and generates a translation template
 *
 * Usage:
 *   npx react-native-apptext extract --src ./src --output ./locales/template.json
 */
import * as fs from "fs";
import * as path from "path";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import * as glob from "glob";
class TranslationExtractor {
    constructor(options) {
        this.keys = new Map();
        this.options = {
            src: options.src || ["./src"],
            output: options.output || "./locales/template.json",
            extensions: options.extensions || [".ts", ".tsx", ".js", ".jsx"],
            ignore: options.ignore || [
                "**/node_modules/**",
                "**/dist/**",
                "**/*.test.*",
            ],
            format: options.format || "json",
            verbose: options.verbose || false,
        };
    }
    async extract() {
        console.log("🔍 Scanning for translation keys...\n");
        const files = this.findFiles();
        console.log(`📁 Found ${files.length} files to scan\n`);
        for (const file of files) {
            await this.extractFromFile(file);
        }
        console.log(`\n✅ Extracted ${this.keys.size} unique translation keys`);
        console.log(`📝 Writing to ${this.options.output}...\n`);
        await this.writeOutput();
        this.printSummary();
    }
    findFiles() {
        const allFiles = [];
        for (const srcPath of this.options.src) {
            const pattern = `${srcPath}/**/*{${this.options.extensions.join(",")}}`;
            const files = glob.sync(pattern, {
                ignore: this.options.ignore,
                absolute: true,
            });
            allFiles.push(...files);
        }
        return [...new Set(allFiles)];
    }
    async extractFromFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, "utf-8");
            const ast = parse(content, {
                sourceType: "module",
                plugins: ["jsx", "typescript"],
            });
            traverse(ast, {
                CallExpression: (path) => {
                    this.handleCallExpression(path, filePath);
                },
                JSXElement: (path) => {
                    this.handleJSXElement(path, filePath);
                },
            });
            if (this.options.verbose) {
                console.log(`✓ ${path.relative(process.cwd(), filePath)}`);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Error parsing ${filePath}:`, errorMessage);
        }
    }
    handleCallExpression(path, filePath) {
        var _a, _b;
        const { node } = path;
        // Check for t() calls
        if (node.callee.name === "t" || ((_a = node.callee.property) === null || _a === void 0 ? void 0 : _a.name) === "t") {
            this.extractTranslationCall(node, filePath, false);
        }
        // Check for tn() calls
        if (node.callee.name === "tn" || ((_b = node.callee.property) === null || _b === void 0 ? void 0 : _b.name) === "tn") {
            this.extractTranslationCall(node, filePath, true);
        }
    }
    handleJSXElement(path, filePath) {
        const { node } = path;
        // Check for Trans component
        if (node.openingElement.name.name === "Trans") {
            this.extractTransComponent(node, filePath);
        }
        // Check for MarkdownTrans component
        if (node.openingElement.name.name === "MarkdownTrans") {
            this.extractTransComponent(node, filePath);
        }
    }
    extractTranslationCall(node, filePath, isPlural) {
        if (node.arguments.length === 0)
            return;
        const keyArg = node.arguments[0];
        if (keyArg.type !== "StringLiteral")
            return;
        const key = keyArg.value;
        const params = this.extractParams(node.arguments[1]);
        const options = this.extractOptions(node.arguments[2]);
        this.addKey({
            key,
            file: path.relative(process.cwd(), filePath),
            line: node.loc.start.line,
            column: node.loc.start.column,
            params,
            count: isPlural,
            ...options,
        });
    }
    extractTransComponent(node, filePath) {
        const attributes = node.openingElement.attributes;
        const i18nKeyAttr = attributes.find((attr) => { var _a; return ((_a = attr.name) === null || _a === void 0 ? void 0 : _a.name) === "i18nKey"; });
        if (!i18nKeyAttr || i18nKeyAttr.value.type !== "StringLiteral")
            return;
        const key = i18nKeyAttr.value.value;
        const valuesAttr = attributes.find((attr) => { var _a; return ((_a = attr.name) === null || _a === void 0 ? void 0 : _a.name) === "values"; });
        const optionsAttr = attributes.find((attr) => { var _a; return ((_a = attr.name) === null || _a === void 0 ? void 0 : _a.name) === "options"; });
        const params = valuesAttr ? this.extractJSXParams(valuesAttr) : undefined;
        const options = optionsAttr ? this.extractJSXOptions(optionsAttr) : {};
        this.addKey({
            key,
            file: path.relative(process.cwd(), filePath),
            line: node.loc.start.line,
            column: node.loc.start.column,
            params,
            ...options,
        });
    }
    extractParams(node) {
        if (!node || node.type !== "ObjectExpression")
            return undefined;
        return node.properties
            .map((prop) => { var _a, _b; return ((_a = prop.key) === null || _a === void 0 ? void 0 : _a.name) || ((_b = prop.key) === null || _b === void 0 ? void 0 : _b.value); })
            .filter(Boolean);
    }
    extractOptions(node) {
        var _a, _b;
        if (!node || node.type !== "ObjectExpression")
            return {};
        const options = {};
        for (const prop of node.properties) {
            const keyName = ((_a = prop.key) === null || _a === void 0 ? void 0 : _a.name) || ((_b = prop.key) === null || _b === void 0 ? void 0 : _b.value);
            if (keyName === "namespace" && prop.value.type === "StringLiteral") {
                options.namespace = prop.value.value;
            }
            if (keyName === "context" && prop.value.type === "StringLiteral") {
                options.context = prop.value.value;
            }
            if (keyName === "defaultValue" && prop.value.type === "StringLiteral") {
                options.defaultValue = prop.value.value;
            }
        }
        return options;
    }
    extractJSXParams(attr) {
        // Simplified JSX param extraction
        return undefined;
    }
    extractJSXOptions(attr) {
        // Simplified JSX options extraction
        return {};
    }
    addKey(key) {
        const existing = this.keys.get(key.key) || [];
        existing.push(key);
        this.keys.set(key.key, existing);
    }
    async writeOutput() {
        const outputDir = path.dirname(this.options.output);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const template = this.buildTemplate();
        switch (this.options.format) {
            case "json":
                fs.writeFileSync(this.options.output, JSON.stringify(template, null, 2), "utf-8");
                break;
            case "yaml":
                // Would need yaml library
                throw new Error("YAML format not yet implemented");
            case "csv":
                this.writeCSV(template);
                break;
        }
    }
    buildTemplate() {
        const template = {};
        for (const [key, occurrences] of this.keys.entries()) {
            const first = occurrences[0];
            // Handle nested keys
            const parts = key.split(".");
            let current = template;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) {
                    current[parts[i]] = {};
                }
                current = current[parts[i]];
            }
            const lastPart = parts[parts.length - 1];
            if (first.count) {
                // Plural form
                current[lastPart] = first.defaultValue || {
                    one: `${key} (singular)`,
                    other: `${key} (plural)`,
                };
            }
            else {
                // Simple string
                current[lastPart] = first.defaultValue || key;
            }
        }
        return template;
    }
    writeCSV(template) {
        var _a;
        const rows = [
            ["Key", "Default Value", "Files", "Params"].join(","),
        ];
        for (const [key, occurrences] of this.keys.entries()) {
            const files = occurrences.map((o) => `${o.file}:${o.line}`).join("; ");
            const params = ((_a = occurrences[0].params) === null || _a === void 0 ? void 0 : _a.join(", ")) || "";
            const value = occurrences[0].defaultValue || "";
            rows.push([`"${key}"`, `"${value}"`, `"${files}"`, `"${params}"`].join(","));
        }
        fs.writeFileSync(this.options.output, rows.join("\n"), "utf-8");
    }
    printSummary() {
        console.log("\n📊 Summary:");
        console.log("─".repeat(50));
        // Keys by namespace
        const byNamespace = new Map();
        for (const occurrences of this.keys.values()) {
            const namespace = occurrences[0].namespace || "default";
            byNamespace.set(namespace, (byNamespace.get(namespace) || 0) + 1);
        }
        console.log("\nKeys by namespace:");
        for (const [namespace, count] of byNamespace.entries()) {
            console.log(`  ${namespace}: ${count}`);
        }
        // Plural keys
        const pluralCount = Array.from(this.keys.values()).filter((occurrences) => occurrences[0].count).length;
        console.log(`\nPlural keys: ${pluralCount}`);
        // Keys with params
        const withParamsCount = Array.from(this.keys.values()).filter((occurrences) => occurrences[0].params && occurrences[0].params.length > 0).length;
        console.log(`Keys with params: ${withParamsCount}`);
        // Most used keys
        console.log("\nMost used keys:");
        const sorted = Array.from(this.keys.entries())
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 5);
        for (const [key, occurrences] of sorted) {
            console.log(`  ${key}: ${occurrences.length} occurrences`);
        }
        console.log("\n✨ Done!\n");
    }
}
// CLI Interface
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {};
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const next = args[i + 1];
        switch (arg) {
            case "--src":
            case "-s":
                options.src = next.split(",");
                i++;
                break;
            case "--output":
            case "-o":
                options.output = next;
                i++;
                break;
            case "--format":
            case "-f":
                options.format = next;
                i++;
                break;
            case "--verbose":
            case "-v":
                options.verbose = true;
                break;
            case "--help":
            case "-h":
                printHelp();
                process.exit(0);
        }
    }
    return options;
}
function printHelp() {
    console.log(`
React Native AppText - Translation Key Extractor

Usage:
  npx react-native-apptext extract [options]

Options:
  -s, --src <paths>        Source directories to scan (comma-separated)
                           Default: ./src
  
  -o, --output <file>      Output file path
                           Default: ./locales/template.json
  
  -f, --format <type>      Output format: json, yaml, csv
                           Default: json
  
  -v, --verbose            Print detailed progress
  
  -h, --help               Show this help message

Examples:
  # Extract from src directory
  npx react-native-apptext extract

  # Extract from multiple directories
  npx react-native-apptext extract --src ./src,./components

  # Output as CSV
  npx react-native-apptext extract --format csv --output keys.csv

  # Verbose mode
  npx react-native-apptext extract --verbose
  `);
}
// Main execution
async function main() {
    const options = parseArgs();
    const extractor = new TranslationExtractor(options);
    try {
        await extractor.extract();
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("\n❌ Error:", errorMessage);
        process.exit(1);
    }
}
if (require.main === module) {
    main();
}
export { TranslationExtractor };
