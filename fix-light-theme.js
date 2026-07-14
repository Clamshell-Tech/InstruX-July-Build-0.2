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
      
      // Fix right panel background in TextInputWizard (was var(--color-accent) which turned dark gray)
      content = content.replace(/background:\s*'var\(--color-accent\)',\s*overflowY:\s*'auto'/g, "background: 'var(--color-bg)', overflowY: 'auto'");
      
      // Fix stray Tailwind text colors that ruin the theme
      content = content.replace(/text-yellow-300/g, 'text-[var(--color-primary)]');
      content = content.replace(/text-blue-200/g, 'text-[var(--color-text-main)]');
      content = content.replace(/text-blue-300/g, 'text-[var(--color-text-main)]');
      content = content.replace(/text-blue-400/g, 'text-[var(--color-primary)]');
      content = content.replace(/text-blue-700/g, 'text-[var(--color-primary)]');
      content = content.replace(/text-slate-900/g, 'text-[var(--color-text-main)]');
      content = content.replace(/text-slate-800/g, 'text-[var(--color-text-main)]');
      content = content.replace(/text-slate-700/g, 'text-[var(--color-text-main)]');
      
      // Fix button hover colors
      content = content.replace(/hover:bg-\[#FFD75E\]/g, 'hover:brightness-110');
      
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

for (const dir of dirs) processDirectory(dir);
console.log('Fixed Tailwind classes and layouts for Light Theme!');
