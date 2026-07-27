const fs = require('fs');
const file = '/Users/jeikosoh/Work Station/002_NOTES_ON/index.css';
let css = fs.readFileSync(file, 'utf8');

css = css.replace(
  /\.dl-box\s*\{([\s\S]*?)\}/,
  (match, p1) => {
    let newRules = p1.replace(/background-color:\s*rgba\(255,\s*64,\s*0,\s*0\.9\);.*?\n/, '');
    return `.dl-box {${newRules}}`;
  }
);

fs.writeFileSync(file, css);
console.log('CSS fixed 2.');
