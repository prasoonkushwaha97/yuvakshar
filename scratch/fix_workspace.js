const fs = require('fs');

let content = fs.readFileSync('src/app/(public)/workspace/page.tsx', 'utf-8');

// Add import
content = content.replace(/import \{ mockArticles, Article \} from "@\/lib\/mockData";/, 'import { Article } from "@/store/types";\nimport { useCms } from "@/store/CmsContext";');

// Add useCms call inside component
const targetFunc = 'export default function WorkspacePage() {\n';
content = content.replace(targetFunc, targetFunc + '  const { articles } = useCms();\n');

// Replace mockArticles with articles
content = content.replace(/mockArticles/g, 'articles');

fs.writeFileSync('src/app/(public)/workspace/page.tsx', content);
console.log('Fixed workspace page');
