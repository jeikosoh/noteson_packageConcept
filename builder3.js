const fs = require('fs');
let text = fs.readFileSync('test_script.js', 'utf8');

// The syntax error is because there's an open `DOMContentLoaded` listener,
// an open `allProdCards.forEach`, and possibly other things.
// I will just use node to count opening and closing brackets to find what's missing.

let openBraces = 0;
let openParens = 0;

for (let i = 0; i < text.length; i++) {
  if (text[i] === '{') openBraces++;
  if (text[i] === '}') openBraces--;
  if (text[i] === '(') openParens++;
  if (text[i] === ')') openParens--;
}
console.log('Braces balance:', openBraces);
console.log('Parens balance:', openParens);
