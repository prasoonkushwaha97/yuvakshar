const fs = require('fs');

let content = fs.readFileSync('src/store/CmsContext.tsx', 'utf-8');

// 1. Remove imports
content = content.replace(/import \{ mockArticles, mockMagazineIssues, mockCareerItems, mockBroadcasts, mockComments,\s+Article \} from "@\/lib\/mockData";/g, '');
// Add import for Article since we removed it from mockData
content = content.replace(/export type \{ Article \};/g, 'import { Article } from "@/store/types";\nexport type { Article };');

// 2. Remove initialMockVideos array entirely
content = content.replace(/const initialMockVideos: Video\[\] = \[\s*\{[\s\S]*?\}\s*\];/g, '');

// 3. Fix state initialization
content = content.replace(/const \[magazines, setMagazines\] = useState<MagazineIssue\[\]>\(mockMagazineIssues\);/g, 'const [magazines, setMagazines] = useState<MagazineIssue[]>([]);');

// 4. Fix loadDataFromLocalStorage logic
content = content.replace(/loadedArticles = parsed\.length > 0 \? parsed : mockArticles;/g, 'loadedArticles = parsed || [];');
content = content.replace(/loadedArticles = mockArticles;/g, 'loadedArticles = [];');
content = content.replace(/localStorage\.setItem\("yuvakshar_articles", JSON\.stringify\(mockArticles\)\);/g, '');
content = content.replace(/setMagazines\(mockMagazineIssues\);/g, 'setMagazines([]);');
content = content.replace(/localStorage\.setItem\("yuvakshar_magazines", JSON\.stringify\(mockMagazineIssues\)\);/g, '');
content = content.replace(/setComments\(mockComments as Comment\[\]\);/g, 'setComments([]);');
content = content.replace(/localStorage\.setItem\("yuvakshar_comments", JSON\.stringify\(mockComments\)\);/g, '');
content = content.replace(/setVideos\(initialMockVideos\);/g, 'setVideos([]);');
content = content.replace(/localStorage\.setItem\("yuvakshar_videos", JSON\.stringify\(initialMockVideos\)\);/g, '');

// 5. Fix loadDataFromSupabase logic
content = content.replace(/const loadedArticles = dbArticles && dbArticles\.length > 0 \? dbArticles : mockArticles;/g, 'const loadedArticles = dbArticles || [];');

// 6. Fix Quiz generation which iterates over mockArticles
content = content.replace(/const allArticles = mockArticles;/g, 'const allArticles = articles || [];');
content = content.replace(/mockArticles\.forEach\(art => \{/g, 'articles.forEach(art => {');

fs.writeFileSync('src/store/CmsContext.tsx', content);
console.log('Mock data ripped out from CmsContext.tsx!');
