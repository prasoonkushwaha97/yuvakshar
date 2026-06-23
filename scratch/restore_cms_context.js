const fs = require('fs');

let content = fs.readFileSync('src/store/CmsContext.tsx', 'utf-8');

// 1. Remove imports
content = content.replace(/import \{ mockArticles, mockMagazineIssues, mockCareerItems, mockBroadcasts, mockComments,\s+Article \} from "@\/lib\/mockData";/g, 'import { Article } from "@/store/types";');
content = content.replace(/export type \{ Article \};/g, 'export type { Article };');

// 2. Remove initialMockVideos array entirely
content = content.replace(/const initialMockVideos: Video\[\] = \[\s*\{[\s\S]*?\}\s*\];/g, '');

// 3. Update CmsProvider signature
const oldSig = `export function CmsProvider({ 
  children,
  initialSettings,
  initialNavigation 
}: { 
  children: React.ReactNode,
  initialSettings?: any,
  initialNavigation?: any
}) {`;

const newSig = `export function CmsProvider({ 
  children,
  initialSettings,
  initialNavigation,
  initialHomepageSections,
  initialAds
}: { 
  children: React.ReactNode,
  initialSettings?: any,
  initialNavigation?: any,
  initialHomepageSections?: any[],
  initialAds?: any[]
}) {`;

content = content.replace(oldSig, newSig);

// 4. Update state variables
const oldAds = `const [ads, setAds] = useState<Ad[]>([]);`;
const newAds = `const [ads, setAds] = useState<Ad[]>(initialAds || []);\n  const [homepageSections, setHomepageSections] = useState<any[]>(initialHomepageSections || []);`;
content = content.replace(oldAds, newAds);

// 5. Fix state initialization
content = content.replace(/const \[magazines, setMagazines\] = useState<MagazineIssue\[\]>\(mockMagazineIssues\);/g, 'const [magazines, setMagazines] = useState<MagazineIssue[]>([]);');

content = content.replace(/loadedArticles = parsed\.length > 0 \? parsed : mockArticles;/g, 'loadedArticles = parsed || [];');
content = content.replace(/loadedArticles = mockArticles;/g, 'loadedArticles = [];');
content = content.replace(/localStorage\.setItem\("yuvakshar_articles", JSON\.stringify\(mockArticles\)\);/g, '');
content = content.replace(/setMagazines\(mockMagazineIssues\);/g, 'setMagazines([]);');
content = content.replace(/localStorage\.setItem\("yuvakshar_magazines", JSON\.stringify\(mockMagazineIssues\)\);/g, '');
content = content.replace(/setComments\(mockComments as Comment\[\]\);/g, 'setComments([]);');
content = content.replace(/localStorage\.setItem\("yuvakshar_comments", JSON\.stringify\(mockComments\)\);/g, '');
content = content.replace(/setVideos\(initialMockVideos\);/g, 'setVideos([]);');
content = content.replace(/localStorage\.setItem\("yuvakshar_videos", JSON\.stringify\(initialMockVideos\)\);/g, '');

content = content.replace(/const loadedArticles = dbArticles && dbArticles\.length > 0 \? dbArticles : mockArticles;/g, 'const loadedArticles = dbArticles || [];');

content = content.replace(/const allArticles = mockArticles;/g, 'const allArticles = articles || [];');
content = content.replace(/mockArticles\.forEach\(art => \{/g, 'articles.forEach(art => {');

// 6. Update CmsContextType
const oldType = `  layouts: HomepageLayout[];`;
const newType = `  layouts: HomepageLayout[];\n  homepageSections: any[];`;
content = content.replace(oldType, newType);

// 7. Update value provided by context
const oldExport = `        layouts,\n        users,`;
const newExport = `        layouts,\n        homepageSections,\n        users,`;
content = content.replace(oldExport, newExport);

fs.writeFileSync('src/store/CmsContext.tsx', content);
console.log('CmsContext cleanly restored and updated!');
