const fs = require('fs');
let files = [
  'src/app/(public)/community/groups/[slug]/page.tsx',
  'src/app/(public)/community/groups/page.tsx',
  'src/app/admin/cms/navigation/page.tsx',
  'src/components/yuvakshar/ArticleQuiz.tsx',
  'src/app/(public)/search/page.tsx',
  'src/app/(public)/workspace/page.tsx',
  'src/store/CmsContext.tsx'
];

for (let f of files) {
  try {
    let content = fs.readFileSync(f, 'utf8');
    if (content.includes('useCallback') && !content.includes('useCallback,')) {
        if (!content.match(/import\s+(?:React,\s+)?\{[^}]*useCallback[^}]*\}\s+from\s+['"]react['"]/)) {
            content = content.replace(/import\s+(?:React,\s+)?\{([^}]+)\}\s+from\s+['"]react['"];/, (m, p1) => {
              if (m.includes('React,')) {
                return 'import React, { ' + p1 + ', useCallback } from "react";';
              } else {
                return 'import { ' + p1 + ', useCallback } from "react";';
              }
            });
            fs.writeFileSync(f, content);
            console.log('Fixed', f);
        }
    }
  } catch(e) {
    console.error(e);
  }
}
