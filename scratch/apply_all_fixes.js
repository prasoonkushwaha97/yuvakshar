const fs = require('fs');

function applyFixes() {
  let content = fs.readFileSync('src/store/CmsContext.tsx', 'utf-8');

  // 1. Signature
  const targetSignature = `export function CmsProvider({ children }: { children: React.ReactNode }) {`;
  const newSignature = `export function CmsProvider({ 
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
  content = content.replace(targetSignature, newSignature);

  // 2. States
  if (!content.includes('const [navigation, setNavigation]')) {
    content = content.replace('const [settings, setSettings]', 'const [navigation, setNavigation] = useState<any[]>(initialNavigation || []);\n  const [settings, setSettings]');
  }
  content = content.replace('const [settings, setSettings] = useState({', 'const [settings, setSettings] = useState<any>(initialSettings || {');
  
  // 3. Remove mock data in useState
  content = content.replace(/useState<Article\[\]>\(mockArticles\)/g, 'useState<Article[]>([])');
  content = content.replace(/useState<MagazineIssue\[\]>\(mockMagazineIssues\)/g, 'useState<MagazineIssue[]>([])');
  content = content.replace(/useState<Comment\[\]>\(mockComments\)/g, 'useState<Comment[]>([])');
  content = content.replace(/mockCareerItems/g, '[]');
  content = content.replace(/mockBroadcasts/g, '[]');
  content = content.replace(/mockComments/g, '[]');
  content = content.replace(/mockMagazineIssues/g, '[]');
  content = content.replace(/mockArticles/g, '[]');

  // 4. Add missing states
  if (!content.includes('const [homepageSections, setHomepageSections]')) {
    content = content.replace('const [ads, setAds] = useState<Ad[]>([]);', 'const [ads, setAds] = useState<Ad[]>(initialAds || []);\n  const [homepageSections, setHomepageSections] = useState<any[]>(initialHomepageSections || []);');
  }

  // 5. CmsContextType
  if (!content.includes('navigation: any[];')) {
    content = content.replace('  users: Profile[];', '  homepageSections: any[];\n  navigation: any[];\n  users: Profile[];');
  }

  // 6. Provider Value
  if (!content.includes('navigation,\n        subscribers,')) {
    content = content.replace('subscribers,\n        campaigns,', 'homepageSections,\n        navigation,\n        subscribers,\n        campaigns,');
  }

  // 7. Fix prev type
  content = content.replace(/setSettings\(prev => \(\{/g, 'setSettings((prev: any) => ({');

  // 8. Fix empty array in map
  content = content.replace(/const allArticles = \[\];/g, 'const allArticles: any[] = [];');
  content = content.replace(/\[\]\.forEach\(art => \{/g, '([] as any[]).forEach(art => {');

  // 9. Remove mockData imports
  content = content.replace(/import \{.*?\} from "@\/lib\/mockData";\n?/g, '');
  content = content.replace('export type { Article };', 'import { Article } from "./types";\nexport type { Article };');

  fs.writeFileSync('src/store/CmsContext.tsx', content);
  console.log('All fixes applied successfully!');
}

applyFixes();
