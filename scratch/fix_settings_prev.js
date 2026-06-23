const fs = require('fs');
let content = fs.readFileSync('src/store/CmsContext.tsx', 'utf-8');
content = content.replace(/setSettings\(prev => \(\{/g, 'setSettings((prev: any) => ({');
fs.writeFileSync('src/store/CmsContext.tsx', content);
console.log('Fixed setSettings prev type');
