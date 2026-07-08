const fs = require('fs');

// 1. Get the current index.html which has the correct structure (but with dummy script)
let html = fs.readFileSync('index.html', 'utf8');

// Remove the existing <script> ... </script> completely
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>') + 9;
html = html.substring(0, scriptStart) + html.substring(scriptEnd);

// Also remove any existing <div class="main-product-card"> or <div id="floating-vid-player"> just in case
html = html.replace(/<div class="main-product-card[^]*?<\/div>\s*<\/div>\s*<\/div>/g, '');
html = html.replace(/<div id="floating-vid-player"[^]*?<\/video>\s*<\/div>\s*<\/div>\s*<\/div>/g, '');

// 2. Load the HTML pieces
const prodCardHTML = `  <!-- MAIN PRODUCT CARD -->
  <div class="main-product-card" data-line-prefix="prod">
    <!-- Main Card Container -->
    <div class="mpc-container">
      
      <!-- Image (Native Aspect Ratio) -->
      <div class="mpc-image-wrapper">
        <div class="mpc-featured-badge">FEATURED</div>
        <img src="NOTES_ON_WEB/_converts/product_card_preview.png" alt="Seasonal Tea">
      </div>
      
      <!-- Divider -->
      <div class="mpc-divider"></div>

      <!-- Details -->
      <div class="mpc-info">
        <div class="mpc-left-group">
          <span class="mpc-label">&gt;&gt;&gt;</span>
          <span class="mpc-tea-name">Yame Sencha</span>
        </div>
        <span class="mpc-country">JAPAN</span>
      </div>
    </div>
  </div>`;
  
const landCardHTML = `  <!-- LANDSCAPE PRODUCT CARD -->
  <div class="main-product-card landscape-card" data-line-prefix="land">
    <div class="mpc-container">
      <div class="mpc-image-wrapper">
        <div class="mpc-featured-badge">FEATURED</div>
        <img src="NOTES_ON_WEB/_converts/product_card_preview.png" alt="Seasonal Tea">
      </div>
      <div class="mpc-divider"></div>
      <div class="mpc-info">
        <div class="mpc-left-group">
          <span class="mpc-label">&gt;&gt;&gt;</span>
          <span class="mpc-tea-name">Yame Sencha (Land)</span>
        </div>
        <span class="mpc-country">JAPAN</span>
      </div>
    </div>
  </div>`;

const vidPlayerHTML = `  <!-- FLOATING VIDEO PLAYER -->
  <div id="floating-vid-player">
    <div class="vid-player-drag-handle"></div> <!-- 드래그를 위한 핸들 영역 -->

    <!-- Main Video Container and Rectangle 11 Wrapper -->
    <div class="vid-rect11">
      <!-- Fixed distance marks & anchors -->
      <div class="vid-mark top-mark">
        <div class="mark-v"></div><div class="mark-h"></div><div class="mark-dot"></div>
      </div>
      <div class="vid-mark bot-mark">
        <div class="mark-v"></div><div class="mark-h"></div><div class="mark-dot"></div>
      </div>
      <div class="vid-deco frame-wing"></div>
      <div class="vid-deco anchor-tr"></div>
      <div class="vid-deco anchor-bl"></div>
      <div class="vid-deco rec-01"></div>
      <div class="vid-deco dot-02"></div>
      <div class="vid-deco dot-01"></div>
      
      <div class="vid-screen">
        <video width="100%" height="100%" autoplay loop muted playsinline style="object-fit: cover;">
          <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4">
        </video>
      </div>

      <!-- Bottom Bar (Fixed Texts) -->
      <div class="vid-bottom-bar">
        <span class="featured-film">FEATURED FILM &gt;&gt;&gt;</span>
        <span class="art-film-title">ART FILM TITLE</span>
        <div class="timecode-box">00:00:00</div>
      </div>
    </div>
  </div>`;

// 3. Reconstruct the Script
const scriptPart1 = fs.readFileSync('recovered_fixed.html', 'utf8').split('\n').slice(0, 957).join('\n');

const extractHtmlLog = fs.readFileSync('extracted_html.log', 'utf8');
const scriptPart2Marker = 'const newJS = `';
const scriptPart2Start = extractHtmlLog.indexOf(scriptPart2Marker);
let scriptPart2 = '';
if (scriptPart2Start > -1) {
    const raw = extractHtmlLog.substring(scriptPart2Start + scriptPart2Marker.length);
    const endMarker = '      // Start the loop\n      requestAnimationFrame(updateConnectionLines);';
    const endIndex = raw.indexOf(endMarker);
    scriptPart2 = raw.substring(0, endIndex + endMarker.length);
}

// 4. Also need dynamic label logic! The dynamic label logic was AT THE END!
// Wait! `newJS` replaced the dynamic label logic TOO?
// Let's check `newJS` in extracted_html.log!
