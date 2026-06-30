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

// 1. Thread page
fixFile('src/app/(public)/community/discussion/thread/[id]/page.tsx', [
  {
    search: /const loadThreadDetails = async \(\) => \{/,
    replace: 'const loadThreadDetails = useCallback(async () => {',
    needsUseCallback: true
  },
  {
    search: /  \};\r?\n\r?\n  useEffect\(\(\) => \{/,
    replace: '  }, [threadId]);\n\n  useEffect(() => {'
  },
  {
    search: /loadThreadDetails\(\);\r?\n  \}, \[threadId\]\);/,
    replace: 'loadThreadDetails();\n  }, [loadThreadDetails]);'
  }
]);

// 2. Groups page
fixFile('src/app/(public)/community/groups/[slug]/page.tsx', [
  {
    search: /const loadGroupData = async \(\) => \{/,
    replace: 'const loadGroupData = useCallback(async () => {',
    needsUseCallback: true
  },
  {
    search: /  \};\r?\n\r?\n  useEffect\(\(\) => \{/,
    replace: '  }, [slug]);\n\n  useEffect(() => {'
  },
  {
    search: /loadGroupData\(\);\r?\n  \}, \[slug\]\);/,
    replace: 'loadGroupData();\n  }, [loadGroupData]);'
  }
]);

// 3. Groups index
fixFile('src/app/(public)/community/groups/page.tsx', [
  {
    search: /const loadGroups = async \(\) => \{/,
    replace: 'const loadGroups = useCallback(async () => {',
    needsUseCallback: true
  },
  {
    search: /  \};\r?\n\r?\n  useEffect\(\(\) => \{/,
    replace: '  }, []);\n\n  useEffect(() => {'
  },
  {
    search: /loadGroups\(\);\r?\n  \}, \[\]\);/,
    replace: 'loadGroups();\n  }, [loadGroups]);'
  }
]);

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
    search: /  \}, \[user\]\);/,
    replace: '  }, [user, articles]);'
  }
]);

// 7. Admin Navigation
fixFile('src/app/admin/cms/navigation/page.tsx', [
  {
    search: /const fetchMenus = async \(\) => \{/,
    replace: 'const fetchMenus = useCallback(async () => {',
    needsUseCallback: true
  },
  {
    search: /  \};\r?\n\r?\n  useEffect\(\(\) => \{/,
    replace: '  }, []);\n\n  useEffect(() => {'
  },
  {
    search: /fetchMenus\(\);\r?\n  \}, \[\]\);/,
    replace: 'fetchMenus();\n  }, [fetchMenus]);'
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

// 9. ArticleQuiz
fixFile('src/components/yuvakshar/ArticleQuiz.tsx', [
  {
    search: /  \}, \[\]\);/,
    replace: '  }, [article.content]);'
  },
  {
    search: /\}, \[quizGenerated\]\);/,
    replace: '}, [quizGenerated, handleSelectOption]);'
  }
]);

// 10. AuthModal
fixFile('src/components/yuvakshar/AuthModal.tsx', [
  {
    search: /\}, \[isOpen\]\);/,
    replace: '}, [isOpen, handleClose]);'
  }
]);

// 11. CmsContext
fixFile('src/store/CmsContext.tsx', [
  {
    search: /loadDataFromSupabase\(\);\r?\n    \}\r?\n  \}, \[\]\);/,
    replace: 'loadDataFromSupabase();\n    }\n  }, [loadDataFromLocalStorage, loadDataFromSupabase]);'
  }
]);

