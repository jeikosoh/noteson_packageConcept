const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Replace the single dynamic-label with two: one for bg, one for text
html = html.replace(
  /<div class="dynamic-label-overlay" id="dynamic-label">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/,
  `<div class="dynamic-label-bg" id="dynamic-label-bg"></div>
  <div class="dynamic-label-overlay" id="dynamic-label">
    <div class="dl-container">
      <div class="dl-top-row">
        <div class="dl-box">
          <span class="dl-top-text">SEASONAL TEA :</span>
        </div>
      </div>
      <div class="dl-bottom-row">
        <span class="dl-bottom-text">MILKY OOLONG</span>
      </div>
    </div>
  </div>`
);

fs.writeFileSync('index.html', html);
