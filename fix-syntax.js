const fs = require('fs');
const path = require('path');

const filesToFix = [
  path.join(__dirname, 'app', 'components', 'InstantAIWizard.jsx'),
  path.join(__dirname, 'app', 'components', 'TextInputWizard.jsx')
];

for (const file of filesToFix) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
      /" style=\{\{ background: "var\(--color-accent\)", color: "var\(--color-on-accent\)" \}\} hover:brightness-110"/g,
      ' hover:brightness-110" style={{ background: "var(--color-accent)", color: "var(--color-on-accent)" }}'
    );
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed syntax error in ' + path.basename(file));
  }
}
