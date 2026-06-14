const fs = require('fs');

function addUsernameToProfiles(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Add username to object literals that have id, name, email
  content = content.replace(/name:\s*([^,]+),\s*email:\s*([^,]+),/g, "name: $1, username: $2.split('@')[0].replace(/['\"]/g, ''), email: $2,");
  fs.writeFileSync(filePath, content);
  console.log('Updated ' + filePath);
}

addUsernameToProfiles('src/app/admin/page.tsx');
addUsernameToProfiles('src/store/CmsContext.tsx');
addUsernameToProfiles('src/lib/repositoryService.ts');
addUsernameToProfiles('src/app/authors/[slug]/page.tsx');
