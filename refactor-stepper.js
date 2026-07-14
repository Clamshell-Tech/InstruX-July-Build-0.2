const fs = require('fs');
const path = require('path');
const dirs = [path.join(__dirname, 'app', 'components')];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Fix specific hardcoded overlay backgrounds and text colors in the stepper
      content = content.replace(/rgba\(255,255,255,0\.06\)/g, 'var(--color-overlay)');
      content = content.replace(/rgba\(255,255,255,0\.04\)/g, 'var(--color-overlay)');
      content = content.replace(/rgba\(255,255,255,0\.03\)/g, 'var(--color-overlay)');
      content = content.replace(/rgba\(255,255,255,0\.07\)/g, 'var(--color-overlay)');
      
      // Fix text-muted
      content = content.replace(/rgba\(147,197,253,0\.8\)/g, 'var(--color-text-muted)');
      
      // Fix borders (some used 0.09, 0.07, 0.05 opacity)
      content = content.replace(/rgba\(255,255,255,0\.09\)/g, 'var(--color-border)');
      content = content.replace(/rgba\(255,255,255,0\.07\)/g, 'var(--color-border)');
      content = content.replace(/rgba\(255,255,255,0\.05\)/g, 'var(--color-border)');
      content = content.replace(/rgba\(255,255,255,0\.1\)/g, 'var(--color-border)');
      
      // Fix translucent active state box shadows and backgrounds
      content = content.replace(/rgba\(255,204,49,0\.3\)/g, 'var(--color-accent-translucent)');
      content = content.replace(/rgba\(255,204,49,0\.15\)/g, 'var(--color-accent-translucent)');
      content = content.replace(/rgba\(255,204,49,0\.5\)/g, 'var(--color-accent-translucent)');
      
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

for (const dir of dirs) processDirectory(dir);
console.log('Done refactoring stepper components!');
