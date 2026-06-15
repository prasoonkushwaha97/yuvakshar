const fs = require("fs");
const path = require("path");

const rootDir = "C:/Users/HP/.gemini/antigravity/scratch/yuvakshar/src";
const results = [];

function search(dir) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== ".next" && file !== ".git") {
        search(full);
      }
    } else if (stat.isFile() && /\.(tsx|ts|jsx|js)$/.test(file)) {
      const content = fs.readFileSync(full, "utf8");
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        if (line.toLowerCase().includes("prasoonkushwaha")) {
          results.push({
            file: path.relative(rootDir, full),
            lineNum: idx + 1,
            content: line.trim()
          });
        }
      });
    }
  }
}

search(rootDir);
console.log(JSON.stringify(results, null, 2));
