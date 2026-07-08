const fs = require('fs');

const jsonText = fs.readFileSync('full_diff.txt', 'utf8');

try {
  const obj = JSON.parse(jsonText.trim());
  const diffContent = obj.content;
  
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
} catch(e) {
  console.error("Parse error:", e);
}
