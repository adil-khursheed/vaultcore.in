const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");

// Copy manifest.json to dist/
fs.copyFileSync(
  path.join(rootDir, "manifest.json"),
  path.join(rootDir, "dist", "manifest.json")
);

console.log("Copied manifest.json to dist/");
