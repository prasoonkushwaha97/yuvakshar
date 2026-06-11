import fs from 'fs';
import path from 'path';

const replacements = [
  // Backgrounds
  { from: /bg-slate-50\s+dark:bg-\[\#0F172A\]\/40/g, to: 'bg-card' },
  { from: /bg-slate-50\/50\s+dark:bg-\[\#0F172A\]\/20/g, to: 'bg-card' },
  { from: /bg-slate-50\s+dark:bg-\[\#0A0F1D\]/g, to: 'bg-background' },
  { from: /bg-white\s+dark:bg-\[\#0F172A\]/g, to: 'bg-card' },
  { from: /bg-white\s+dark:bg-\[\#0A0F1D\]/g, to: 'bg-card' },
  { from: /bg-slate-50\s+dark:bg-slate-900/g, to: 'bg-muted' },
  { from: /bg-white\s+dark:bg-slate-900/g, to: 'bg-background' },
  { from: /bg-white\s+dark:bg-slate-950/g, to: 'bg-background' },
  { from: /bg-slate-900\s+border\s+border-slate-800/g, to: 'bg-background border border-border' },
  
  // Borders
  { from: /border-slate-200\s+dark:border-slate-800\/80/g, to: 'border-border' },
  { from: /border-slate-200\s+dark:border-slate-800/g, to: 'border-border' },
  { from: /border-slate-100\s+dark:border-slate-800\/40/g, to: 'border-border/60' },
  { from: /divide-slate-100\s+dark:divide-slate-800\/40/g, to: 'divide-border/60' },
  { from: /border-slate-200/g, to: 'border-border' },
  
  // Text colors
  { from: /text-\[\#0F172A\]\s+dark:text-slate-200/g, to: 'text-foreground' },
  { from: /text-slate-700\s+dark:text-slate-200/g, to: 'text-foreground' },
  { from: /text-slate-800\s+dark:text-slate-200/g, to: 'text-foreground' },
  { from: /text-slate-500\s+dark:text-slate-400/g, to: 'text-muted-foreground' },
  { from: /text-slate-400/g, to: 'text-muted-foreground' },
  
  // Hover and selections
  { from: /hover:bg-slate-100\s+dark:hover:bg-slate-800\/40/g, to: 'hover:bg-muted' },
  { from: /hover:bg-slate-50\s+dark:hover:bg-slate-900\/40/g, to: 'hover:bg-muted/50' }
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  for (let replacement of replacements) {
    content = content.replace(replacement.from, replacement.to);
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (let file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        walkDir(fullPath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      processFile(fullPath);
    }
  }
}

console.log('Starting theme replacement...');
walkDir('./src');
console.log('Replacement finished!');
