const fs = require("fs");
const path = require("path");

const content = fs.readFileSync("C:/Users/HP/.gemini/antigravity/scratch/yuvakshar/src/store/CmsContext.tsx", "utf8");
const lines = content.split("\n");
console.log("Lines 720 to 790 in CmsContext.tsx:");
for (let i = 719; i < Math.min(789, lines.length); i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
