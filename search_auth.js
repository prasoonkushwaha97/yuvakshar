const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const queries = ['getSession', 'getUser', 'createServerClient', 'createBrowserClient', 'refreshSession', 'cookies'];

function searchDir(dir) {
    const results = [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            results.push(...searchDir(fullPath));
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                for (const query of queries) {
                    if (lines[i].includes(query)) {
                        results.push({ file: fullPath.replace(__dirname, ''), line: i + 1, query, content: lines[i].trim() });
                    }
                }
            }
        }
    }
    return results;
}

const allResults = searchDir(srcDir);
fs.writeFileSync('auth_search_results.json', JSON.stringify(allResults, null, 2));
console.log(`Found ${allResults.length} matches. Saved to auth_search_results.json`);
