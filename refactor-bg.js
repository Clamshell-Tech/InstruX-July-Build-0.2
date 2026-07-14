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
      
      // Fix app wrappers in page.jsx
      content = content.replace(/backgroundColor:\s*'var\(--color-accent\)'/g, "backgroundColor: 'var(--color-bg)'");
      
      // Fix main sections in components
      content = content.replace(/<section className="([^"]*)"\s*style={{ background: 'var\(--color-accent\)'/g, "<section className=\"$1\" style={{ background: 'var(--color-bg)'");
      content = content.replace(/<div className="([^"]*h-screen[^"]*)"\s*style={{ background: 'var\(--color-accent\)'/g, "<div className=\"$1\" style={{ background: 'var(--color-bg)'");
      content = content.replace(/<div className="([^"]*h-full[^"]*)"\s*style={{ background: 'var\(--color-accent\)'/g, function(match, p1) {
        if (p1.includes('w-full') || p1.includes('lg:w-1/2')) return `<div className="${p1}" style={{ background: 'var(--color-bg)'`;
        return match;
      });
      content = content.replace(/minHeight:\s*'calc\(100vh - 5rem\)',\s*background:\s*'var\(--color-accent\)'/g, "minHeight: 'calc(100vh - 5rem)', background: 'var(--color-bg)'");
      
      // Fix WizardHeader
      content = content.replace(/<header className="([^"]*)" style={{ background: 'var\(--color-accent\)'/g, "<header className=\"$1\" style={{ background: 'var(--color-bg)'");
      content = content.replace(/<div className="([^"]*shrink-0)" style={{ background: 'var\(--color-accent\)'/g, "<div className=\"$1\" style={{ background: 'var(--color-bg)'");

      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

for (const dir of directories) {
  processDirectory(dir);
}
console.log('Done refactoring background colors!');
