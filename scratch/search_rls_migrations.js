const fs = require("fs");
const path = require("path");

const migrationsDir = "C:/Users/HP/.gemini/antigravity/scratch/yuvakshar/supabase/migrations";
const results = [];

if (fs.existsSync(migrationsDir)) {
  const files = fs.readdirSync(migrationsDir);
  for (const file of files) {
    if (file.endsWith(".sql")) {
      const content = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        if (line.toUpperCase().includes("ROW LEVEL SECURITY") || line.toUpperCase().includes("POLICY")) {
          results.push({
            file,
            lineNum: idx + 1,
            content: line.trim()
          });
        }
      });
    }
  }
}

console.log(JSON.stringify(results, null, 2));
