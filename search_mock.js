const fs = require('fs');
const path = require('path');

let output = "";

function log(msg) {
    output += msg + "\n";
}

function searchFiles(dir, regex) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            searchFiles(fullPath, regex);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.sql')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (regex.test(content)) {
                log(`Found in: ${fullPath}`);
                const lines = content.split('\n');
                lines.forEach((line, index) => {
                    if (regex.test(line)) {
                        log(`  ${index + 1}: ${line.trim()}`);
                    }
                });
            }
        }
    }
}

const pattern = /mockArticles|dummyArticles|seedArticles|articleSeedData|sample articles|localStorage/i;
log('Searching src...');
searchFiles('./src', pattern);
log('Searching supabase...');
if (fs.existsSync('./supabase')) {
    searchFiles('./supabase', pattern);
}
log('Done.');

fs.writeFileSync('search_results.log', output, 'utf8');
