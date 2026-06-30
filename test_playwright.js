const { chromium } = require('playwright');
const fs = require('fs');
const { exec } = require('child_process');

(async () => {
  const child = exec('npm run start', { cwd: __dirname });
  
  // Wait a bit for server to start
  await new Promise(r => setTimeout(r, 6000));
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  
  // Wait for articles to load
  await page.waitForTimeout(3000);
  
  const html = await page.content();
  fs.writeFileSync('playwright_output.html', html);
  
  const sections = await page.$$eval('section', (els) => {
    return els.map(el => {
      const id = el.id;
      const classes = el.className;
      const text = el.innerText.substring(0, 100);
      const height = el.getBoundingClientRect().height;
      return { id, classes, text, height };
    });
  });
  
  console.log("Found sections:", sections.length);
  sections.forEach((s, i) => {
    console.log(`\nSection ${i}: height ${s.height}px, classes: ${s.classes}`);
    console.log(`Content starts with: ${s.text.replace(/\n/g, ' ')}`);
  });
  
  await browser.close();
  child.kill();
})();
