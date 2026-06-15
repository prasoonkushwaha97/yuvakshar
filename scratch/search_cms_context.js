const fs = require('fs');
const path = require('path');

const filePath = 'C:/Users/HP/.gemini/antigravity/scratch/yuvakshar/src/store/CmsContext.tsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log("=== ANNOUNCEMENTS ===");
lines.forEach((line, index) => {
  if (line.toLowerCase().includes('announcement')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});

console.log("\n=== BOOKMARKS ===");
lines.forEach((line, index) => {
  if (line.toLowerCase().includes('bookmark')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
