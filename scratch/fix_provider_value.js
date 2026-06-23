const fs = require('fs');

let content = fs.readFileSync('src/store/CmsContext.tsx', 'utf-8');

// Find the value={{ block and inside it, replace `ads,` with `ads, homepageSections, navigation,`
if (content.includes('value={{')) {
  // Let's just do a blanket replace of `ads,` but ONLY inside the value={{ block
  // The easiest way is to split by `value={{` and replace in the second part
  const parts = content.split('value={{');
  if (parts.length > 1) {
    parts[1] = parts[1].replace(/ads,\s+subscribers,/g, 'ads,\n        homepageSections,\n        navigation,\n        subscribers,');
    
    // Also try another pattern if the above didn't match
    if (!parts[1].includes('homepageSections,')) {
        parts[1] = parts[1].replace('ads,', 'ads,\n        homepageSections,\n        navigation,');
    }
    
    content = parts.join('value={{');
    fs.writeFileSync('src/store/CmsContext.tsx', content);
    console.log('Fixed Provider value');
  }
}
