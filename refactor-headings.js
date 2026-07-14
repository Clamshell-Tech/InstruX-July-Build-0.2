const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'app', 'components', 'StrategySelector.jsx'),
  path.join(__dirname, 'app', 'components', 'SMEQuestionEngine.jsx'),
  path.join(__dirname, 'app', 'components', 'LearningMap.jsx')
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Fix the main headings that sit directly on the background (they should be primary, not text-main)
    // StrategySelector heading
    content = content.replace(
      /<h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-\[var\(--color-text-main\)\] mb-4">/g,
      '<h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-[var(--color-primary)] mb-4">'
    );
    // SMEQuestionEngine heading
    content = content.replace(
      /<h2 className="text-4xl lg:text-6xl font-black mb-4 tracking-tighter text-\[var\(--color-text-main\)\]">/g,
      '<h2 className="text-4xl lg:text-6xl font-black mb-4 tracking-tighter text-[var(--color-primary)]">'
    );
    // LearningMap heading
    content = content.replace(
      /<h2 className="text-3xl lg:text-5xl font-black tracking-tighter text-\[var\(--color-text-main\)\] leading-tight">/g,
      '<h2 className="text-3xl lg:text-5xl font-black tracking-tighter text-[var(--color-primary)] leading-tight">'
    );

    // 2. Fix the subheadings under those headings
    content = content.replace(
      /<p className="text-lg font-medium text-\[var\(--color-text-main\)\]">/g,
      '<p className="text-lg font-medium text-[var(--color-primary)]" style={{ opacity: 0.8 }}>'
    );
    content = content.replace(
      /text-\[var\(--color-text-main\)\](.*?)SME Question Engine/g,
      'text-[var(--color-primary)]$1SME Question Engine'
    );

    // 3. Fix the "Build My Course" button in LearningMap (should use on-accent, not text-main)
    content = content.replace(
      /className="w-full sm:w-auto justify-center flex items-center px-8 py-4 sm:py-3 rounded-\[24px\] sm:rounded-2xl font-black text-\[16px\] sm:text-sm text-\[var\(--color-text-main\)\] shadow-lg/g,
      'className="w-full sm:w-auto justify-center flex items-center px-8 py-4 sm:py-3 rounded-[24px] sm:rounded-2xl font-black text-[16px] sm:text-sm text-[var(--color-on-accent)] shadow-lg'
    );

    // 4. Fix the step labels above the headings
    content = content.replace(
      /className="text-\[10px\] font-black uppercase tracking-widest text-\[var\(--color-text-main\)\]"(.*?)Learning Map/g,
      'className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)]"$1Learning Map'
    );
    
    // 5. Fix the Progress Bar text in SME Question Engine
    content = content.replace(
      /className="text-\[11px\] font-black uppercase tracking-widest text-\[var\(--color-text-main\)\] shrink-0">Progress/g,
      'className="text-[11px] font-black uppercase tracking-widest text-[var(--color-primary)] shrink-0">Progress'
    );
    content = content.replace(
      /className="text-\[11px\] font-black shrink-0 text-\[var\(--color-text-main\)\]">(.*?) answered/g,
      'className="text-[11px] font-black shrink-0 text-[var(--color-primary)]">$1 answered'
    );

    fs.writeFileSync(file, content, 'utf8');
  }
}
console.log('Fixed heading and button contrast for Brand Theme!');
