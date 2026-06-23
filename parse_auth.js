const fs = require('fs');
const data = JSON.parse(fs.readFileSync('auth_search_results.json', 'utf8'));

const summary = {
  getSession: new Set(),
  getUser: new Set(),
  createServerClient: new Set(),
  createBrowserClient: new Set(),
  refreshSession: new Set(),
  cookies: new Set()
};

data.forEach(item => {
  if (summary[item.query]) {
    summary[item.query].add(`${item.file}:${item.line}`);
  }
});

let output = '';
for (const key in summary) {
  output += `\n=== ${key} ===\n`;
  output += Array.from(summary[key]).join('\n') + '\n';
}

fs.writeFileSync('auth_summary.txt', output);
console.log('Saved to auth_summary.txt');
