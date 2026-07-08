const fs = require('fs');

const scriptContent = `
  <script>
    /* =========================================
       SPA ROUTING LOGIC
       ========================================= */
    document.addEventListener('DOMContentLoaded', () => {
      // Mock Authentication State
      window.isLoggedIn = false;

      const homeBtn = document.querySelector('.home-btn');
      const aboutBtn = document.querySelector('.about-btn');
      const loginBtn = document.querySelector('.login-action-btn');
      const signupBtn = document.querySelector('.signup-action-btn');
      const accountBtn = document.getElementById('account-btn');
      
      const viewHome = document.getElementById('view-home');
      const viewAbout = document.getElementById('view-about');
      const viewLogin = document.getElementById('view-login');
      const viewSignup = document.getElementById('view-signup');
      const viewProfile = document.getElementById('view-profile');

      function switchView(viewName) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        if (accountBtn) accountBtn.classList.remove('active');
        
        document.querySelectorAll('.view-section').forEach(el => {
          el.style.display = 'none';
          el.classList.remove('active');
        });

        if (viewName === 'home') {
          if(homeBtn) homeBtn.classList.add('active');
          if(viewHome) { viewHome.style.display = 'block'; viewHome.classList.add('active'); }
        } else if (viewName === 'about') {
          if(aboutBtn) aboutBtn.classList.add('active');
          if(viewAbout) { viewAbout.style.display = 'block'; viewAbout.classList.add('active'); }
        } else if (viewName === 'login') {
          if (accountBtn) accountBtn.classList.add('active');
          if(viewLogin) { viewLogin.style.display = 'flex'; viewLogin.classList.add('active'); }
        } else if (viewName === 'signup') {
          if (accountBtn) accountBtn.classList.add('active');
          if(viewSignup) { viewSignup.style.display = 'flex'; viewSignup.classList.add('active'); }
        } else if (viewName === 'profile') {
          if (accountBtn) accountBtn.classList.add('active');
          if(viewProfile) { viewProfile.style.display = 'flex'; viewProfile.classList.add('active'); }
        }
      }

      if(homeBtn) { homeBtn.addEventListener('click', (e) => { e.preventDefault(); switchView('home'); }); }
      if(aboutBtn) { aboutBtn.addEventListener('click', (e) => { e.preventDefault(); switchView('about'); }); }
      if(loginBtn) { loginBtn.addEventListener('click', (e) => { e.preventDefault(); switchView('login'); }); }
      if(signupBtn) { signupBtn.addEventListener('click', (e) => { e.preventDefault(); switchView('signup'); }); }
      if(accountBtn) {
        accountBtn.addEventListener('click', (e) => {
          if (e.target.closest('.account-popup')) return;
          if (window.isLoggedIn) switchView('profile');
          else switchView('login');
        });
      }

      const loginForm = document.querySelector('#view-login .auth-form');
      if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          window.isLoggedIn = true;
          document.querySelector('.logged-out-menu').classList.remove('active');
          document.querySelector('.logged-in-menu').classList.add('active');
          switchView('profile');
        });
      }

      const logoutBtn = document.querySelector('.logout-action-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          window.isLoggedIn = false;
          document.querySelector('.logged-in-menu').classList.remove('active');
          document.querySelector('.logged-out-menu').classList.add('active');
          switchView('home');
        });
      }

      /* =========================================
         CALENDAR LOGIC
         ========================================= */
      const calendarDays = document.querySelectorAll('.calendar-day');
      const sidebar = document.getElementById('event-detail-sidebar');
      const closeSidebarBtn = document.getElementById('close-sidebar-btn');
      
      if(calendarDays) {
        calendarDays.forEach(day => {
          day.addEventListener('click', () => {
            calendarDays.forEach(d => d.classList.remove('selected'));
            day.classList.add('selected');
            if (sidebar) sidebar.classList.add('active');
          });
        });
      }
      
      if(closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', () => {
          if (sidebar) sidebar.classList.remove('active');
          calendarDays.forEach(d => d.classList.remove('selected'));
        });
      }

      /* =========================================
         FLOATING VIDEO PLAYER DRAG LOGIC
         ========================================= */
      let globalPopupZIndex = 2000;
      const vidPlayer = document.getElementById('floating-vid-player');
      
      if (vidPlayer) {
        const dragHandle = vidPlayer; // Or a specific handle if exists
        let isDraggingVid = false;
        let vidOffsetX, vidOffsetY;

        dragHandle.addEventListener('mousedown', (e) => {
          if (e.target.closest('video') || e.target.closest('.resizer')) return;
          isDraggingVid = true;
          globalPopupZIndex++;
          vidPlayer.style.zIndex = globalPopupZIndex;
          
          const rect = vidPlayer.getBoundingClientRect();
          vidOffsetX = e.clientX - rect.left;
          vidOffsetY = e.clientY - rect.top;
        });

        document.addEventListener('mousemove', (e) => {
          if (!isDraggingVid) return;
          let newX = e.clientX - vidOffsetX;
          let newY = e.clientY - vidOffsetY;
          
          vidPlayer.style.left = newX + 'px';
          vidPlayer.style.top = newY + 'px';
          vidPlayer.style.right = 'auto';
        });

        document.addEventListener('mouseup', () => {
          isDraggingVid = false;
        });
      }

      /* =========================================
         PRODUCT CARDS LOGIC & DRAGGING
         ========================================= */
      const allProdCards = document.querySelectorAll('.main-product-card');
      const mainRect = document.querySelector('.main') ? document.querySelector('.main').getBoundingClientRect() : { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
      const leftPanel = document.querySelector('.left-panel');
      const leftPanelRect = leftPanel ? leftPanel.getBoundingClientRect() : { right: 600 };

      const placeAllCardsRandomly = () => {
        const obstacles = [vidPlayer].filter(Boolean);

        const isOverlapping = (rect1) => {
          for (const obs of obstacles) {
            const rect2 = obs.getBoundingClientRect();
            const margin = 20;
            if (!(rect1.right + margin < rect2.left || rect1.left > rect2.right + margin || rect1.bottom + margin < rect2.top || rect1.top > rect2.bottom + margin)) {
              return true;
            }
          }
          return false;
        };

        allProdCards.forEach(card => {
          const cardWidth = card.getBoundingClientRect().width || 177;
          const cardHeight = card.getBoundingClientRect().height || 280;
          
          let minX = leftPanelRect.right + 24;
          let maxX = mainRect.right - cardWidth - 24;
          let minY = mainRect.top + 24;
          let maxY = mainRect.bottom - cardHeight - 24;

          let finalX = minX;
          let finalY = minY;
          let foundSpot = false;

          if (maxX > minX && maxY > minY) {
            for (let attempts = 0; attempts < 100; attempts++) {
              finalX = minX + Math.random() * (maxX - minX);
              finalY = minY + Math.random() * (maxY - minY);
              if (!isOverlapping({ left: finalX, top: finalY, right: finalX + cardWidth, bottom: finalY + cardHeight })) {
                foundSpot = true; break;
              }
            }
          }
          
          card.style.top = finalY + "px";
          card.style.left = finalX + "px";
          card.style.right = "auto";
          card.style.opacity = "1";
          obstacles.push(card);
        });
      };
      
      setTimeout(placeAllCardsRandomly, 100);

      allProdCards.forEach(prodCard => {
        let isDraggingProd = false;
        let prodOffsetX, prodOffsetY;

        prodCard.addEventListener("mousedown", (e) => {
          globalPopupZIndex++;
          prodCard.style.zIndex = globalPopupZIndex;

          const rect = prodCard.getBoundingClientRect();
          isDraggingProd = true;
          prodOffsetX = e.clientX - rect.left;
          prodOffsetY = e.clientY - rect.top;
        });

        document.addEventListener("mousemove", (ev) => {
          if (!isDraggingProd) return;
          prodCard.style.left = (ev.clientX - prodOffsetX) + "px";
          prodCard.style.top = (ev.clientY - prodOffsetY) + "px";
          prodCard.style.right = "auto";
        });

        document.addEventListener("mouseup", () => {
          isDraggingProd = false;
        });
        
        prodCard.addEventListener("mouseenter", () => {
          const dl = document.getElementById('dynamic-label');
          if(dl) dl.classList.add('visible');
          if(!dlAnimFrame) updateDlPosition(prodCard);
        });
        prodCard.addEventListener("mouseleave", () => {
          const dl = document.getElementById('dynamic-label');
          if(dl) dl.classList.remove('visible');
          cancelAnimationFrame(dlAnimFrame);
          dlAnimFrame = null;
        });
      });

      /* =========================================
         DYNAMIC LABEL LOGIC
         ========================================= */
      const dynamicLabel = document.getElementById('dynamic-label');
      let dlAnimFrame;

      const updateDlPosition = (prodCard) => {
        if (dynamicLabel && dynamicLabel.classList.contains('visible') && prodCard) {
          const rect = prodCard.getBoundingClientRect();
          // 레이블 간격 -48px
          dynamicLabel.style.left = `${rect.right - 48}px`;
          
          const imgEl = prodCard.querySelector('img');
          if (imgEl) {
            const imgRect = imgEl.getBoundingClientRect();
            const dlRect = dynamicLabel.getBoundingClientRect();
            // 이미지 하단에서 20% 위에 위치
            const targetBottom = imgRect.bottom - (imgRect.height * 0.20);
            dynamicLabel.style.top = `${targetBottom - dlRect.height}px`;
          }
        }
        dlAnimFrame = requestAnimationFrame(() => updateDlPosition(prodCard));
      };

    });
  </script>
`;

const file = '/Users/jeikosoh/Work Station/002_NOTES_ON/index.html';
let html = fs.readFileSync(file, 'utf8');

// If there's already a script tag from the partial undo, remove it.
html = html.replace(/<script>[\s\S]*<\/script>/, '');
html = html.replace('</body>', scriptContent + '\n</body>');

fs.writeFileSync(file, html);
console.log('Script recovered.');
