const fs = require('fs');
const path = require('path');

// 1. Fix StrategySelector Confirm Button
const strategyFile = path.join(__dirname, 'app', 'components', 'StrategySelector.jsx');
if (fs.existsSync(strategyFile)) {
  let content = fs.readFileSync(strategyFile, 'utf8');
  content = content.replace(
    /className="w-full py-5 rounded-\[24px\] font-black text-base transition-all text-\[var\(--color-text-main\)\] hover:-translate-y-0\.5"/,
    'className="w-full py-5 rounded-[24px] font-black text-base transition-all text-[var(--color-on-accent)] hover:-translate-y-0.5"'
  );
  fs.writeFileSync(strategyFile, content, 'utf8');
  console.log('Fixed StrategySelector Confirm button text color');
}

// 2. Fix TextInputWizard Chips
const wizardFile = path.join(__dirname, 'app', 'components', 'TextInputWizard.jsx');
if (fs.existsSync(wizardFile)) {
  let content = fs.readFileSync(wizardFile, 'utf8');
  
  // Fix the border color of selected chips (it was a hardcoded green)
  content = content.replace(/border: `1px solid \$\{isSet \? 'rgba\(74,222,128,0\.3\)' : 'var\(--color-border\)'\}`/g, "border: `1px solid ${isSet ? 'var(--color-accent-translucent)' : 'var(--color-border)'}`");
  
  // Fix the dot color for empty chips (was translucent white)
  content = content.replace(/style=\{\{ background: isSet \? pill\.color : 'rgba\(255,255,255,0\.25\)' \}\}/g, "style={{ background: isSet ? 'var(--color-accent)' : 'var(--color-text-muted)' }}");
  
  // Fix the text color for selected chips (was translucent white)
  content = content.replace(/style=\{\{ color: isSet \? 'rgba\(255,255,255,0\.85\)' : 'var\(--color-text-muted\)' \}\}/g, "style={{ color: isSet ? 'var(--color-text-main)' : 'var(--color-text-muted)' }}");
  
  fs.writeFileSync(wizardFile, content, 'utf8');
  console.log('Fixed TextInputWizard Context chips');
}
