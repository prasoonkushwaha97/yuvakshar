const fs = require('fs');
let content = fs.readFileSync('recovered_page.txt', 'utf8');

// Try parsing as JSON to unescape if it's double-serialized
try {
  // If it's a JSON string, let's wrap it in quotes if needed
  if (!content.trim().startsWith('"')) {
    content = '"' + content.trim() + '"';
  }
  content = JSON.parse(content);
} catch (e) {
  // Fallback string replacement if JSON parse fails
  content = content
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\');
}

// Remove any leading/trailing quotes that might have survived
content = content.replace(/^"/, '').replace(/"$/, '');

fs.writeFileSync('src/app/page.tsx', content);
console.log("Clean code written to src/app/page.tsx successfully!");
