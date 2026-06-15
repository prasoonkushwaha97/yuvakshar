const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '..', 'src');

const searchTerms = [
  'localStorage',
  'yuvakshar_bookmarks',
  'yuvakshar_users',
  'yuvakshar_c_',
  'community_groups',
  'community_posts',
  'community_comments',
  'community_events',
  'community_challenges',
  'community_messages',
  'community_conversations',
  'community_notifications',
  'profile_timeline',
  'profile_portfolio',
  'profile_achievements',
  'profile_followers'
];

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        searchTerms.forEach(term => {
          if (line.includes(term)) {
            console.log(`${path.relative(directoryPath, fullPath)}:L${index + 1} -> Contains "${term}"`);
          }
        });
      });
    }
  }
}

console.log(`Scanning src directory under: ${directoryPath}`);
scanDirectory(directoryPath);
