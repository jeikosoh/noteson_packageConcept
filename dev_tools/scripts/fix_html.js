const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetStr = `<div class="timecode-box">00:00:00</div>
      </div>`;
const replacementStr = `<div class="timecode-box">00:00:00</div>
        <div class="vid-progress-bg">
          <div class="vid-progress-fill"></div>
        </div>
      </div>`;

html = html.replace(targetStr, replacementStr);
fs.writeFileSync('index.html', html);
console.log("Fixed progress bar HTML");
