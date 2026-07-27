const fs = require('fs');

const line = fs.readFileSync('full_diff_fixed.txt', 'utf8');
let recovered = [];

try {
  const obj = JSON.parse(line);
  if (obj.content) {
    const diffLines = obj.content.split('\n');
    let inDiffBlock = false;
    for (let dLine of diffLines) {
      if (dLine.startsWith('@@ ')) {
        inDiffBlock = true;
        continue;
      }
      if (inDiffBlock) {
        if (dLine.startsWith('-') || dLine.startsWith(' ')) {
          recovered.push(dLine.substring(1));
        }
      }
    }
  }
} catch(e) {
  console.error(e);
}

fs.writeFileSync('recovered_fixed.html', recovered.join('\n'));
console.log('Recovered ' + recovered.length + ' lines.');
