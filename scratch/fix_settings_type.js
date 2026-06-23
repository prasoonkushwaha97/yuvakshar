const fs = require('fs');
let content = fs.readFileSync('src/store/CmsContext.tsx', 'utf-8');
content = content.replace('useState(initialSettings || {', 'useState<any>(initialSettings || {');
fs.writeFileSync('src/store/CmsContext.tsx', content);
console.log('Fixed useState type for settings');
