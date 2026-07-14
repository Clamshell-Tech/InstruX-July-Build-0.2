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
      
      // Fix ENHANCE button in TextInputWizard
      content = content.replace(
        /text-\[var\(--color-on-accent\)\] bg-\[var\(--color-accent\)\]/,
        '" style={{ background: "var(--color-accent)", color: "var(--color-on-accent)" }}'
      );
      
      // Fix the "Edit details" button
      content = content.replace(
        /text-\[8px\] font-bold text-\[var\(--color-primary\)\]/g,
        'text-[8px] font-bold" style={{ color: "var(--color-text-main)" }}'
      );
      
      // Fix Context Chips dot background
      content = content.replace(
        /style=\{\{ background: isSet \? 'var\(--color-accent\)' : 'var\(--color-text-muted\)' \}\}/g,
        "style={{ background: isSet ? 'var(--color-accent)' : 'rgba(255,255,255,0.2)' }}"
      );

      // Fix Context Chips text color
      content = content.replace(
        /style=\{\{ color: isSet \? 'var\(--color-text-main\)' : 'var\(--color-text-muted\)' \}\}/g,
        "style={{ color: isSet ? 'var(--color-text-main)' : 'rgba(255,255,255,0.7)' }}"
      );

      // Fix Header.jsx
      if (fullPath.endsWith('Header.jsx')) {
        // Fix the credits text which is invisible on bg-white/80
        content = content.replace(/text-\[var\(--color-text-main\)\]/g, "text-slate-800");
        content = content.replace(/style=\{\{ color: 'var\(--color-primary\)'/g, "style={{ color: '#1e3a8a'");
        // Fix the Export button
        content = content.replace(/bg-slate-900 text-\[var\(--color-text-main\)\]/, 'bg-slate-900 text-white');
      }

      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

for (const dir of dirs) processDirectory(dir);
console.log('Fixed Tailwind arbitrary variable issues and Brand Theme contrast issues!');
