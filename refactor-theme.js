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
      
      // Replace exact color matches (case insensitive)
      content = content.replace(/#1e3a8a/gi, 'var(--color-primary)');
      content = content.replace(/#FFCC31/gi, 'var(--color-accent)');
      
      // Some classes might use text-[#1e3a8a] which becomes text-[var(--color-primary)]
      // Tailwind allows this!
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
}

for (const dir of directories) {
  processDirectory(dir);
}
console.log('Done refactoring colors!');
