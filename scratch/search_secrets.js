const fs = require("fs");
const path = require("path");

const rootDir = "C:/Users/HP/.gemini/antigravity/scratch/yuvakshar";
const terms = ["DATABASE_URL", "SERVICE_ROLE", "service_role", "POSTGRES_", "DB_"];

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
    } else if (stat.isFile() && (file.includes("env") || file.includes("config") || file.includes("setup"))) {
      const content = fs.readFileSync(full, "utf8");
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        const found = terms.some(t => line.includes(t));
        if (found) {
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
