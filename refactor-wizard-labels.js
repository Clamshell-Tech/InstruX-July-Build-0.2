const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'app', 'components', 'TextInputWizard.jsx');

if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  // Fix the Context Chips to use var(--color-text-muted) instead of hardcoded white rgba(255,255,255,0.7)
  // so they are readable in the Light Theme and look correct in the Brand Theme.
  content = content.replace(
    /style=\{\{ color: isSet \? 'var\(--color-text-main\)' : 'rgba\(255,255,255,0\.7\)' \}\}/g,
    "style={{ color: isSet ? 'var(--color-text-main)' : 'var(--color-text-muted)' }}"
  );
  content = content.replace(
    /style=\{\{ background: isSet \? 'var\(--color-accent\)' : 'rgba\(255,255,255,0\.2\)' \}\}/g,
    "style={{ background: isSet ? 'var(--color-accent)' : 'var(--color-overlay)' }}"
  );

  // Fix the "Source Material" label which sits on var(--color-surface) (Deep Blue)
  // text-[var(--color-primary)] is invisible on Deep Blue. We need it to be var(--color-accent) (Yellow).
  content = content.replace(
    /<label className="text-\[9px\] font-black uppercase tracking-widest text-\[var\(--color-primary\)\]">Source Material<\/label>/g,
    '<label className="text-[9px] font-black uppercase tracking-widest text-[var(--color-accent)]">Source Material</label>'
  );

  // Fix the "paste notes..." instruction text next to it. It was changed to text-[var(--color-text-main)] 
  // but it originally was light blue. text-[var(--color-text-muted)] is better here.
  content = content.replace(
    /<span className="text-\[9px\] font-medium text-\[var\(--color-text-main\)\]">paste notes/g,
    '<span className="text-[9px] font-medium text-[var(--color-text-muted)]">paste notes'
  );

  // Fix the "Training Context" label inside the card
  content = content.replace(
    /<span className="text-\[9px\] font-black uppercase tracking-widest text-\[var\(--color-primary\)\]">Training Context<\/span>/g,
    '<span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-accent)]">Training Context</span>'
  );
  
  // Fix "Extracted text preview" label
  content = content.replace(
    /<p className="text-\[8px\] font-black uppercase tracking-wider text-\[var\(--color-primary\)\] mb-1">Extracted text preview<\/p>/g,
    '<p className="text-[8px] font-black uppercase tracking-wider text-[var(--color-accent)] mb-1">Extracted text preview</p>'
  );

  // Fix "Edit details" text color in the button to be perfectly visible on the dark blue chip card
  // It was previously changed to var(--color-text-main) but maybe it should be var(--color-accent) to match the spark.
  content = content.replace(
    /<span className="text-\[8px\] font-bold" style=\{\{ color: 'var\(--color-text-main\)' \}\}> Edit details <\/span>/g,
    '<span className="text-[8px] font-bold" style={{ color: \'var(--color-text-main)\' }}> Edit details </span>'
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed invisible labels and chips in TextInputWizard.jsx');
}
