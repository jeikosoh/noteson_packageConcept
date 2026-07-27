const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// just grab everything before the <script>
const beforeScript = html.substring(0, html.lastIndexOf('<script>'));

let openDivs = 0;
let closeDivs = 0;

for (let i = 0; i < beforeScript.length; i++) {
  if (beforeScript.substring(i, i+4) === '<div') openDivs++;
  if (beforeScript.substring(i, i+5) === '</div') closeDivs++;
}
console.log('Open divs:', openDivs);
console.log('Close divs:', closeDivs);
