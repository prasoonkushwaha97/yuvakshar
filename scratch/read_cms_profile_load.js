const fs = require("fs");
const path = require("path");

const content = fs.readFileSync("C:/Users/HP/.gemini/antigravity/scratch/yuvakshar/src/store/CmsContext.tsx", "utf8");
const lines = content.split("\n");
console.log("Lines 680 to 735 in CmsContext.tsx:");
for (let i = 679; i < Math.min(734, lines.length); i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
