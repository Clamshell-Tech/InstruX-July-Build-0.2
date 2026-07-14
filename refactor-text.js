const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, 'app', 'components'),
  path.join(__dirname, 'app', 'app-new')
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace text-white with a custom variable
      content = content.replace(/text-white/g, 'text-[var(--color-text-main)]');
      
      // Replace specific inline white colors
      content = content.replace(/color:\s*'white'/g, "color: 'var(--color-text-main)'");
      content = content.replace(/color:\s*"white"/g, "color: 'var(--color-text-main)'");
      content = content.replace(/color:\s*'#ffffff'/gi, "color: 'var(--color-text-main)'");
      content = content.replace(/color:\s*"#ffffff"/gi, "color: 'var(--color-text-main)'");
      
      // Also update some background opacities to use borders correctly in light mode
      // This is safe to run repeatedly
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Updated text colors in ${file}`);
    }
  }
}

for (const dir of directories) {
  processDirectory(dir);
}
console.log('Done refactoring text colors!');
