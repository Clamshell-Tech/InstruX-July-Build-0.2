const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  console.log('Navigating to http://localhost:3000/app-new...');
  await page.goto('http://localhost:3000/app-new', { waitUntil: 'networkidle2' });
  
  console.log('Waiting for components to render...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate skipping to the exact screen the user was on (TextInputWizard step 1)
  // Assuming the user is on the 'paste' view
  await page.evaluate(() => {
    // Force light theme
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  });
  
  console.log('Taking screenshot...');
  const savePath = 'C:\\Users\\Admin\\.gemini\\antigravity-cli\\brain\\ad114a1a-2c7e-4a5a-8e3e-1f7c8315da61\\light_theme_preview.png';
  await page.screenshot({ path: savePath });
  
  console.log(`Screenshot saved to ${savePath}`);
  await browser.close();
})().catch(console.error);
