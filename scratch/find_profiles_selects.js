const fs = require("fs");
const path = require("path");

const rootDir = "C:/Users/HP/.gemini/antigravity/scratch/yuvakshar/src";

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath);
    } else if (stat.isFile() && (file.endsWith(".ts") || file.endsWith(".tsx"))) {
      const content = fs.readFileSync(fullPath, "utf8");
      if (content.includes('.from("profiles")') || content.includes(".from('profiles')")) {
        console.log(`Found reference in: ${fullPath}`);
        const lines = content.split("\n");
        lines.forEach((line, index) => {
          if (line.includes('.from("profiles")') || line.includes(".from('profiles')")) {
            console.log(`Line ${index + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

searchDir(rootDir);
