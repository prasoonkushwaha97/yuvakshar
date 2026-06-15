const fs = require("fs");
const path = require("path");

const content = fs.readFileSync("C:/Users/HP/.gemini/antigravity/scratch/yuvakshar/src/lib/rbacService.ts", "utf8");
const lines = content.split("\n");
console.log("Top of rbacService.ts:");
for (let i = 0; i < 40; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
