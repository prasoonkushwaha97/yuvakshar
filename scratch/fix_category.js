const fs = require('fs');

let content = fs.readFileSync('src/app/(public)/category/[slug]/page.tsx', 'utf-8');

// replace implicit any in map and slices
content = content.replace(/\{art\.tags\.slice\(0, 2\)\.map\(\(t, idx\)/g, '{(art.tags || []).slice(0, 2).map((t: string, idx: number)');
content = content.replace(/\{art\.tags\.map\(\(t, idx\)/g, '{(art.tags || []).map((t: string, idx: number)');

fs.writeFileSync('src/app/(public)/category/[slug]/page.tsx', content);
console.log('Fixed category page tags mapping!');
