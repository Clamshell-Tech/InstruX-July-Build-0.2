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
      
      // Update hardcoded white translucent borders to dynamic borders
      content = content.replace(/rgba\(255,255,255,0\.12\)/g, 'var(--color-border)');
      content = content.replace(/rgba\(255,255,255,0\.15\)/g, 'var(--color-border)');
      
      // Update specific hardcoded shadows to the dynamic shadow variable
      content = content.replace(/rgba\(30,58,138,0\.4\)/g, 'var(--color-shadow)');
      
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

for (const dir of dirs) {
  processDirectory(dir);
}
console.log('Done refactoring borders and shadows!');
