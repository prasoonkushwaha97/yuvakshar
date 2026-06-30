const fs = require('fs');

(async () => {
  const res = await fetch('http://localhost:3000');
  const html = await res.text();
  
  // write to output.html
  fs.writeFileSync('output.html', html);
  
  const sections = html.match(/<section[^>]*>[\s\S]*?<\/section>/gi);
  console.log("Found sections:", sections ? sections.length : 0);
  
  if (sections) {
    sections.forEach((s, i) => {
      console.log('\n--- SECTION', i, '---');
      console.log('length:', s.length);
      console.log('id:', s.match(/id="([^"]*)"/)?.[1]);
      console.log('class:', s.match(/class="([^"]*)"/)?.[1]);
      console.log('text:', s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').substring(0, 150));
    });
  }
})();
