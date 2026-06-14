const fs = require('fs');

// CmsContext.tsx
let cms = fs.readFileSync('src/store/CmsContext.tsx', 'utf8');

// Fix 1520
cms = cms.replace(/username: username, username: email\.split\('@'\)\[0\]\.replace\(\/\['\"\]\/g, ''\), email: email,/g, 'username: username, email: email,');

// Fix 1661
cms = cms.replace(/name: user\.name, username: user\.email\.split\('@'\)\[0\]\.replace\(\/\['\"\]\/g, ''\), email: user\.email \|\| \"\",/g, 'name: user.name, username: user.email ? user.email.split(\\'@\\')[0].replace(/[\\'\\"]/g, \\'\\') : \"user\", email: user.email || \"\",');

// Revert 1321 & 2176 (ContactMessage sub)
cms = cms.replace(/name: (s|sub)\.name, username: (s|sub)\.email\.split\('@'\)\[0\]\.replace\(\/\['\"\]\/g, ''\), email: (s|sub)\.email,/g, 'name: .name, email: .email,');

fs.writeFileSync('src/store/CmsContext.tsx', cms);

// repositoryService.ts
let rep = fs.readFileSync('src/lib/repositoryService.ts', 'utf8');
rep = rep.replace(/name: u\.name,[\s\n]*username: u\.username \|\| 'user', [\s\n]*email: u\.email,/g, 'name: u.name, username: u.username || u.email.split("@")[0], email: u.email,');
fs.writeFileSync('src/lib/repositoryService.ts', rep);

console.log('Fixed typescript errors');
