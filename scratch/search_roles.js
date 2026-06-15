const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const files = walk(srcDir);
const matches = [];

const patterns = [
  /hasRole\s*\(\s*['"`]Founder['"`]\s*\)/i,
  /hasAnyRole/i,
  /role\s*===\s*['"`]Founder['"`]/i,
  /role\s*===\s*['"`]founder['"`]/i
];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    let matched = false;
    patterns.forEach(p => {
      if (p.test(line)) {
        matched = true;
      }
    });
    if (matched) {
      matches.push({
        file: path.relative(path.join(__dirname, '..'), file),
        line: idx + 1,
        content: line.trim()
      });
    }
  });
});

console.log(JSON.stringify(matches, null, 2));
