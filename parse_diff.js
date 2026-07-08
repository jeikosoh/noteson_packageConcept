const fs = require('fs');

const jsonText = fs.readFileSync('full_diff.txt', 'utf8');
const lines = jsonText.split('\n');

let diffContent = '';
for (let line of lines) {
  if (line.trim().startsWith('{"step_index":')) {
    try {
      const obj = JSON.parse(line);
      diffContent = obj.content;
      break;
    } catch(e) {}
  }
}

if (!diffContent) {
  console.log("No diff content found");
  process.exit(1);
}

const diffLines = diffContent.split('\n');
let recovered = [];
let inDiffBlock = false;

for (let i = 0; i < diffLines.length; i++) {
  const line = diffLines[i];
  if (line.startsWith('@@ ')) {
    inDiffBlock = true;
    continue;
  }
  if (inDiffBlock) {
    if (line.startsWith('-')) {
      recovered.push(line.substring(1));
    }
  }
}

fs.writeFileSync('recovered_deleted_code.html', recovered.join('\n'));
console.log('Recovered ' + recovered.length + ' lines.');
