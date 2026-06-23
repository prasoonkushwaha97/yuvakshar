const fs = require('fs');
const path = require('path');

const actionsDir = path.join(__dirname, 'src', 'lib', 'actions');
const files = fs.readdirSync(actionsDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  const fullPath = path.join(actionsDir, file);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Revert all maybeSingle() back to single() for now
  content = content.replace(/\.maybeSingle\(\)/g, '.single()');
  
  fs.writeFileSync(fullPath, content, 'utf8');
}

console.log('Reverted maybeSingle back to single.');
