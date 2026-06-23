const fs = require('fs');
let content = fs.readFileSync('src/store/CmsContext.tsx', 'utf-8');

content = content.replace(/useState<Article\[\]>\(mockArticles\)/g, 'useState<Article[]>([])');
content = content.replace(/useState<MagazineIssue\[\]>\(mockMagazineIssues\)/g, 'useState<MagazineIssue[]>([])');
content = content.replace(/useState<Comment\[\]>\(mockComments\)/g, 'useState<Comment[]>([])');
content = content.replace(/mockCareerItems/g, '[]');
content = content.replace(/mockBroadcasts/g, '[]');
content = content.replace(/mockComments/g, '[]');
content = content.replace(/mockMagazineIssues/g, '[]');
content = content.replace(/mockArticles/g, '[]');

fs.writeFileSync('src/store/CmsContext.tsx', content);
console.log('Fixed mockData in state initialization');
