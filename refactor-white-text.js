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
      
      // Fix hardcoded translucent white text colors
      content = content.replace(/color:\s*'rgba\(255,255,255,0\.35\)'/g, "color: 'var(--color-text-muted)'");
      content = content.replace(/color:\s*'rgba\(255,255,255,0\.6\)'/g, "color: 'var(--color-text-main)'");
      content = content.replace(/color:\s*'rgba\(255,255,255,0\.85\)'/g, "color: 'var(--color-text-main)'");
      
      // Also look for translucent white borders or backgrounds I missed
      content = content.replace(/border:\s*'1px solid rgba\(255,255,255,0\.2\)'/g, "border: '1px solid var(--color-border)'");
      content = content.replace(/background:\s*'rgba\(255,255,255,0\.1\)'/g, "background: 'var(--color-overlay)'");
      content = content.replace(/background:\s*'rgba\(255,255,255,0\.05\)'/g, "background: 'var(--color-overlay)'");
      
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

for (const dir of dirs) processDirectory(dir);
console.log('Fixed invisible white text classes!');
