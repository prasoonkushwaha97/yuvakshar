const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const original = content;
      // Replace generic CMS errors with graceful empty states
      content = content.replace(/No authors configured\. Please configure them in the CMS\./g, 'अभी कोई लेखक उपलब्ध नहीं है।');
      content = content.replace(/No categories configured\. Please configure them in the CMS\./g, 'अभी कोई श्रेणी उपलब्ध नहीं है।');
      content = content.replace(/No groups configured\. Please configure them in the CMS\./g, 'अभी कोई समूह उपलब्ध नहीं है।');
      content = content.replace(/Please configure them in the CMS\./gi, 'जल्द आ रहा है। (Coming soon)');
      content = content.replace(/No homepage sections configured\./gi, 'सामग्री जल्द आ रही है।');
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed empty states in:', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, 'src', 'app'));
