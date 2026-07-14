const fs = require('fs');
const path = require('path');
const dirs = [path.join(__dirname, 'app', 'components')];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('StrategySelector.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Fix StrategySelector wrapper background
      content = content.replace(/background:\s*'var\(--color-accent\)'([^}]*)flex flex-col/, "background: 'var(--color-bg)'$1flex flex-col");
      content = content.replace(/<section className="relative overflow-y-auto h-full w-full no-scrollbar flex flex-col" style={{ background: 'var(--color-accent)' }}>/, "<section className=\"relative overflow-y-auto h-full w-full no-scrollbar flex flex-col\" style={{ background: 'var(--color-bg)' }}>");

      // Fix StrategySelector active/inactive cards
      content = content.replace(/background:\s*isActive \? 'var\(--color-accent\)' : 'var\(--color-primary\)'/g, "background: isActive ? 'var(--color-accent)' : 'var(--color-surface)'");
      content = content.replace(/color:\s*isActive \? 'var\(--color-primary\)' : 'var\(--color-text-main\)'/g, "color: isActive ? 'var(--color-on-accent)' : 'var(--color-text-main)'");
      
      // Fix text classes inside the card if there's any text-[var(--color-primary)]
      content = content.replace(/text-\[var\(--color-primary\)\]/g, "text-[var(--color-text-main)]");
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log('Fixed StrategySelector.jsx');
    } else if (fullPath.endsWith('SMEQuestionEngine.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Fix SME Question card backgrounds (use surface instead of primary)
      content = content.replace(/background:\s*collapsed\[i\] \? 'rgba\(30,58,138,0\.5\)' : 'var\(--color-primary\)'/g, "background: collapsed[i] ? 'var(--color-overlay)' : 'var(--color-surface)'");
      
      // Fix hardcoded text colors in the badges
      content = content.replace(/color:\s*isFlagged \? 'var\(--color-primary\)' : 'var\(--color-text-muted\)'/g, "color: isFlagged ? 'var(--color-on-accent)' : 'var(--color-text-muted)'");
      content = content.replace(/text-\[var\(--color-primary\)\]/g, "text-[var(--color-text-main)]");

      fs.writeFileSync(fullPath, content, 'utf8');
      console.log('Fixed SMEQuestionEngine.jsx');
    } else if (fullPath.endsWith('LearningMap.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Fix Confirm button background and text in Learning Map
      content = content.replace(/bg-\[var\(--color-accent\)\](.*?)text-\[var\(--color-primary\)\]/g, "bg-[var(--color-primary)]$1text-[var(--color-on-accent)]");
      content = content.replace(/text-\[var\(--color-primary\)\](.*?)bg-\[var\(--color-accent\)\]/g, "text-[var(--color-on-accent)]$1bg-[var(--color-primary)]");
      // Fallback for simple class replacements
      content = content.replace(/text-\[var\(--color-primary\)\]/g, "text-[var(--color-text-main)]");

      fs.writeFileSync(fullPath, content, 'utf8');
      console.log('Fixed LearningMap.jsx');
    }
  }
}

for (const dir of dirs) processDirectory(dir);
