const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove dummy scripts
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>') + 9;
if (scriptStart > -1 && scriptEnd > scriptStart) {
  html = html.substring(0, scriptStart) + html.substring(scriptEnd);
}

// 2. Remove existing main-product-card and floating-vid-player if they got stuck
html = html.replace(/<div class="main-product-card[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, '');
html = html.replace(/<div id="floating-vid-player"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, '');

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

let recoveredScript = fs.readFileSync('recovered_fixed.html', 'utf8');
const lastIndex = recoveredScript.lastIndexOf('} els');
recoveredScript = recoveredScript.substring(0, lastIndex);

const remainingScript = `} else {
              dynamicLabel.style.top = \`\${rect.top}px\`;
            }
            
            const dlTopText = dynamicLabel.querySelector('.dl-top-text');
            if (imgEl && dlTopText) {
              dlTopText.textContent = imgEl.alt.trim().toUpperCase();
            }
          }
          dlAnimFrame = requestAnimationFrame(() => updateDlPosition(prodCard));
        };

    });
  </script>`;

const fullScriptBlock = recoveredScript + remainingScript;

// 3. Inject at the end of the body
const bodyEndIndex = html.lastIndexOf('</body>');
const finalHtml = html.substring(0, bodyEndIndex) + 
  '\n' + prodCardHTML + '\n\n' + landCardHTML + '\n\n' + vidPlayerHTML + '\n\n' + fullScriptBlock + '\n' +
  html.substring(bodyEndIndex);

fs.writeFileSync('index.html', finalHtml);
console.log("Successfully rebuilt index.html");
