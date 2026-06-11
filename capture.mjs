import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

async function run() {
  console.log('Launching headless browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Set default to mobile viewport
  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  const targetDir = 'C:\\Users\\HP\\.gemini\antigravity\\brain\\4a03fc30-5dd6-44e1-9172-41ac07dd0957';
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const navOptions = { waitUntil: 'networkidle0', timeout: 60000 };

  async function captureBothThemes(baseName) {
    // 1. Force Light Theme
    console.log(`Setting Light Theme for ${baseName}...`);
    await page.evaluate(() => {
      localStorage.setItem('yuvakshar_theme', 'light');
      document.documentElement.classList.remove('dark');
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(targetDir, `${baseName}_light.png`) });
    console.log(`Captured: ${baseName}_light.png`);

    // 2. Force Dark Theme
    console.log(`Setting Dark Theme for ${baseName}...`);
    await page.evaluate(() => {
      localStorage.setItem('yuvakshar_theme', 'dark');
      document.documentElement.classList.add('dark');
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(targetDir, `${baseName}_dark.png`) });
    console.log(`Captured: ${baseName}_dark.png`);
  }

  try {
    // 1 & 6. Mobile Homepage & Mobile Bottom Navigation (Bottom Nav is visible here)
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3000/', navOptions);
    await new Promise(r => setTimeout(r, 4000));
    await captureBothThemes('real_mobile_homepage');
    await captureBothThemes('real_mobile_bottom_nav');

    // 2. Mobile Navigation Drawer
    console.log('Opening Mobile Drawer...');
    // Click the last button in the sticky nav header controls to toggle mobile menu open
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('header button'));
      const menuBtn = btns.find(b => b.innerHTML.includes('svg') || b.querySelector('svg'));
      if (menuBtn) menuBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await captureBothThemes('real_mobile_drawer');

    // Close the drawer to navigate safely
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const closeBtn = btns.find(b => b.innerHTML.includes('svg') && b.innerHTML.includes('x'));
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // 3. Mobile Article Page
    console.log('Navigating to article page...');
    await page.goto('http://localhost:3000/editorial?id=art-1', navOptions);
    await new Promise(r => setTimeout(r, 3000));
    await captureBothThemes('real_mobile_article');

    // 4. Mobile Magazine Reader
    console.log('Navigating to magazine flipbook...');
    await page.goto('http://localhost:3000/magazine', navOptions);
    await new Promise(r => setTimeout(r, 3000));
    await captureBothThemes('real_mobile_magazine');

    // 5. Mobile Search Page
    console.log('Navigating to search page...');
    await page.goto('http://localhost:3000/search?q=%E0%A4%B5%E0%A4%BF%E0%A4%B0%E0%A4%B9', navOptions);
    await new Promise(r => setTimeout(r, 3000));
    await captureBothThemes('real_mobile_search');

    // 7. Mobile Admin Dashboard
    console.log('Navigating to admin login...');
    await page.goto('http://localhost:3000/admin', navOptions);
    await new Promise(r => setTimeout(r, 3000));
    
    console.log('Waiting for login form email field...');
    await page.waitForSelector('input[type="email"]', { timeout: 15000 });
    
    // Fill login
    await page.type('input[type="email"]', 'yuvakshar.editor@gmail.com');
    await new Promise(r => setTimeout(r, 500));
    await page.click('button[type="submit"]');
    
    console.log('Waiting for admin sidebar to load...');
    await page.waitForSelector('aside button', { timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    await captureBothThemes('real_mobile_admin_dashboard');

  } catch (err) {
    console.error('Error during capture:', err);
    await page.screenshot({ path: path.join(targetDir, 'error_screenshot.png') });
    console.log('Error screenshot captured.');
  } finally {
    await browser.close();
    console.log('Done capturing all screenshots!');
  }
}

run();
