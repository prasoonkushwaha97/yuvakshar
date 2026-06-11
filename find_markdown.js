const fs = require('fs');
const path = require('path');

const workspaceSrc = 'C:\\Users\\HP\\.gemini\\antigravity\\scratch\\yuvakshar\\src';
console.log('Visiting workspace:', workspaceSrc);

const patterns = [
  /###/g,
  /## /g,
  /# /g,
  /\*\*/g,
  /__/g,
  /```/g
];

const results = [];

function walk(dir) {
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        walk(fullPath);
      } else {
        if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            patterns.forEach(pattern => {
              const matches = content.match(pattern);
              if (matches) {
                results.push(`${file} matches ${pattern.source}: ${matches.length} times`);
              }
            });
          } catch (e) {
            console.error('Error reading file:', fullPath, e.message);
          }
        }
      }
    });
  } catch (e) {
    console.error('Error scanning dir:', dir, e.message);
  }
}

walk(workspaceSrc);
console.log('Total files searched results:', results.length);
console.log(results.slice(0, 40).join('\n'));
