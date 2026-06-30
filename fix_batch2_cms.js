const fs = require('fs');
let c = fs.readFileSync('src/store/CmsContext.tsx', 'utf8');

if (!c.includes('useCallback')) {
  c = c.replace(/import\s+\{([^}]+)\}\s+from\s+['"]react['"];/, "import { $1, useCallback } from 'react';");
}

c = c.replace(/function loadDataFromLocalStorage\(\) \{/, 'const loadDataFromLocalStorage = useCallback(() => {');
// finding the end:
// It ends right before `function loadDataFromSupabase() {`
c = c.replace(/  \}\r?\n\r?\n  async function loadDataFromSupabase\(\) \{/, '  }, []);\n\n  const loadDataFromSupabase = useCallback(async () => {');

// And then loadDataFromSupabase ends right before:
// `  useEffect(() => {`
c = c.replace(/  \};\r?\n\r?\n  useEffect\(\(\) => \{/, '  }, []);\n\n  useEffect(() => {');

fs.writeFileSync('src/store/CmsContext.tsx', c);
console.log('Fixed CmsContext');
