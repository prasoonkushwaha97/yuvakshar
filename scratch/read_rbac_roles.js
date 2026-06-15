const fs = require("fs");
const path = require("path");

const content = fs.readFileSync("C:/Users/HP/.gemini/antigravity/scratch/yuvakshar/src/lib/rbacService.ts", "utf8");
const lines = content.split("\n");
console.log("Searching for getCurrentUserRoles in rbacService.ts...");
let found = false;
let count = 0;
lines.forEach((line, idx) => {
  if (line.includes("getCurrentUserRoles")) {
    found = true;
    console.log(`Found getCurrentUserRoles at line ${idx + 1}`);
  }
  if (found && count < 60) {
    console.log(`${idx + 1}: ${line}`);
    count++;
  }
});
