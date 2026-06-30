const fs = require('fs');
let c2 = fs.readFileSync('src/app/(public)/search/page.tsx', 'utf8');

c2 = c2.replace(/const logSearchQuery = async \(query: string\) => \{/, 'const logSearchQuery = useCallback(async (query: string) => {');
c2 = c2.replace(/  };\r?\n\r?\n  useEffect\(\(\) => \{/, '  }, []);\n\n  useEffect(() => {');
c2 = c2.replace(/logSearchQuery\(q\);\r?\n      \}\r?\n    \}\r?\n  \}, \[q\]\);/, 'logSearchQuery(q);\n      }\n    }\n  }, [q, logSearchQuery]);');

if (!c2.includes('useCallback')) {
  c2 = c2.replace(/import \{([^}]+)\} from 'react';/, "import { $1, useCallback } from 'react';");
}

fs.writeFileSync('src/app/(public)/search/page.tsx', c2);
