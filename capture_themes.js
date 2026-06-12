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

  // Helper to force light theme in app
  async function setLightTheme() {
    await page.evaluate(() => {
      localStorage.setItem('yuvakshar_theme', 'light');
      localStorage.setItem('yuvashar_theme', 'light');
      document.documentElement.classList.remove('dark');
    });
    await new Promise(r => setTimeout(r, 1000));
  }

  // Helper to force dark theme in app
  async function setDarkTheme() {
    await page.evaluate(() => {
      localStorage.setItem('yuvakshar_theme', 'dark');
      localStorage.setItem('yuvashar_theme', 'dark');
      document.documentElement.classList.add('dark');
    });
    await new Promise(r => setTimeout(r, 1000));
  }

  try {
    // 1. Homepage Capture
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    
    console.log('Capturing homepage in Light Mode...');
    await setLightTheme();
    await page.screenshot({ path: path.join(targetDir, 'real_homepage_light.png') });
    
    console.log('Capturing homepage in Dark Mode...');
    await setDarkTheme();
    await page.screenshot({ path: path.join(targetDir, 'real_homepage_dark.png') });

    // 2. Magazine reader Capture
    console.log('Navigating to magazine flipbook...');
    await page.goto('http://localhost:3000/magazine', { waitUntil: 'networkidle2' });
    
    console.log('Capturing magazine in Light Mode...');
    await setLightTheme();
    await page.screenshot({ path: path.join(targetDir, 'real_magazine_light.png') });
    
    console.log('Capturing magazine in Dark Mode...');
    await setDarkTheme();
    await page.screenshot({ path: path.join(targetDir, 'real_magazine_dark.png') });

    // 3. Admin login & dashboard Capture
    console.log('Navigating to admin login...');
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('Clicking login trigger...');
    const triggerButtons = await page.$$('button');
    for (let btn of triggerButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('कृपया पहले लॉगिन करें')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1500));

    console.log('Switching to Email/Password tab...');
    const authButtons = await page.$$('button');
    for (let btn of authButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Email / पासवर्ड')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));

    console.log('Filling credentials...');
    await page.type('input[type="email"]', 'yuvakshar.editor@gmail.com');
    await page.type('input[type="password"]', 'password123');
    
    console.log('Submitting login...');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 4000));

    console.log('Capturing Admin Dashboard in Light Mode...');
    await setLightTheme();
    await page.screenshot({ path: path.join(targetDir, 'real_admin_dashboard_light.png') });
    
    console.log('Capturing Admin Dashboard in Dark Mode...');
    await setDarkTheme();
    await page.screenshot({ path: path.join(targetDir, 'real_admin_dashboard_dark.png') });

    // 4. Click Article Editor
    console.log('Clicking Article Editor tab...');
    let tabs = await page.$$('button');
    for (let tab of tabs) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (text.includes('लेख व समाचार')) {
        await tab.click();
        await new Promise(r => setTimeout(r, 1000));
        
        const buttons = await page.$$('button');
        for (let btn of buttons) {
          const btnText = await page.evaluate(el => el.textContent, btn);
          if (btnText.includes('नया लेख लिखें')) {
            await btn.click();
            await new Promise(r => setTimeout(r, 1000));
            break;
          }
        }
        
        console.log('Capturing Article Editor in Light Mode...');
        await setLightTheme();
        await page.screenshot({ path: path.join(targetDir, 'real_article_editor_light.png') });
        
        console.log('Capturing Article Editor in Dark Mode...');
        await setDarkTheme();
        await page.screenshot({ path: path.join(targetDir, 'real_article_editor_dark.png') });
        break;
      }
    }

    // 5. Click Appearance Settings
    console.log('Navigating back to settings...');
    tabs = await page.$$('button');
    for (let tab of tabs) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (text.includes('रूप और सेटिंग्स')) {
        await tab.click();
        await new Promise(r => setTimeout(r, 1000));
        
        console.log('Capturing Settings in Light Mode...');
        await setLightTheme();
        await page.screenshot({ path: path.join(targetDir, 'real_communication_settings_light.png') });
        
        console.log('Capturing Settings in Dark Mode...');
        await setDarkTheme();
        await page.screenshot({ path: path.join(targetDir, 'real_communication_settings_dark.png') });
        break;
      }
    }

    // 6. Click Newsletter Module
    console.log('Navigating back to Newsletter...');
    tabs = await page.$$('button');
    for (let tab of tabs) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (text.includes('न्यूज़लेटर कैंपेन')) {
        await tab.click();
        await new Promise(r => setTimeout(r, 1000));
        
        console.log('Capturing Newsletter in Light Mode...');
        await setLightTheme();
        await page.screenshot({ path: path.join(targetDir, 'real_newsletter_module_light.png') });
        
        console.log('Capturing Newsletter in Dark Mode...');
        await setDarkTheme();
        await page.screenshot({ path: path.join(targetDir, 'real_newsletter_module_dark.png') });
        break;
      }
    }

    // 7. Mobile Responsive view
    console.log('Setting viewport to mobile...');
    await page.setViewport({ width: 375, height: 812, isMobile: true });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    
    console.log('Capturing mobile view in Light Mode...');
    await setLightTheme();
    await page.screenshot({ path: path.join(targetDir, 'real_mobile_responsive_light.png') });
    
    console.log('Capturing mobile view in Dark Mode...');
    await setDarkTheme();
    await page.screenshot({ path: path.join(targetDir, 'real_mobile_responsive_dark.png') });

  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
    console.log('Done capturing all screenshots for both themes!');
  }
}

run();
