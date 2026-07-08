const fs = require('fs');

const lines = fs.readFileSync('/Users/jeikosoh/.gemini/antigravity-ide/brain/ffdfc0ae-5a13-43ab-8085-c15fd56c02b7/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');
let recovered = [];

for(let line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.content && obj.content.includes('1390') && obj.content.includes('diff_block_start')) {
      const diffLines = obj.content.split('\n');
      let inDiffBlock = false;
      for (let dLine of diffLines) {
        if (dLine.startsWith('@@ ')) {
          inDiffBlock = true;
          continue;
        }
        if (inDiffBlock) {
          if (dLine.startsWith('-')) {
            recovered.push(dLine.substring(1));
          } else if (dLine.startsWith(' ')) {
            // context lines are skipped for now, but wait!
            // if we just want the deleted text, skipping context lines is fine 
            // EXCEPT for blank lines. Wait, a deleted blank line starts with '-'
          }
        }
      }
      break;
    }
  } catch(e) {}
}

fs.writeFileSync('recovered_deleted_code.html', recovered.join('\n'));
console.log('Recovered ' + recovered.length + ' lines.');
