const fs = require('fs');
let content = fs.readFileSync('src/store/CmsContext.tsx', 'utf8');

content = content.replace(/username: username,\n\s*username: username,/g, 'username: username,');
content = content.replace(/email: user\.email,/g, 'email: user.email || "",');
fs.writeFileSync('src/store/CmsContext.tsx', content);
console.log('Fixed CmsContext');
