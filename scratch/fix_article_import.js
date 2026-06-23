const fs = require('fs');
let content = fs.readFileSync('src/store/CmsContext.tsx', 'utf-8');

content = content.replace('export type { Article };', 'import { Article } from "./types";\nexport type { Article };');

fs.writeFileSync('src/store/CmsContext.tsx', content);
console.log('Fixed Article import');
