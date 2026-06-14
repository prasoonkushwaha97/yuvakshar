const fs = require('fs');
const pages = ['account', 'appearance', 'notifications', 'privacy', 'language', 'security'];
pages.forEach(page => {
  const content = \"use client\";\n\nexport default function Settings() {\n  return (\n    <div className=\"space-y-6\">\n      <div>\n        <h2 className=\"text-2xl font-bold font-serif mb-2 capitalize\"></h2>\n        <p className=\"text-slate-500 text-sm\">Manage your  preferences here.</p>\n      </div>\n      <div className=\"bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 border border-dashed border-slate-200 dark:border-slate-700 text-center\">\n        <p className=\"text-slate-400\">Settings implementation pending.</p>\n      </div>\n    </div>\n  );\n};
  fs.writeFileSync('src/app/settings/' + page + '/page.tsx', content);
});
console.log('Created dummy setting pages');
