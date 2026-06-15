const fs = require("fs");
const path = require("path");

const content = fs.readFileSync("C:/Users/HP/.gemini/antigravity/scratch/yuvakshar/src/store/CmsContext.tsx", "utf8");
const lines = content.split("\n");

console.log("Searching for hasRole in CmsContext.tsx...");
let found = false;
let count = 0;
lines.forEach((line, idx) => {
  if (line.includes("hasRole") && (line.includes("const") || line.includes("function") || line.includes("=>"))) {
    found = true;
    console.log(`Found hasRole definition at line ${idx + 1}`);
  }
  if (found && count < 30) {
    console.log(`${idx + 1}: ${line}`);
    count++;
  }
});
