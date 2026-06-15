const fs = require("fs");
const path = require("path");

const content = fs.readFileSync("C:/Users/HP/.gemini/antigravity/scratch/yuvakshar/src/lib/rbacService.ts", "utf8");
const lines = content.split("\n");
console.log("Lines 130 to 200 in rbacService.ts:");
for (let i = 129; i < Math.min(199, lines.length); i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
