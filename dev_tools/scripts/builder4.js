const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// The <script> is at the very end of index.html
const scriptStart = html.lastIndexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');
const htmlBeforeScript = html.substring(0, scriptStart);
const htmlAfterScript = html.substring(scriptEnd + 9);

// scriptPart1: Everything in recovered_fixed.html up to line 957 (inclusive)
// which is before "// MAIN PRODUCT CARD DRAG & RESIZE LOGIC"
const recovered = fs.readFileSync('recovered_fixed.html', 'utf8').split('\n');
const scriptPart1 = recovered.slice(0, 957).join('\n');

// scriptPart2: The exact dragging and connection lines logic from extracted_html.log
const extractLog = fs.readFileSync('extracted_html.log', 'utf8');
const marker = 'const newJS = `';
const startIdx = extractLog.indexOf(marker);
let scriptPart2 = '';
if (startIdx > -1) {
  const raw = extractLog.substring(startIdx + marker.length);
  const endMarker = '      // Start the loop\n      requestAnimationFrame(updateConnectionLines);';
  const endIdx = raw.indexOf(endMarker);
  scriptPart2 = raw.substring(0, endIdx + endMarker.length);
}

// scriptPart3: The dynamic label logic which needs to be added AT THE END of DOMContentLoaded
const scriptPart3 = `

      /* =========================================
         DYNAMIC LABEL LOGIC
         ========================================= */
      const dynamicLabel = document.getElementById('dynamic-label');
      let dlAnimFrame;

      const updateDlPosition = (prodCard) => {
        if (dynamicLabel && dynamicLabel.classList.contains('visible') && prodCard) {
          const rect = prodCard.getBoundingClientRect();
          dynamicLabel.style.left = \`\${rect.right - 48}px\`;
          
          const imgEl = prodCard.querySelector('img');
          if (imgEl) {
            const imgRect = imgEl.getBoundingClientRect();
            const dlRect = dynamicLabel.getBoundingClientRect();
            const targetBottom = imgRect.bottom - (imgRect.height * 0.20);
            dynamicLabel.style.top = \`\${targetBottom - dlRect.height}px\`;
            
            const dlTopText = dynamicLabel.querySelector('.dl-top-text');
            if (dlTopText) {
              dlTopText.textContent = imgEl.alt.trim().toUpperCase();
            }
          } else {
            dynamicLabel.style.top = \`\${rect.top}px\`;
          }
        }
        dlAnimFrame = requestAnimationFrame(() => updateDlPosition(prodCard));
      };

      allProdCards.forEach(prodCard => {
        prodCard.addEventListener("mouseenter", () => {
          if(dynamicLabel) dynamicLabel.classList.add('visible');
          if(!dlAnimFrame) updateDlPosition(prodCard);
        });
        prodCard.addEventListener("mouseleave", () => {
          if(dynamicLabel) dynamicLabel.classList.remove('visible');
          cancelAnimationFrame(dlAnimFrame);
          dlAnimFrame = null;
        });
      });
    });`;

const finalScript = '<script>\n' + scriptPart1 + '\n' + scriptPart2 + '\n' + scriptPart3 + '\n</script>';

fs.writeFileSync('index.html', htmlBeforeScript + finalScript + htmlAfterScript);
console.log("Successfully rebuilt full script.");
