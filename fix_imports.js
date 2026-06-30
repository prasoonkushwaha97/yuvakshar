const fs = require('fs');
let file = 'src/app/(public)/community/discussion/thread/[id]/page.tsx';
let c = fs.readFileSync(file, 'utf8');

// Also check the other files that might be missing useCallback import
let filesToCheck = [
  'src/app/(public)/community/discussion/thread/[id]/page.tsx',
  'src/app/(public)/community/groups/[slug]/page.tsx',
  'src/app/(public)/community/groups/page.tsx',
  'src/app/admin/cms/navigation/page.tsx',
  'src/components/yuvakshar/ArticleQuiz.tsx',
  'src/app/(public)/search/page.tsx',
  'src/app/(public)/workspace/page.tsx',
  'src/store/CmsContext.tsx'
];

for (let f of filesToCheck) {
  try {
    let content = fs.readFileSync(f, 'utf8');
    if (content.includes('useCallback') && !content.includes('useCallback,')) {
        if (!/import \{[^}]*useCallback[^}]*\} from ['"]react['"];/.test(content)) {
            // Need to add useCallback
            content = content.replace(/import \{([^}]+)\} from ['"]react['"];/, 'import { $1, useCallback } from \'react\';');
            fs.writeFileSync(f, content);
            console.log('Fixed import in', f);
        }
    }
  } catch(e) {}
}

