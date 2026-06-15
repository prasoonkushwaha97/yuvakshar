const fs = require("fs");
const path = require("path");

const content = fs.readFileSync("C:/Users/HP/.gemini/antigravity/scratch/yuvakshar/supabase_schema.sql", "utf8");
const lines = content.split("\n");

console.log("Searching for triggers/functions in supabase_schema.sql...");
lines.forEach((line, idx) => {
  if (line.includes("CREATE TRIGGER") || line.includes("CREATE FUNCTION") || line.includes("handle_new_user")) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
