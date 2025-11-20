const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Capture both stdout and stderr
const output = execSync("npm pack --dry-run 2>&1", { encoding: "utf-8" });

// Match package size (case-insensitive)
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
