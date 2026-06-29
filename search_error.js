const fs = require('fs');
const path = require('path');

function search(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      search(p);
    } else if (p.endsWith('.ts') || p.endsWith('.tsx')) {
      const c = fs.readFileSync(p, 'utf8');
      if (c.includes('No homepage sections configured')) {
        console.log('FOUND IN: ' + p);
      }
    }
  }
}

console.log('Searching...');
search(path.join(__dirname, 'src'));
console.log('Done.');
