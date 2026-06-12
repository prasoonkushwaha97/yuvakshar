const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('Launching headless browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const targetDir = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\4a03fc30-5dd6-44e1-9172-41ac07dd0957';
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  try {
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: path.join(targetDir, 'real_homepage.png') });
    console.log('1. Homepage captured.');

    console.log('Navigating to magazine flipbook...');
    await page.goto('http://localhost:3000/magazine', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: path.join(targetDir, 'real_magazine.png') });
    console.log('2. Magazine reader captured.');

    console.log('Navigating to admin login...');
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    
    // Check if we need to click the login trigger button
    console.log('Clicking "कृपया पहले लॉगिन करें" button...');
    const triggerButtons = await page.$$('button');
    let clickedTrigger = false;
    for (let btn of triggerButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('कृपया पहले लॉगिन करें')) {
        await btn.click();
        clickedTrigger = true;
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1500));

    // Now click the "Email / पासवर्ड" tab in the AuthModal
    console.log('Clicking Email/Password tab...');
    const authButtons = await page.$$('button');
    for (let btn of authButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Email / पासवर्ड')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));

    // Fill login
    console.log('Filling credentials...');
    await page.type('input[type="email"]', 'yuvakshar.editor@gmail.com');
    await page.type('input[type="password"]', 'password123');
    
    // Find the submit button for Email Login and click it
    console.log('Submitting login...');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 4000));
    await page.screenshot({ path: path.join(targetDir, 'real_admin_dashboard.png') });
    console.log('3. Admin Dashboard captured.');

    // Clicks "लेख व समाचार" tab for Article Editor
    console.log('Clicking Article Editor tab...');
    let tabs = await page.$$('button');
    for (let tab of tabs) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (text.includes('लेख व समाचार')) {
        await tab.click();
        await new Promise(r => setTimeout(r, 1000));
        
        // Clicks "नया लेख लिखें"
        const buttons = await page.$$('button');
        for (let btn of buttons) {
          const btnText = await page.evaluate(el => el.textContent, btn);
          if (btnText.includes('नया लेख लिखें')) {
            await btn.click();
            await new Promise(r => setTimeout(r, 1000));
            break;
          }
        }
        await page.screenshot({ path: path.join(targetDir, 'real_article_editor.png') });
        console.log('4. Article Editor captured.');
        break;
      }
    }

    // Refresh tabs array for appearance tab
    console.log('Refreshing tabs...');
    tabs = await page.$$('button');
    for (let tab of tabs) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (text.includes('रूप और सेटिंग्स')) {
        await tab.click();
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(targetDir, 'real_communication_settings.png') });
        console.log('5. Communication Settings captured.');
        break;
      }
    }

    // Clicks "न्यूज़लेटर कैंपेन" tab
    console.log('Clicking Newsletter tab...');
    tabs = await page.$$('button');
    for (let tab of tabs) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (text.includes('न्यूज़लेटर कैंपेन')) {
        await tab.click();
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(targetDir, 'real_newsletter_module.png') });
        console.log('6. Newsletter Module captured.');
        break;
      }
    }

    // Mobile Responsive view
    console.log('Setting viewport to mobile...');
    await page.setViewport({ width: 375, height: 812, isMobile: true });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(targetDir, 'real_mobile_responsive.png') });
    console.log('7. Mobile Responsive view captured.');

  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
    console.log('Done capturing all screenshots!');
  }
}

run();
