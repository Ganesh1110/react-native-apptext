#!/usr/bin/env node

/**
 * AppText CLI — Unified dispatcher
 *
 * Usage:
 *   npx apptext extract [options]
 *   npx apptext validate [options]
 *   npx apptext help
 */

const command = process.argv[2];

async function main() {
  switch (command) {
    case "extract": {
      // Re-run the original extract CLI
      // Splice so extract.ts sees its own args starting at index 2
      process.argv.splice(2, 1); // remove 'extract'
      require("./extract");
      break;
    }

    case "validate": {
      const { runValidate } = require("./validate");
      await runValidate();
      break;
    }

    case undefined:
    case "help":
    case "--help":
    case "-h": {
      console.log(`
╔══════════════════════════════════════════╗
║       AppText CLI — react-native-apptext  ║
╚══════════════════════════════════════════╝

Usage:
  npx apptext <command> [options]

Commands:
  extract    Extract translation keys from source files
  validate   Validate translation completeness vs locale files
  help       Show this help

Examples:
  npx apptext extract --src ./src --output ./locales/template.json
  npx apptext validate --src ./src --translations ./locales
  npx apptext validate --strict --format json > ci-report.json

Run \`npx apptext <command> --help\` for command-specific options.
      `);
      process.exit(0);
      break;
    }

    default: {
      console.error(`\n❌ Unknown command: "${command}"`);
      console.error(`   Run \`npx apptext help\` for usage.\n`);
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error("❌ Fatal:", err?.message || err);
  process.exit(1);
});
