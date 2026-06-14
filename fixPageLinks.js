const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');
content = content.replace(/href="\/dashboard"/g, 'href="/profile"');
fs.writeFileSync('src/app/page.tsx', content);
console.log('Replaced /dashboard with /profile in page.tsx');
