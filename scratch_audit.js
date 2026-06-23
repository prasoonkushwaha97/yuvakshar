const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');
const issues = [];

function search(currentDir) {
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const fullPath = path.join(currentDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      search(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      if (content.includes('No homepage sections configured')) {
        issues.push({ type: 'CMS_MESSAGE', file: fullPath, msg: 'No homepage sections configured' });
      }
      if (content.includes('Please configure') || content.match(/CMS/i) && content.match(/missing|configured/i)) {
        issues.push({ type: 'CMS_MESSAGE_DEV', file: fullPath });
      }
      if (content.includes('throw new Error') || content.includes('throw error')) {
        issues.push({ type: 'POTENTIAL_CRASH', file: fullPath });
      }
      if (content.includes('.map(') && !content.includes('?.')) {
        // Find potential missing optional chaining
        issues.push({ type: 'UNSAFE_MAP', file: fullPath });
      }
    }
  }
}

search(dir);
fs.writeFileSync('audit_results.json', JSON.stringify(issues, null, 2));
console.log(`Found ${issues.length} potential issues.`);
