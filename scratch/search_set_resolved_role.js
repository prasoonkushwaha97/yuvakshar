const fs = require("fs");
const path = require("path");

const content = fs.readFileSync("C:/Users/HP/.gemini/antigravity/scratch/yuvakshar/src/store/CmsContext.tsx", "utf8");
const lines = content.split("\n");

console.log("Searching for setResolvedRole in CmsContext.tsx...");
lines.forEach((line, idx) => {
  if (line.includes("setResolvedRole")) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
