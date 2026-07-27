const fs = require('fs');
const lines = fs.readFileSync('all_code.txt', 'utf8').split('\n');

for (let line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.ReplacementChunks) {
      for (let chunk of obj.ReplacementChunks) {
        if (chunk.ReplacementContent && chunk.ReplacementContent.includes('vid-progress-bar')) {
          console.log("FOUND IN CHUNKS:");
          console.log(chunk.ReplacementContent);
        }
      }
    } else if (obj.CodeContent) {
      if (obj.CodeContent.includes('vid-progress-bar')) {
        console.log("FOUND IN CODE:");
        console.log(obj.CodeContent);
      }
    }
  } catch(e) {}
}
