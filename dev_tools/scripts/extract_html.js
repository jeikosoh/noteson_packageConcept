const fs = require('fs');

const allCodeLines = fs.readFileSync('all_code.txt', 'utf8').split('\n');

for (let line of allCodeLines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    
    // Look for ReplacementChunks
    if (obj.ReplacementChunks) {
      for (let chunk of obj.ReplacementChunks) {
        if (chunk.ReplacementContent && chunk.ReplacementContent.includes('<!-- FLOATING VIDEO PLAYER -->')) {
          console.log("=== FOUND VIDEO PLAYER ===");
          console.log(chunk.ReplacementContent);
        }
        if (chunk.ReplacementContent && chunk.ReplacementContent.includes('<!-- MAIN PRODUCT CARD -->')) {
          console.log("=== FOUND PRODUCT CARD ===");
          console.log(chunk.ReplacementContent);
        }
      }
    } else if (obj.CodeContent) {
      if (obj.CodeContent.includes('<!-- FLOATING VIDEO PLAYER -->')) {
        console.log("=== FOUND VIDEO PLAYER (CodeContent) ===");
        console.log(obj.CodeContent);
      }
      if (obj.CodeContent.includes('<!-- MAIN PRODUCT CARD -->')) {
        console.log("=== FOUND PRODUCT CARD (CodeContent) ===");
        console.log(obj.CodeContent);
      }
    }
  } catch(e) {}
}
