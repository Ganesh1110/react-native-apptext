#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// -------------------------------
// Helper to read input
// -------------------------------
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

// -------------------------------
// 1️⃣ Clean dist folder
// -------------------------------
console.log("Cleaning dist folder...");
if (fs.existsSync("dist")) fs.rmSync("dist", { recursive: true, force: true });

// -------------------------------
// 2️⃣ Build the project
// -------------------------------
console.log("Building project...");
execSync("npm run build", { stdio: "inherit" });

// -------------------------------
// 3️⃣ (Removed) Generate package size badge
// -------------------------------
// Entire block removed.

// -------------------------------
// 4️⃣ Check version & bump if needed
// -------------------------------
(async () => {
  const pkgPath = path.join(__dirname, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  const currentVersion = pkg.version;

  // Check if version already exists on npm
  let exists = false;
  try {
    execSync(`npm view ${pkg.name}@${currentVersion}`, { stdio: "ignore" });
    exists = true;
  } catch {}

  if (exists) {
    console.log(`⚠ Version ${currentVersion} already exists on npm!`);
    const answer = await askQuestion(
      "Do you want to bump version? (major/minor/patch): "
    );
    if (!["major", "minor", "patch"].includes(answer)) {
      console.log("❌ Invalid choice. Exiting.");
      process.exit(1);
    }
    console.log(`Bumping ${answer} version...`);
    execSync(`npm version ${answer}`, { stdio: "inherit" });
  }

  // -------------------------------
  // 5️⃣ Publish package
  // -------------------------------
  console.log("Publishing package...");
  try {
    execSync("npm publish", { stdio: "inherit" });
    console.log("✅ Package published successfully!");
  } catch (err) {
    console.error("❌ Publish failed. Check your npm login and version.");
    process.exit(1);
  }
})();
