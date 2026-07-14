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
      
      // Look for bg-[var(--color-accent)] and text-[var(--color-primary)] in the same class string and replace primary with on-accent
      // Since they could be in any order, we do two passes
      content = content.replace(/bg-\[var\(--color-accent\)\]([^>]*?)text-\[var\(--color-primary\)\]/g, "bg-[var(--color-accent)]$1text-[var(--color-on-accent)]");
      content = content.replace(/text-\[var\(--color-primary\)\]([^>]*?)bg-\[var\(--color-accent\)\]/g, "text-[var(--color-on-accent)]$1bg-[var(--color-accent)]");
      
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

for (const dir of dirs) processDirectory(dir);
console.log('Fixed Tailwind button text classes!');
