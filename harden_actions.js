const fs = require('fs');
const path = require('path');

const actionsDir = path.join(__dirname, 'src', 'lib', 'actions');
const files = fs.readdirSync(actionsDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  const fullPath = path.join(actionsDir, file);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  const original = content;
  // Replace .single() with .maybeSingle()
  content = content.replace(/\.single\(\)/g, '.maybeSingle()');
  
  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Hardened database queries in:', file);
  }
}
