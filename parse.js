const fs = require('fs'); 
const html = fs.readFileSync('output.html', 'utf-8'); 
const sections = html.match(/<section[^>]*>[\s\S]*?<\/section>/gi) || []; 
console.log(`Found ${sections.length} sections`); 
sections.forEach((s, i) => { 
  console.log(`\nSection ${i}: length ${s.length}, id: ${s.match(/id=\"(.*?)\"/)?.[1]}, classes: ${s.match(/class=\"(.*?)\"/)?.[1]}`); 
  if (s.length < 500) { 
    console.log('CONTENT:', s); 
  } else { 
    console.log('Too long'); 
  } 
});
