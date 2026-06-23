const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace unsafe .map with ?.map for array variables
      // Regex: match word character or ] or ) followed by .map(
      // but not if it's already ?.map(
      const original = content;
      content = content.replace(/(\w+|\]|\))\.map\(/g, '$1?.map(');
      
      // Also fix cases where `articles.map` -> `articles?.map`
      // Wait, the regex above handles `articles.map(` -> `articles?.map(`.
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Hardened maps in:', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, 'src', 'app'));
processDir(path.join(__dirname, 'src', 'components'));
