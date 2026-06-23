const fs = require('fs');
let content = fs.readFileSync('src/store/CmsContext.tsx', 'utf-8');

// 1. Change useState({ general... to useState(initialSettings || { general...
content = content.replace('const [settings, setSettings] = useState({', 'const [settings, setSettings] = useState(initialSettings || {');

// 2. Add navigation state
if (!content.includes('const [navigation, setNavigation]')) {
  content = content.replace('const [settings, setSettings]', 'const [navigation, setNavigation] = useState<any[]>(initialNavigation || []);\n  const [settings, setSettings]');
}

// 3. Add to CmsContextType
if (!content.includes('settings: any;')) {
  content = content.replace('  homepageSections: any[];\n', '  homepageSections: any[];\n  settings: any;\n  navigation: any[];\n');
}

// 4. Add to Provider value
if (!content.includes('navigation,\n        settings,')) {
  content = content.replace('homepageSections,\n', 'homepageSections,\n        settings,\n        navigation,\n');
}

fs.writeFileSync('src/store/CmsContext.tsx', content);
console.log('Fixed settings and navigation state and context value');
