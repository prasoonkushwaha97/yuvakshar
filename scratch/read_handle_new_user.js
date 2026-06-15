const fs = require("fs");
const path = require("path");

const content = fs.readFileSync("C:/Users/HP/.gemini/antigravity/scratch/yuvakshar/supabase_schema.sql", "utf8");
const lines = content.split("\n");
console.log("Lines 260 to 295 in supabase_schema.sql:");
for (let i = 259; i < Math.min(294, lines.length); i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
