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
      
      // Fix background mapping: Change background primary to surface
      content = content.replace(/background:\s*'var\(--color-primary\)'/g, "background: 'var(--color-surface)'");
      content = content.replace(/backgroundColor:\s*'var\(--color-primary\)'/g, "backgroundColor: 'var(--color-surface)'");
      
      // Some classes might use bg-[var(--color-primary)]
      content = content.replace(/bg-\[var\(--color-primary\)\]/g, "bg-[var(--color-surface)]");
      
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

for (const dir of dirs) processDirectory(dir);
console.log('Done mapping surface colors!');
