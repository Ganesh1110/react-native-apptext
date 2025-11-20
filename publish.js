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
// 3️⃣ Generate package size badge
// -------------------------------
console.log("Generating package size badge...");
const output = execSync("npm pack --dry-run 2>&1", { encoding: "utf-8" });

// Match package size instead of unpacked size
const match = output.match(/npm notice package size:\s*([\d.]+\s\wB)/i);
const size = match ? match[1] : "N/A";

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="150" height="20">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <mask id="a">
    <rect width="150" height="20" rx="3" fill="#fff"/>
  </mask>
  <g mask="url(#a)">
    <rect width="90" height="20" fill="#555"/>
    <rect x="90" width="60" height="20" fill="#4c1"/>
    <rect width="150" height="20" fill="url(#b)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="45" y="14">install</text>
    <text x="120" y="14">${size}</text>
  </g>
</svg>
`;

const outputDir = path.join(__dirname, "docs");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
fs.writeFileSync(path.join(outputDir, "install-size.svg"), svg);

console.log(`Package size: ${size}`);
console.log("Badge generated: docs/install-size.svg");

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
