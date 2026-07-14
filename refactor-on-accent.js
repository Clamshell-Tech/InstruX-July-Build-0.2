const fs = require('fs');
const path = require('path');
const dirs = [path.join(__dirname, 'app', 'components'), path.join(__dirname, 'app', 'app-new')];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Anywhere color is primary and background is accent/bg, change color to color-on-accent
      content = content.replace(/background:\s*'var\(--color-accent\)',\s*color:\s*'var\(--color-primary\)'/g, "background: 'var(--color-accent)', color: 'var(--color-on-accent)'");
      content = content.replace(/background:\s*'var\(--color-bg\)',\s*color:\s*'var\(--color-primary\)'/g, "background: 'var(--color-bg)', color: 'var(--color-on-accent)'");
      
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

for (const dir of dirs) processDirectory(dir);
console.log('Done mapping on-accent text colors!');
