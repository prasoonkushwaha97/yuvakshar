const fs = require('fs');
let file1 = 'src/app/authors/[slug]/page.tsx';
let file2 = 'src/lib/repositoryService.ts';

function injectUsername(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/name:\s*([^,\n]+),\n\s*slug:/g, "name: ,\n  username: \"user_\" + Date.now(),\n  slug:");
  content = content.replace(/name:\s*u\.name,\n\s*email:\s*u\.email,/g, "name: u.name,\n          username: u.username || 'user', \n          email: u.email,");
  fs.writeFileSync(filePath, content);
}

injectUsername(file1);
injectUsername(file2);
console.log('Fixed authors and repositoryService');
