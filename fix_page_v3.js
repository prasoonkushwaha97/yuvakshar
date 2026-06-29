const fs = require('fs');
const path = require('path');

const pagePath = path.join(process.cwd(), 'src/app/(public)/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

const HINDI = {
  SAMACHAR: "\u0938\u092E\u093E\u091A\u093E\u0930",
  VISHLESHAN: "\u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923",
  VISHESH_LEKH: "\u0935\u093F\u0936\u0947\u0937 \u0932\u0947\u0916",
  SAHITYA: "\u0938\u093E\u0939\u093F\u0924\u094D\u092F",
};

content = content.replace(/\$\{HINDI\.SAMACHAR\}/g, HINDI.SAMACHAR);
content = content.replace(/\$\{HINDI\.VISHLESHAN\}/g, HINDI.VISHLESHAN);
content = content.replace(/\$\{HINDI\.VISHESH_LEKH\}/g, HINDI.VISHESH_LEKH);
content = content.replace(/\$\{HINDI\.SAHITYA\}/g, HINDI.SAHITYA);

fs.writeFileSync(pagePath, content, 'utf8');
console.log("Fixed page.tsx");
