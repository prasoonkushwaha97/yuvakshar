const fs = require('fs');

// repositoryService.ts
let rep = fs.readFileSync('src/lib/repositoryService.ts', 'utf8');
rep = rep.replace(/name: u\.name,[\s\n]*username: u\.username \|\| 'user', [\s\n]*email: u\.email,/g, 'name: u.name, username: u.username || (u.email ? u.email.split("@")[0] : "user"), email: u.email,');
fs.writeFileSync('src/lib/repositoryService.ts', rep);

console.log('Fixed repositoryService');
