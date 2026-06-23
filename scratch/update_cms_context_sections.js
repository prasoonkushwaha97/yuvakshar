const fs = require('fs');
let content = fs.readFileSync('src/store/CmsContext.tsx', 'utf-8');

// Add new properties to CmsProvider signature
const sigOld = `export function CmsProvider({ 
  children,
  initialSettings,
  initialNavigation 
}: { 
  children: React.ReactNode,
  initialSettings?: any,
  initialNavigation?: any
}) {`;

const sigNew = `export function CmsProvider({ 
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

content = content.replace(sigOld, sigNew);

// Add state for homepageSections and advertisements
// Wait, CmsProvider already has \`const [ads, setAds] = useState<Ad[]>([]);\`
const adsOld = `const [ads, setAds] = useState<Ad[]>([]);`;
const adsNew = `const [ads, setAds] = useState<Ad[]>(initialAds || []);\n  const [homepageSections, setHomepageSections] = useState<any[]>(initialHomepageSections || []);`;

content = content.replace(adsOld, adsNew);

// Add to CmsContextType
const typeOld = `  layouts: HomepageLayout[];`;
const typeNew = `  layouts: HomepageLayout[];\n  homepageSections: any[];`;
content = content.replace(typeOld, typeNew);

// Export homepageSections
const exportOld = `        layouts,
        users,`;
const exportNew = `        layouts,
        homepageSections,
        users,`;
content = content.replace(exportOld, exportNew);

fs.writeFileSync('src/store/CmsContext.tsx', content);
console.log('CmsContext updated!');
