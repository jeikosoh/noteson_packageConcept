const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Inject dataStore.js script
if (!html.includes('<script src="dataStore.js"></script>')) {
  html = html.replace('<script>', '<script src="dataStore.js"></script>\n  <script>\n    const appData = window.notesOnDataStore ? window.notesOnDataStore.loadData() : null;\n');
}

// 2. Add initAppContent function to update basic DOM
const initAppContentStr = `
    function initAppContent() {
      if(!appData) return;
      // Tea of the month
      const t = appData.teaOfTheMonth;
      document.querySelector('.tea-title').innerHTML = t.name;
      document.querySelector('.tea-desc').innerHTML = \`\${t.description.country} &bull; \${t.description.caffeine ? 'Caffeine' : 'Decaf'} &bull; \${t.description.tasteNotes.join(' &bull; ')}\`;
      
      const hotRow = document.querySelectorAll('.brew-row')[0];
      if (hotRow && t.recipes.hot.active) {
         hotRow.style.display = 'flex';
         const spans = hotRow.querySelectorAll('.spec-item span');
         spans[0].innerText = t.recipes.hot.amount;
         spans[1].innerText = t.recipes.hot.temp;
         spans[2].innerText = t.recipes.hot.time;
      } else if (hotRow) { hotRow.style.display = 'none'; }
      
      const icedRow = document.querySelectorAll('.brew-row')[1];
      if (icedRow && t.recipes.iced.active) {
         icedRow.style.display = 'flex';
         const spans = icedRow.querySelectorAll('.spec-item span');
         spans[0].innerText = t.recipes.iced.amount;
         spans[1].innerText = t.recipes.iced.temp;
         spans[2].innerText = t.recipes.iced.time;
      } else if (icedRow) { icedRow.style.display = 'none'; }
      
      document.querySelector('.tea-subtitle').innerHTML = t.story.title;
      document.querySelector('.tea-desc-full').innerHTML = t.story.body.replace(/\\n/g, '<br>');
      
      // Video
      const videoEl = document.querySelector('.floating-vid-container video');
      if (videoEl) videoEl.src = appData.videoPlayer.videoUrl;
      const vidTitle = document.querySelector('.vid-title');
      if (vidTitle) vidTitle.innerText = appData.videoPlayer.title;
      
      // Product Cards
      const cards = document.querySelectorAll('.main-product-card');
      if (cards.length >= 2) {
        // Card 1
        const c1 = appData.productCards[0];
        cards[0].querySelector('img').src = c1.image;
        cards[0].querySelector('.mpc-tea-name').innerText = c1.name;
        // Label/badge handling would be more complex, we'll just update text for now
        const badge1 = cards[0].querySelector('.mpc-featured-badge');
        if (badge1) {
          badge1.style.display = c1.badge.active ? 'block' : 'none';
          badge1.innerText = c1.badge.text;
          badge1.style.backgroundColor = c1.badge.bgColor;
          badge1.style.color = c1.badge.textColor;
        }
        cards[0].dataset.dlTitle = c1.dynamicLabel.title;
        cards[0].dataset.dlName = c1.dynamicLabel.productName;
        
        // Card 2
        const c2 = appData.productCards[1];
        cards[1].querySelector('img').src = c2.image;
        cards[1].querySelector('.mpc-tea-name').innerText = c2.name;
        const badge2 = cards[1].querySelector('.mpc-featured-badge');
        if (badge2) {
          badge2.style.display = c2.badge.active ? 'block' : 'none';
          badge2.innerText = c2.badge.text;
          badge2.style.backgroundColor = c2.badge.bgColor;
          badge2.style.color = c2.badge.textColor;
        }
        cards[1].dataset.dlTitle = c2.dynamicLabel.title;
        cards[1].dataset.dlName = c2.dynamicLabel.productName;
      }
    }
    initAppContent();
`;

html = html.replace('document.addEventListener(\'DOMContentLoaded\', () => {', 'document.addEventListener(\'DOMContentLoaded\', () => {\n' + initAppContentStr);

// 3. Calendar events update
const oldEventsRegex = /const allEvents = \[\s*\{[^}]*\}\s*\];/g;
const newEvents = `const allEvents = appData ? appData.calendar.events.map(ev => {
        const [y, m, d] = ev.date.split('-');
        return {
          year: parseInt(y),
          month: parseInt(m) - 1,
          date: parseInt(d),
          title: ev.title,
          image: ev.thumbnail,
          location: ev.location
        };
      }) : [];`;
html = html.replace(oldEventsRegex, newEvents);

// 4. Update dynamic label to read from dataset
const oldDlUpdate = `document.querySelector('.dl-bottom-text').textContent = "MILKY OOLONG"; // 하드코딩 예시`;
const newDlUpdate = `
          const tTitle = prodCard.dataset.dlTitle || "SEASONAL TEA :";
          const tName = prodCard.dataset.dlName || "MILKY OOLONG";
          document.querySelector('.dl-top-text').innerText = tTitle;
          document.querySelector('.dl-bottom-text').innerText = tName;
`;
html = html.replace(oldDlUpdate, newDlUpdate);

fs.writeFileSync('index.html', html);
console.log("Updated index.html");
