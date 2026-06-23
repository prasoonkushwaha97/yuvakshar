const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;

      content = content.replace(/art\.tags\.some\(t =>/g, '(art.tags || []).some((t: string) =>');
      content = content.replace(/art\.tags\.slice\(0, 2\)\.map\(\(t, idx\)/g, '(art.tags || []).slice(0, 2).map((t: string, idx: number)');
      content = content.replace(/art\.tags\.map\(\(t, idx\)/g, '(art.tags || []).map((t: string, idx: number)');
      content = content.replace(/art\.tags\.some\(\(t: string\) =>/g, '(art.tags || []).some((t: string) =>'); // deduplicate if ran twice

      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log("Fixed tags in: " + fullPath);
      }
    }
  }
}

replaceInDir('src/app');
replaceInDir('src/components');
console.log('Done fixing implicit anys for tags!');
