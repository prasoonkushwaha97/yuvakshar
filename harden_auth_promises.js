const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;

      // 1. Protect getUser()
      content = content.replace(/await supabase\.auth\.getUser\(\)/g, "await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: { message: 'Auth network error' } }))");
      
      // 2. Protect getSession()
      content = content.replace(/await supabase\.auth\.getSession\(\)/g, "await supabase.auth.getSession().catch(() => ({ data: { session: null }, error: { message: 'Session network error' } }))");

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Hardened auth in:', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
