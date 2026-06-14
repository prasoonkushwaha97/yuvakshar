const fs = require('fs');
const content = fs.readFileSync('src/app/admin/page.tsx', 'utf8');

let newContent = content.replace(/\{\/\* TAB: STUDY PROGRESS \*\/\}[\s\S]*?(?=\{\/\* TAB: PROFILE \*\/\}|\{\/\* TAB: AI ECOSYSTEM \*\/\}|\{\/\* TAB:)/g, '');
newContent = newContent.replace(/\{\/\* TAB: PROFILE \*\/\}[\s\S]*?(?=\{\/\* TAB: AI ECOSYSTEM \*\/\}|\{\/\* TAB:)/g, '');
newContent = newContent.replace(/\{\/\* TAB: SETTINGS \*\/\}[\s\S]*?(?=\{\/\* TAB: QUIZ MANAGEMENT \*\/\}|\{\/\* TAB:)/g, '');

fs.writeFileSync('src/app/admin/page.tsx', newContent);
console.log('Tabs removed');
