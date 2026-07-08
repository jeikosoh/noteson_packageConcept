const fs = require('fs');
const file = '/Users/jeikosoh/Work Station/002_NOTES_ON/index.css';
let css = fs.readFileSync(file, 'utf8');

// 1. Fix line height
css = css.replace(
  /(\.dl-bottom-text\s*\{[^}]*?line-height:\s*)0\.4(;)/,
  '$1 1.2$2'
);

// 2. Remove mix-blend-mode from container
css = css.replace(
  /(\.dynamic-label-overlay\s*\{[^}]*?)mix-blend-mode:\s*overlay;/,
  '$1'
);
css = css.replace(
  /(\.dl-container\s*\{[^}]*?)mix-blend-mode:\s*overlay;/,
  '$1'
);

// 3. Update dl-box to use pseudo-element for background
css = css.replace(
  /\.dl-box\s*\{([\s\S]*?)\}/,
  (match, p1) => {
    // Remove background color from dl-box
    let newRules = p1.replace(/background-color:\s*var\(--secondary-orange\);/, '');
    // Ensure position: relative exists
    if (!newRules.includes('position: relative;')) {
      newRules += '\n  position: relative;\n';
    }
    return `.dl-box {${newRules}}\n.dl-box::before {\n  content: "";\n  position: absolute;\n  top: 0; left: 0; right: 0; bottom: 0;\n  background-color: var(--secondary-orange);\n  mix-blend-mode: overlay;\n  opacity: 0.9;\n  z-index: -1;\n}`;
  }
);

fs.writeFileSync(file, css);
console.log('CSS fixed.');
