// check-size.js
const fs = require("fs");
const path = require("path");

// Folder to analyze (change to your package folder)
const folderPath = __dirname;

// Function to recursively get all files
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

// Get all files
const allFiles = getAllFiles(folderPath);

// Map files to sizes in KB
const filesWithSizes = allFiles.map((file) => {
  const size = fs.statSync(file).size / 1024; // KB
  return { file, size };
});

// Sort by size descending
filesWithSizes.sort((a, b) => b.size - a.size);

// Print top 20 largest files
console.log("Top 50 largest files:");
filesWithSizes.slice(0, 50).forEach(({ file, size }) => {
  console.log(`${size.toFixed(2)} KB - ${file}`);
});
