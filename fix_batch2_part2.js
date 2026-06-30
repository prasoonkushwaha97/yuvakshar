const fs = require('fs');

function fixFile(file, replacers) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  for (const r of replacers) {
    content = content.replace(r.search, r.replace);
  }
  if (content !== original) {
    if (replacers.some(r => r.needsUseCallback) && !content.includes('useCallback')) {
      content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]react['"];/, (m, p1) => {
        return `import { ${p1}, useCallback } from 'react';`;
      });
    }
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
}

// 4. Contact page
fixFile('src/app/(public)/contact/page.tsx', [
  {
    search: /\}, \[category, message, isSubmitting, submitSuccess\]\);/,
    replace: '}, [email, mobile, name, category, message, isSubmitting, submitSuccess]);'
  }
]);

// 5. Search page
fixFile('src/app/(public)/search/page.tsx', [
  {
    search: /const logSearchQuery = async \(query: string\) => \{/,
    replace: 'const logSearchQuery = useCallback(async (query: string) => {',
    needsUseCallback: true
  },
  {
    search: /  \};\r?\n\r?\n  useEffect\(\(\) => \{/,
    replace: '  }, []);\n\n  useEffect(() => {'
  },
  {
    search: /logSearchQuery\(q\);\r?\n      \}\r?\n    \}\r?\n  \}, \[q\]\);/,
    replace: 'logSearchQuery(q);\n      }\n    }\n  }, [q, logSearchQuery]);'
  }
]);

// 6. Workspace page
fixFile('src/app/(public)/workspace/page.tsx', [
  {
    search: /\} else if \(articles\.length === 0\)/,
    replace: '} else if (articles && articles.length === 0)'
  },
  {
    search: /  \}, \[\]\);/,
    replace: '  }, [articles]);'
  }
]);

// 8. AiAssistantSidebar
fixFile('src/components/yuvakshar/AiAssistantSidebar.tsx', [
  {
    search: /\}, \[messages\]\);/,
    replace: '}, [messages, article?.title]);'
  },
  {
    search: /\}, \[isSpeaking\]\);/,
    replace: '}, [isSpeaking, handlePlayAudio, isPlayingAudio, synth]);'
  }
]);

// 10. AuthModal
fixFile('src/components/yuvakshar/AuthModal.tsx', [
  {
    search: /\}, \[isOpen\]\);/,
    replace: '}, [isOpen, handleClose]);'
  }
]);
