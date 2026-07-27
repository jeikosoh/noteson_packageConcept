
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
        // Remove active class from all nav items and account btn
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        if (accountBtn) accountBtn.classList.remove('active');
        
        // Hide all views
        document.querySelectorAll('.view-section').forEach(el => {
          el.style.display = 'none';
          el.classList.remove('active');
        });

        if (viewName === 'home') {
          homeBtn.classList.add('active');
          viewHome.style.display = 'block';
          viewHome.classList.add('active');
        } else if (viewName === 'about') {
          aboutBtn.classList.add('active');
          viewAbout.style.display = 'block';
          viewAbout.classList.add('active');
        } else if (viewName === 'login') {
          if (accountBtn) accountBtn.classList.add('active');
          viewLogin.style.display = 'flex';
          viewLogin.classList.add('active');
        } else if (viewName === 'signup') {
          if (accountBtn) accountBtn.classList.add('active');
          viewSignup.style.display = 'flex';
          viewSignup.classList.add('active');
        } else if (viewName === 'profile') {
          if (accountBtn) accountBtn.classList.add('active');
          viewProfile.style.display = 'flex';
          viewProfile.classList.add('active');
        }
      }

      homeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('home');
      });

      aboutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('about');
      });

      if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
          e.preventDefault();
          switchView('login');
        });
      }

      if (signupBtn) {
        signupBtn.addEventListener('click', (e) => {
          e.preventDefault();
          switchView('signup');
        });
      }

      if (accountBtn) {
        accountBtn.addEventListener('click', (e) => {
          // Prevent clicking on the popup menu itself from triggering the main button action
          if (e.target.closest('.account-popup')) return;
          
          if (window.isLoggedIn) {
            switchView('profile');
          } else {
            switchView('login');
          }
        });
      }

      // Close popups on click (for better UX, hide them immediately after a choice is made)
      document.querySelectorAll('.account-popup, .center-popup').forEach(popup => {
        popup.addEventListener('click', (e) => {
          if (e.target.tagName.toLowerCase() === 'a' || e.target.closest('a')) {
            popup.style.visibility = 'hidden';
            popup.style.opacity = '0';
            popup.style.pointerEvents = 'none';
            
            // Restore normal CSS hover functionality after 300ms
            setTimeout(() => {
              popup.style.visibility = '';
              popup.style.opacity = '';
              popup.style.pointerEvents = '';
            }, 300);
          }
        });
      });

      // Mock Login Submission
      const loginForm = document.querySelector('#view-login .auth-form');
      if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          window.isLoggedIn = true;
          // Toggle menus
          document.querySelector('.logged-out-menu').classList.remove('active');
          document.querySelector('.logged-in-menu').classList.add('active');
          switchView('profile');
        });
      }

      // Mock Logout Action
      const logoutBtn = document.querySelector('.logout-action-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          window.isLoggedIn = false;
          // Toggle menus
          document.querySelector('.logged-in-menu').classList.remove('active');
          document.querySelector('.logged-out-menu').classList.add('active');
          switchView('home');
        });
      }
    });

    /* =========================================
       CALENDAR LOGIC
       ========================================= */
    let currentCalendarDate = new Date(); // 달력에서 현재 보고 있는 달을 저장

    function renderCalendar() {
      // Remove any existing global tooltips to prevent duplicates
      document.querySelectorAll('.global-tooltip').forEach(el => el.remove());

      const columnsContainer = document.getElementById('dynamic-calendar-grid');
      if (!columnsContainer) return;
      columnsContainer.innerHTML = '';

      const year = currentCalendarDate.getFullYear();
      const month = currentCalendarDate.getMonth();
      
      // 달력 헤더 업데이트 (보여지는 달 기준)
      const displayMonth = String(month + 1).padStart(2, '0');

      const now = new Date(); // 실제 오늘 날짜
      
      const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
      document.getElementById('calendar-month-year').textContent = now.toLocaleDateString('en-US', options).toUpperCase();
      
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const todayDate = now.getDate();
      
      // 임시 전체 이벤트 데이터 리스트
      const allEvents = [
        { 
          year: 2026, month: 6, date: 11, 
          title: "Tea Tasting & Listening Session #001<br/>Friends and Family Tea Party",
          image: "01_INVITATIONS/260711 - Tea Tasting/invitation001b.png",
          location: "Atelier Antigravity"
        }
      ];
      
      const currentMonthEvents = allEvents.filter(e => e.year === year && e.month === month);
      const eventDates = currentMonthEvents.map(e => e.date);

      const firstDayOfMonth = new Date(year, month, 1).getDay();
      const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      const columnsData = [[], [], [], [], [], [], []];
      
      let currentGridDate = new Date(year, month, 1 - firstDayOfMonth);
      
      for (let i = 0; i < 35; i++) {
        const colIndex = i % 7;
        const isOtherMonth = currentGridDate.getMonth() !== month;
        const isToday = !isOtherMonth && currentGridDate.getFullYear() === currentYear && currentGridDate.getMonth() === currentMonth && currentGridDate.getDate() === todayDate;
        const isEvent = !isOtherMonth && eventDates.includes(currentGridDate.getDate());
        
        columnsData[colIndex].push({
          date: currentGridDate.getDate(),
          isOtherMonth,
          isToday,
          isEvent
        });
        currentGridDate.setDate(currentGridDate.getDate() + 1);
      }
      
      dayLabels.forEach((label, colIndex) => {
        const colDiv = document.createElement('div');
        colDiv.className = 'col';
        
        const labelDiv = document.createElement('div');
        labelDiv.className = 'day-label';
        labelDiv.textContent = label;
        colDiv.appendChild(labelDiv);
        
        columnsData[colIndex].forEach((day, rowIndex) => {
          const box = document.createElement('div');
          box.className = 'week-box';
          if (day.isOtherMonth) box.classList.add('other-month');
          if (day.isToday) box.classList.add('today');
          box.textContent = day.date; // 날짜 추가
          
          if (day.isEvent) {
            box.classList.add('event');
            
            // 툴팁 추가
            const evt = currentMonthEvents.find(e => e.date === day.date);
            if (evt) {
              const tooltipOptions = { weekday: 'short', month: 'long', day: 'numeric' };
              const dateString = new Date(evt.year, evt.month, evt.date).toLocaleDateString('en-US', tooltipOptions).toUpperCase();
              
              // 위치 계산 (0~4 인덱스에 따라 20% ~ 80% 사이로 매핑하여 화면 이탈 방지)
              const tailY = 20 + (60 * (rowIndex / 4));
              
              // 완벽한 하나의 유리 도형을 위한 SVG 마스크 생성 (꼬리와 몸통이 하나로 합쳐진 형태)
              const svgMask = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><rect x="8" y="0" width="240" height="100%" rx="12" fill="black" /><svg x="0" y="${tailY}%" overflow="visible"><polygon points="9,-8 0,0 9,8" fill="black" /></svg></svg>`;
              const encodedMask = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgMask);
              
              // 외곽선을 위한 별도 SVG 생성 (꼬리 부분의 겹치는 선을 mask로 제거)
              const svgOutline = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                <mask id="cutout">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  <svg x="0" y="${tailY}%" overflow="visible"><rect x="8" y="-8" width="2" height="16" fill="black" /></svg>
                </mask>
                <rect x="8.5" y="0.5" width="239" height="99%" rx="11.5" fill="none" stroke="black" stroke-width="1" mask="url(#cutout)" />
                <svg x="0" y="${tailY}%" overflow="visible"><polyline points="9,-8 0.5,0 9,8" fill="none" stroke="black" stroke-width="1" /></svg>
              </svg>`;
              const encodedOutline = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgOutline);
              
              const tooltip = document.createElement('div');
              tooltip.className = 'event-tooltip global-tooltip';
              tooltip.style.setProperty('--tail-y', `${tailY}%`);
              tooltip.style.webkitMaskImage = `url("${encodedMask}")`;
              tooltip.style.maskImage = `url("${encodedMask}")`;
              
              // Pseudo-element 대신 별도의 div를 추가해 아웃라인을 깔끔하게 오버레이합니다.
              const outlineDiv = document.createElement('div');
              outlineDiv.style.position = 'absolute';
              outlineDiv.style.top = '0';
              outlineDiv.style.left = '0';
              outlineDiv.style.width = '100%';
              outlineDiv.style.height = '100%';
              outlineDiv.style.backgroundImage = `url("${encodedOutline}")`;
              outlineDiv.style.pointerEvents = 'none';
              outlineDiv.style.zIndex = '10'; // 컨텐츠 위로 테두리가 오게 함
              
              tooltip.innerHTML = `
                <div class="tooltip-thumbnail">
                  <img src="${evt.image}" alt="Event Thumbnail">
                </div>
                <div class="tooltip-content">
                  <div class="tooltip-date">${dateString}</div>
                  <div class="tooltip-title">${evt.title}</div>
                  ${evt.subtitle ? `<div class="tooltip-subtitle">${evt.subtitle}</div>` : ''}
                  <div class="tooltip-location">${evt.location}</div>
                  <button class="tooltip-btn">LEARN MORE</button>
                </div>
              `;
              tooltip.appendChild(outlineDiv);
              document.body.appendChild(tooltip);

              let hideTimeout;

              box.addEventListener('mouseenter', () => {
                clearTimeout(hideTimeout);
                const rect = box.getBoundingClientRect();
                tooltip.style.left = (rect.right + 4) + 'px';
                tooltip.style.top = (rect.top + rect.height / 2) + 'px';
                tooltip.classList.add('visible');
              });
              
              box.addEventListener('mouseleave', () => {
                hideTimeout = setTimeout(() => {
                  tooltip.classList.remove('visible');
                }, 100);
              });

              tooltip.addEventListener('mouseenter', () => {
                clearTimeout(hideTimeout);
              });
              
              tooltip.addEventListener('mouseleave', () => {
                hideTimeout = setTimeout(() => {
                  tooltip.classList.remove('visible');
                }, 100);
              });
            }
          }
          colDiv.appendChild(box);
        });
        
        columnsContainer.appendChild(colDiv);
      });

      const divider = document.getElementById('dynamic-calendar-divider');
      if (divider) {
        divider.style.display = 'block'; // 항상 표시하여 레이아웃 유지
      }

      const scheduleContainer = document.getElementById('dynamic-schedule-list');
      if (scheduleContainer) {
        scheduleContainer.innerHTML = '';
        
        let eventsToDisplay = currentMonthEvents;
        
        if (eventsToDisplay.length === 0) {
          // 다음 이벤트 찾기
          const sortedEvents = [...allEvents].sort((a, b) => {
            return new Date(a.year, a.month, a.date) - new Date(b.year, b.month, b.date);
          });
          
          const nextEvent = sortedEvents.find(e => {
            if (e.year > year) return true;
            if (e.year === year && e.month > month) return true;
            return false;
          });
          
          if (nextEvent) {
            eventsToDisplay = [nextEvent];
          }
        }
        
        if (eventsToDisplay.length > 0) {
          eventsToDisplay.forEach(evt => {
            const row = document.createElement('div');
            row.className = 'event-row';
            
            const dateRowDiv = document.createElement('div');
            dateRowDiv.className = 'event-date-row';
            
            const dateDiv = document.createElement('div');
            dateDiv.className = 'event-date';
            const evtDate = new Date(evt.year, evt.month, evt.date);
            const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
            const formattedDate = evtDate.toLocaleDateString('en-US', options).toUpperCase();
            
            dateDiv.innerHTML = `<span class="event-arrow">→</span>${formattedDate}`;
            
            const btn = document.createElement('button');
            btn.className = 'event-learn-more-btn';
            btn.textContent = 'LEARN MORE';
            
            dateRowDiv.appendChild(dateDiv);
            
            const descDiv = document.createElement('div');
            descDiv.className = 'event-desc';
            descDiv.innerHTML = evt.subtitle ? `${evt.title}<br/><span style="opacity:0.8;font-size:11px;font-weight:400;">${evt.subtitle}</span>` : evt.title;
            
            row.appendChild(dateRowDiv);
            row.appendChild(descDiv);
            row.appendChild(btn); // Move button below the title/desc
            scheduleContainer.appendChild(row);
          });
        } else {
          // 이벤트가 아예 없을 때
          const row = document.createElement('div');
          row.className = 'event-row';
          
          const dateRowDiv = document.createElement('div');
          dateRowDiv.className = 'event-date-row';

          const dateDiv = document.createElement('div');
          dateDiv.className = 'event-date';
          dateDiv.innerHTML = `<span class="event-arrow">→</span>SOMETHING IS STEEPING...`;
          
          dateRowDiv.appendChild(dateDiv);
          row.appendChild(dateRowDiv);
          scheduleContainer.appendChild(row);
        }
      }
    }

    function updateDate() {
      const now = new Date();
      const options = { month: 'long', year: 'numeric' };
      const dateString = now.toLocaleDateString('en-US', options).toUpperCase();
      document.getElementById('real-time-date').textContent = dateString;
    }

    // 초기 렌더링
    updateDate();
    renderCalendar();

    // 버튼 이벤트 리스너 추가
    document.getElementById('prev-month-btn').addEventListener('click', () => {
      currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
      renderCalendar();
    });
    
    document.getElementById('next-month-btn').addEventListener('click', () => {
      currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
      renderCalendar();
    });

    document.querySelector('.calendar-title-wrap').addEventListener('click', () => {
      currentCalendarDate = new Date();
      renderCalendar();
    });

    // 자정이 지나면 날짜 업데이트
    setInterval(() => {
      updateDate();
      // 만약 달력이 현재 달을 보고 있다면 자정 갱신 시 다시 그려줌
      const now = new Date();
      if (currentCalendarDate.getMonth() === now.getMonth() && currentCalendarDate.getFullYear() === now.getFullYear()) {
        renderCalendar();
      }
    }, 60000); 

    // =========================================================
    // CUSTOM CURSOR PHYSICS & LOGIC
    // =========================================================
    const cursorDot = document.getElementById('cursor-dot');
    const cursorCoords = document.getElementById('cursor-coords');
    const rippleContainer = document.getElementById('cursor-ripple-container');
    const cursorContainer = document.getElementById('cursor-container');
    const coordX = document.getElementById('coord-x');
    const coordY = document.getElementById('coord-y');
    const speedNum = document.getElementById('speed-num');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let lastX = currentX;
    let lastY = currentY;
    
    const lerpFactor = 0.15;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (coordX && coordY) {
        coordX.textContent = mouseX;
        coordY.textContent = mouseY;
      }
    });

    window.addEventListener('mousedown', () => {
      cursorContainer.classList.add('flash');
      setTimeout(() => cursorContainer.classList.remove('flash'), 150);

      const ripple = document.createElement('div');
      ripple.className = 'ink-ripple';
      ripple.style.left = `${currentX}px`;
      ripple.style.top = `${currentY}px`;
      
      rippleContainer.appendChild(ripple);
      
      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 600);
    });

    function animateCursor() {
      // Lerp position
      currentX += (mouseX - currentX) * lerpFactor;
      currentY += (mouseY - currentY) * lerpFactor;
      
      // Calculate velocity
      const dx = currentX - lastX;
      const dy = currentY - lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);
      
      // Calculate angle
      const angle = Math.atan2(dy, dx);
      
      // Squash and stretch constraints
      const maxStretch = 2.5;
      const minSqueeze = 0.5;
      
      // Scale based on speed (increased sensitivity)
      const stretch = Math.min(1 + speed * 0.30, maxStretch);
      const squeeze = Math.max(1 - speed * 0.12, minSqueeze);
      
      // Update UI speed text
      if (speedNum) {
        const speedPxS = Math.round(speed * 60); // Approx px/s at 60fps
        speedNum.textContent = speedPxS;
      }
      
      // Apply transforms
      // dot uses top/left 0, so translate is centered by -50% then moved
      cursorDot.style.transform = `translate(calc(${currentX}px - 50%), calc(${currentY}px - 50%)) rotate(${angle}rad) scale(${stretch}, ${squeeze})`;
      cursorCoords.style.transform = `translate(${currentX}px, ${currentY}px)`;
      
      lastX = currentX;
      lastY = currentY;
      
      requestAnimationFrame(animateCursor);
    }
    
    animateCursor();

    // ==========================================
    // GSAP PHYSICS BALANCE ANIMATION (Precise Figma States)
    // ==========================================
    document.addEventListener("DOMContentLoaded", () => {
      const topCircle = document.getElementById('top-circle-anim');
      const bottomCircle = document.getElementById('bottom-circle-anim');
      const rod = document.getElementById('rod-anim');
      const svgContainer = document.getElementById('animated-symbol-svg');

      if (topCircle && bottomCircle && rod) {
        // MUST use svgOrigin to rotate around absolute SVG canvas coordinates
        // Using transformOrigin defaults to bounding-box offsets, which broke the pendulum physics.
        gsap.set(topCircle, { svgOrigin: "143 80" });
        gsap.set(bottomCircle, { svgOrigin: "108 360" });
        gsap.set(rod, { svgOrigin: "172.57 273.35" });

        const tl = gsap.timeline({ repeat: -1 });

        let prevState = { c1: {y:0}, c2: {y:0}, rod: {y:0} };

        // Solves a Forward Kinematics ragdoll chain dynamically for any state to allow independent swaying without detachment
        function addHoldWobble(startTime, state, duration) {
          const SVG_ORIGINS = {
            c1: { x: 143, y: 80, r: 0 },
            c2: { x: 108.01, y: 360.428, r: 0 },
            rod: { x: 172.57, y: 273.35, r: 68.0466 }
          };

          function getAbs(id) {
            return {
              x: SVG_ORIGINS[id].x + state[id].x,
              y: SVG_ORIGINS[id].y + state[id].y,
              r: SVG_ORIGINS[id].r + (state[id].r || 0)
            };
          }

          const absState = { c1: getAbs('c1'), c2: getAbs('c2'), rod: getAbs('rod') };

          const shapes = [
            { id: 'c1', abs: absState.c1, isRod: false },
            { id: 'c2', abs: absState.c2, isRod: false },
            { id: 'rod', abs: absState.rod, isRod: true }
          ].sort((a, b) => b.abs.y - a.abs.y); // Sort Y descending to find Base, Middle, Top

          const bottom = shapes[0];
          const middle = shapes[1];
          const top = shapes[2];

          function rotateVec(vec, angleDeg) {
            const rad = angleDeg * Math.PI / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);
            return { x: vec.x * cos - vec.y * sin, y: vec.x * sin + vec.y * cos };
          }

          // Geometry calculation to find exact physical contact point
          function getContactPoint(A, B) {
            if (!A.isRod && !B.isRod) return { x: (A.abs.x + B.abs.x) / 2, y: (A.abs.y + B.abs.y) / 2 };
            const circle = A.isRod ? B : A;
            const r = A.isRod ? A : B;
            const localC = rotateVec({ x: circle.abs.x - r.abs.x, y: circle.abs.y - r.abs.y }, -r.abs.r);
            const W = 237.023, H = 25;
            const Px_local = Math.max(-W/2, Math.min(localC.x, W/2));
            const Py_local = Math.max(-H/2, Math.min(localC.y, H/2));
            const P_world = rotateVec({ x: Px_local, y: Py_local }, r.abs.r);
            return { x: r.abs.x + P_world.x, y: r.abs.y + P_world.y };
          }

          const p1_abs = getContactPoint(bottom, middle);
          const p2_abs = getContactPoint(middle, top);

          const p1_b_v = { x: p1_abs.x - bottom.abs.x, y: p1_abs.y - bottom.abs.y };
          const p1_m_v = { x: p1_abs.x - middle.abs.x, y: p1_abs.y - middle.abs.y };
          const p2_m_v = { x: p2_abs.x - middle.abs.x, y: p2_abs.y - middle.abs.y };
          const p2_t_v = { x: p2_abs.x - top.abs.x, y: p2_abs.y - top.abs.y };

          const elements = { c1: topCircle, c2: bottomCircle, rod: rod };
          let kin = { a0: 0, a1: 0, a2: 0 };

          function updateFK() {
            // Forward Kinematics propagation
            const b_r = kin.a0;
            const b_x = kin.a0 * 1.5;
            const b_cx = bottom.abs.x + b_x;
            const b_cy = bottom.abs.y;
            const b_cr = bottom.abs.r + b_r;
            
            const p1_c = rotateVec(p1_b_v, b_r);
            p1_c.x += b_cx; p1_c.y += b_cy;
            
            const m_r = b_r + kin.a1;
            const p1_m_c = rotateVec(p1_m_v, m_r);
            const m_cx = p1_c.x - p1_m_c.x;
            const m_cy = p1_c.y - p1_m_c.y;
            const m_cr = middle.abs.r + m_r;
            
            const p2_c = rotateVec(p2_m_v, m_r);
            p2_c.x += m_cx; p2_c.y += m_cy;
            
            const t_r = m_r + kin.a2;
            const p2_t_c = rotateVec(p2_t_v, t_r);
            const t_cx = p2_c.x - p2_t_c.x;
            const t_cy = p2_c.y - p2_t_c.y;
            const t_cr = top.abs.r + t_r;
            
            gsap.set(elements[bottom.id], { x: b_cx - SVG_ORIGINS[bottom.id].x, y: b_cy - SVG_ORIGINS[bottom.id].y, rotation: b_cr - SVG_ORIGINS[bottom.id].r });
            gsap.set(elements[middle.id], { x: m_cx - SVG_ORIGINS[middle.id].x, y: m_cy - SVG_ORIGINS[middle.id].y, rotation: m_cr - SVG_ORIGINS[middle.id].r });
            gsap.set(elements[top.id], { x: t_cx - SVG_ORIGINS[top.id].x, y: t_cy - SVG_ORIGINS[top.id].y, rotation: t_cr - SVG_ORIGINS[top.id].r });
          }

          const dur = duration / 2;
          const stag = 0.15;
          // All tweens are mathematically timed to finish exactly at startTime + duration and return to exactly 0
          tl.to(kin, { a0: 1.5, duration: dur, yoyo: true, repeat: 1, ease: "sine.inOut", onUpdate: updateFK }, startTime);
          tl.to(kin, { a1: -2.0, duration: dur - stag/2, yoyo: true, repeat: 1, ease: "sine.inOut", onUpdate: updateFK }, startTime + stag);
          tl.to(kin, { a2: 2.5, duration: dur - stag, yoyo: true, repeat: 1, ease: "sine.inOut", onUpdate: updateFK }, startTime + stag * 2);
        }

        // Helper function for explosive pops and heavy bouncing falls
        function addTransition(startTime, state, holdTime) {
          const jumpStagger = 0.075;
          const fallStagger = 0.075;
          const baseDuration = 1.0;

          const SVG_ORIGINS = { c1: { x: 143, y: 80, r: 0 }, c2: { x: 108.01, y: 360.428, r: 0 }, rod: { x: 172.57, y: 273.35, r: 68.0466 } };
          const getAbsY = (st, id) => SVG_ORIGINS[id].y + st[id].y;

          // Rank jump order (Top to Bottom based on PREVIOUS state)
          const prevShapes = [ 'c1', 'c2', 'rod' ].sort((a, b) => getAbsY(prevState, a) - getAbsY(prevState, b));
          const jumpDelayMap = {
            [prevShapes[0]]: 0,
            [prevShapes[1]]: jumpStagger,
            [prevShapes[2]]: jumpStagger * 2
          };

          // Rank land order (Bottom to Top based on NEW state)
          const newShapes = [ 'c1', 'c2', 'rod' ].sort((a, b) => getAbsY(state, b) - getAbsY(state, a));
          const fallDelayMap = {
            [newShapes[0]]: 0,
            [newShapes[1]]: fallStagger,
            [newShapes[2]]: fallStagger * 2
          };

          const elements = { c1: topCircle, c2: bottomCircle, rod: rod };
          let maxEndTime = 0;

          ['c1', 'c2', 'rod'].forEach(id => {
             const jumpStart = jumpDelayMap[id];
             const endMainFallTime = baseDuration + fallDelayMap[id];
             const mainMotionDur = endMainFallTime - jumpStart;
             
             const peakY = Math.min(prevState[id].y, state[id].y) - (id === 'rod' ? 120 : 100);
             const fallDist = Math.max(0, state[id].y - peakY);
             
             // Dynamic physics bounce calculations
             // Circles are bouncier (restitution 0.25), rod is heavier (0.12)
             const restitution = id === 'rod' ? 0.12 : 0.25;
             const bounce1Height = fallDist * restitution;
             const bounce2Height = bounce1Height * restitution;
             
             // Time scales with sqrt of height, multiplied by 0.6 to make bounces snappy and heavy
             const bounce1Dur = (mainMotionDur * 0.5) * Math.sqrt(restitution) * 0.6;
             const bounce2Dur = bounce1Dur * Math.sqrt(restitution) * 0.6;
             
             const totalAirTime = mainMotionDur + bounce1Dur * 2 + bounce2Dur * 2;
             
             maxEndTime = Math.max(maxEndTime, jumpStart + totalAirTime);

             // X and Rotation move smoothly over the entire air time, including bounces
             tl.to(elements[id], { duration: totalAirTime, x: state[id].x, rotation: state[id].r, ease: "power1.out" }, startTime + jumpStart);
             
             // Y Axis Parabola + Dynamic Bounces
             tl.to(elements[id], { 
                keyframes: [
                  { y: peakY, duration: mainMotionDur * 0.5, ease: "power2.out" },
                  { y: state[id].y, duration: mainMotionDur * 0.5, ease: "power2.in" },
                  // Bounce 1
                  { y: state[id].y - bounce1Height, duration: bounce1Dur, ease: "power2.out" },
                  { y: state[id].y, duration: bounce1Dur, ease: "power2.in" },
                  // Bounce 2
                  { y: state[id].y - bounce2Height, duration: bounce2Dur, ease: "power2.out" },
                  { y: state[id].y, duration: bounce2Dur, ease: "power2.in" }
                ]
             }, startTime + jumpStart);
          });
            
          // 1.2 is transTime (allocated total transition duration block). So wobble fills the remaining exact gap before next transition starts.
          const availableHoldTime = holdTime + 1.2 - maxEndTime; 
          addHoldWobble(startTime + maxEndTime, state, availableHoldTime);
          
          prevState = state;
        }

        // --- States definitions (Mathematically aligned to invisible floor & center of mass) ---
        // State 1
        const s1 = { 
          c1: {x:0, y:0, r:0}, 
          c2: {x:0, y:0, r:0}, 
          rod: {x:0, y:0, r:0} 
        };
        // State 2 (Floor Y=381 shifted to 440.43)
        const s2 = { 
          c1: {x: -92.9, y: 132.4, r: -180}, 
          c2: {x: 100.1, y: 0, r: 180},
          rod: {x: -7.1, y: 2.5, r: 96.1} 
        };
        // State 3 (Floor Y=418.6 shifted to 440.43)
        const s3 = {
          c1: {x: 14.0, y: 71.8, r: 0},
          c2: {x: -11.0, y: -60.6, r: 0},
          rod: {x: -3.0, y: 88.3, r: -103.5}
        };
        // State 4 (Floor Y=379.4 shifted to 440.43)
        const s4 = {
          c1: {x: -11.7, y: 72.0, r: -180},
          c2: {x: 85.3, y: -0.4, r: 180},
          rod: {x: -73.6, y: 61.4, r: -124.6}
        };
        // State 5 (Floor Y=349.0 shifted to 440.43)
        const s5 = {
          c1: {x: 109.3, y: 128.4, r: 0},
          c2: {x: -55.7, y: 0, r: 0},
          rod: {x: -53.6, y: 5.2, r: -57.4}
        };

        // --- Build Timeline ---
        const holdTime = 2.5;
        const transTime = 1.2;
        let time = 0;

        addTransition(time, s2, holdTime);
        time += transTime + holdTime;

        addTransition(time, s3, holdTime);
        time += transTime + holdTime;

        addTransition(time, s4, holdTime);
        time += transTime + holdTime;

        addTransition(time, s5, holdTime);
        time += transTime + holdTime;

        addTransition(time, s1, holdTime);
        time += transTime;
        
        // Add hold time for State 1 before the timeline repeats
        tl.to({}, { duration: holdTime }, time);
      }
      
      // =========================================================
      // FLOATING VIDEO PLAYER DRAG LOGIC
      // =========================================================
      let globalPopupZIndex = 2000;
      const vidPlayer = document.getElementById('floating-vid-player');
      const dragHandle = vidPlayer.querySelector('.vid-player-drag-handle');
      
      // 비디오 플레이어 호버 시 기존 커서 숨기기
      if (vidPlayer && typeof cursorContainer !== 'undefined' && typeof cursorCoords !== 'undefined') {
        vidPlayer.addEventListener('mouseenter', () => {
          cursorContainer.style.opacity = '0';
          cursorCoords.style.opacity = '0';
        });
        vidPlayer.addEventListener('mouseleave', () => {
          cursorContainer.style.opacity = '1';
          cursorCoords.style.opacity = '1';
        });
      }

      
      vidPlayer.addEventListener("mousedown", () => {
        document.body.classList.add("is-interacting-vid");
        globalPopupZIndex++;
        vidPlayer.style.zIndex = globalPopupZIndex;
      });
      window.addEventListener("mouseup", () => {
        document.body.classList.remove("is-interacting-vid");
        document.body.classList.remove("is-interacting-prod");
        document.body.classList.remove("is-interacting-land");
      });

      let isDraggingVid = false;
      let hasDraggedVid = false;
      let dragStartX = 0;
      let dragStartY = 0;
      let vidDragOffsetX = 0;
      let vidDragOffsetY = 0;

      dragHandle.addEventListener('mousedown', (e) => {
        isDraggingVid = true;
        hasDraggedVid = false;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        
        const rect = vidPlayer.getBoundingClientRect();
        vidDragOffsetX = e.clientX - rect.left;
        vidDragOffsetY = e.clientY - rect.top;
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDraggingVid) return;
        
        // 이동 거리가 3px 이상이면 드래그로 판정
        if (Math.abs(e.clientX - dragStartX) > 3 || Math.abs(e.clientY - dragStartY) > 3) {
          hasDraggedVid = true;
        }
        
        let newX = e.clientX - vidDragOffsetX;
        let newY = e.clientY - vidDragOffsetY;
        
        // Constrain to main section boundaries
        const mainEl = document.querySelector('.main');
        const mainRect = mainEl ? mainEl.getBoundingClientRect() : { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
        const rect = vidPlayer.getBoundingClientRect();
        
        if (newX < mainRect.left) newX = mainRect.left;
        if (newY < mainRect.top) newY = mainRect.top;
        if (newX + rect.width > mainRect.right) newX = mainRect.right - rect.width;
        if (newY + rect.height > mainRect.bottom) newY = mainRect.bottom - rect.height;
        
        vidPlayer.style.left = `${newX}px`;
        vidPlayer.style.top = `${newY}px`;
        
        // Override initial bottom/right properties
        vidPlayer.style.bottom = 'auto';
        vidPlayer.style.right = 'auto';
      });

      window.addEventListener('mouseup', (e) => {
        if (isDraggingVid && !hasDraggedVid) {
          // 마우스를 떼었을 때 드래그가 아니었다면 (단순 탭/클릭) 비디오 재생/일시정지 토글
          const videoElem = vidPlayer.querySelector('video');
          const playPauseIcon = vidPlayer.querySelector('.play-pause-icon');
          const playSVG = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
          const pauseSVG = '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
          
          if (videoElem && playPauseIcon) {
            if (videoElem.paused) {
              videoElem.play();
              playPauseIcon.innerHTML = playSVG;
            } else {
              videoElem.pause();
              playPauseIcon.innerHTML = pauseSVG;
            }

            playPauseIcon.classList.add('show');
            if (window.iconTimeout) clearTimeout(window.iconTimeout);
            
            window.iconTimeout = setTimeout(() => {
              playPauseIcon.classList.remove('show');
            }, 500); // 0.5초 동안 띄워주고 서서히 사라짐
          }
        }
        isDraggingVid = false;
        hasDraggedVid = false;
      });

      // 브라우저 크기 변경이나 자체 크기 조절 시 항상 화면 밖으로 나가지 않도록 고정
      function clampVidPlayer() {
        const rect = vidPlayer.getBoundingClientRect();
        
        // 사이즈 텍스트 동적 업데이트
        const sizeText = vidPlayer.querySelector('.vid-size-text');
        if (sizeText) {
          sizeText.textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
        }

        let newX = rect.left;
        let newY = rect.top;
        let changed = false;

        if (newX + rect.width > window.innerWidth) {
          newX = window.innerWidth - rect.width;
          changed = true;
        }
        if (newY + rect.height > window.innerHeight) {
          newY = window.innerHeight - rect.height;
          changed = true;
        }
        if (newX < 0) { newX = 0; changed = true; }
        if (newY < 0) { newY = 0; changed = true; }

        if (changed) {
          vidPlayer.style.left = `${newX}px`;
          vidPlayer.style.top = `${newY}px`;
          vidPlayer.style.bottom = 'auto';
          vidPlayer.style.right = 'auto';
        }
      }

      window.addEventListener('resize', clampVidPlayer);
      const resizeObserver = new ResizeObserver(() => clampVidPlayer());
      resizeObserver.observe(vidPlayer);

      // =========================================================
      // TIMECODE & PROGRESS UPDATE LOGIC
      // =========================================================
      const videoElem = vidPlayer.querySelector('video');
      const timecodeBox = vidPlayer.querySelector('.timecode-box');
      const progressFill = vidPlayer.querySelector('.vid-progress-fill');
      
      if (videoElem && timecodeBox) {
        const updateTimecode = () => {
          const t = videoElem.currentTime;
          const d = videoElem.duration || 1;
          const m = Math.floor(t / 60).toString().padStart(2, '0');
          const s = Math.floor(t % 60).toString().padStart(2, '0');
          // 30프레임 기준으로 소수점 아래 시간을 프레임으로 변환
          const f = Math.floor((t % 1) * 30).toString().padStart(2, '0');
          timecodeBox.textContent = `${m}:${s}:${f}`;
          
          if (progressFill) {
            progressFill.style.width = `${(t / d) * 100}%`;
          }
          
          requestAnimationFrame(updateTimecode);
        };
        requestAnimationFrame(updateTimecode);
      }

      // =========================================================
      // DOT BLINKING LOGIC
      // =========================================================
      const dot01 = vidPlayer.querySelector('.dot-01');
      const dot02 = vidPlayer.querySelector('.dot-02');

      if (dot02) {
        // 빠른 속도로 불규칙하게 깜빡임 (데이터 처리 효과)
        const processBlink = () => {
          dot02.style.opacity = Math.random() > 0.4 ? '1' : '0';
          setTimeout(processBlink, Math.random() * 100 + 30); // 30ms ~ 130ms
        };
        processBlink();
      }

      if (dot01) {
        // 가끔씩 랜덤하게 채워졌다 비워졌다 함
        const randomFillBlink = () => {
          const isFilled = Math.random() > 0.5;
          dot01.style.backgroundColor = isFilled ? '#000000' : 'transparent';
          setTimeout(randomFillBlink, Math.random() * 3000 + 1000); // 1초 ~ 4초 간격
        };
        randomFillBlink();
      }
      // =========================================================

      // =========================================================
// =========================================================
      // MAIN PRODUCT CARD DRAG & RESIZE LOGIC
      // =========================================================
      const allProdCards = document.querySelectorAll(".main-product-card");
      
      const placeAllCardsRandomly = () => {
        const mainRect = document.querySelector(".main").getBoundingClientRect();
        const leftPanel = document.querySelector(".left-panel");
        const leftPanelRect = leftPanel ? leftPanel.getBoundingClientRect() : { right: mainRect.left + 600 };
        
        const obstacles = [
          document.getElementById('floating-vid-player')
        ].filter(Boolean);

        const isOverlapping = (rect1) => {
          for (const obs of obstacles) {
            const rect2 = obs.getBoundingClientRect();
            const margin = 20;
            if (!(rect1.right + margin < rect2.left ||
                  rect1.left > rect2.right + margin ||
                  rect1.bottom + margin < rect2.top ||
                  rect1.top > rect2.bottom + margin)) {
              return true;
            }
          }
          return false;
        };

        allProdCards.forEach(card => {
          const cardWidth = card.getBoundingClientRect().width || (card.classList.contains('landscape-card') ? 235 : 176);
          const cardHeight = card.getBoundingClientRect().height || (card.classList.contains('landscape-card') ? 210 : 252);
          
          const minX = leftPanelRect.right + 24;
          const maxX = mainRect.right - cardWidth - 24;
          const minY = mainRect.top + 24;
          const maxY = mainRect.bottom - cardHeight - 24;

          let finalX = minX;
          let finalY = minY;
          let attempts = 0;

          if (maxX > minX && maxY > minY) {
            do {
              finalX = minX + Math.random() * (maxX - minX);
              finalY = minY + Math.random() * (maxY - minY);
              attempts++;
            } while (isOverlapping({ left: finalX, top: finalY, right: finalX + cardWidth, bottom: finalY + cardHeight }) && attempts < 50);
          }
          
          card.style.top = finalY + "px";
          card.style.left = finalX + "px";
          card.style.right = "auto";
          card.style.opacity = "1";

          // Add this card to obstacles for the next cards
          obstacles.push(card);
        });
      };
      
      // Short delay to ensure CSS layout is painted before calculating bounds
      setTimeout(placeAllCardsRandomly, 100);

      allProdCards.forEach(prodCard => {
        let isDraggingProd = false;
        let prodOffsetX, prodOffsetY;

        prodCard.addEventListener("mousedown", (e) => {
          const prefix = prodCard.dataset.linePrefix || 'prod';
          document.body.classList.add(`is-interacting-${prefix}`);
          globalPopupZIndex++;
          prodCard.style.zIndex = globalPopupZIndex;

          const rect = prodCard.getBoundingClientRect();
          if (e.clientX > rect.right - 20 && e.clientY > rect.bottom - 20) {
            return;
          }

          isDraggingProd = true;
          prodOffsetX = e.clientX - rect.left;
          prodOffsetY = e.clientY - rect.top;
          prodCard.style.transition = "none";
          
          const onMouseMove = (ev) => {
            if (!isDraggingProd) return;
            let newX = ev.clientX - prodOffsetX;
            let newY = ev.clientY - prodOffsetY;
            
            const mainRect = document.querySelector(".main").getBoundingClientRect();
            const cardRect = prodCard.getBoundingClientRect();
            
            if (newX < mainRect.left) newX = mainRect.left;
            if (newY < mainRect.top) newY = mainRect.top;
            if (newX + cardRect.width > mainRect.right) newX = mainRect.right - cardRect.width;
            if (newY + cardRect.height > mainRect.bottom) newY = mainRect.bottom - cardRect.height;
            
            prodCard.style.left = newX + "px";
            prodCard.style.top = newY + "px";
            prodCard.style.right = "auto";
          };

          const onMouseUp = () => {
            isDraggingProd = false;
            prodCard.style.transition = "";
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
          };

          document.addEventListener("mousemove", onMouseMove);
          document.addEventListener("mouseup", onMouseUp);
        });

        const clampProdCard = () => {
          const mainRect = document.querySelector(".main").getBoundingClientRect();
          const cardRect = prodCard.getBoundingClientRect();
          
          let newX = cardRect.left;
          let newY = cardRect.top;
          let adjusted = false;

          if (newX < mainRect.left) { newX = mainRect.left; adjusted = true; }
          if (newY < mainRect.top) { newY = mainRect.top; adjusted = true; }
          if (newX + cardRect.width > mainRect.right) { newX = mainRect.right - cardRect.width; adjusted = true; }
          if (newY + cardRect.height > mainRect.bottom) { newY = mainRect.bottom - cardRect.height; adjusted = true; }

          if (adjusted) {
            prodCard.style.left = newX + "px";
            prodCard.style.top = newY + "px";
            prodCard.style.right = "auto";
          }
        };
        
        if (typeof cursorContainer !== 'undefined' && typeof cursorCoords !== 'undefined') {
          prodCard.addEventListener('mouseenter', () => {
            cursorContainer.style.opacity = '0';
            cursorCoords.style.opacity = '0';
          });
          prodCard.addEventListener('mouseleave', () => {
            cursorContainer.style.opacity = '1';
            cursorCoords.style.opacity = '1';
          });
        }

        window.addEventListener("resize", clampProdCard);
        const prodResizeObserver = new ResizeObserver(() => clampProdCard());
        prodResizeObserver.observe(prodCard);
      });

      // DYNAMIC CONNECTION LINES
      const mainTL = document.querySelector('.main-cross.tl');
      const mainTR = document.querySelector('.main-cross.tr');
      const mainBL = document.querySelector('.main-cross.bl');
      const mainBR = document.querySelector('.main-cross.br');

      const svgLineTL = document.getElementById('line-tl');
      const svgLineTR = document.getElementById('line-tr');
      const svgLineBL = document.getElementById('line-bl');
      const svgLineBR = document.getElementById('line-br');
      
      const vidTopMark = document.querySelector('#floating-vid-player .top-mark');
      const vidAnchorTR = document.querySelector('#floating-vid-player .anchor-tr');
      const vidAnchorBL = document.querySelector('#floating-vid-player .anchor-bl');
      const vidBotMark = document.querySelector('#floating-vid-player .bot-mark');

      function getCenterCoords(elem) {
        if (!elem) return { x: 0, y: 0 };
        const rect = elem.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
      }

      function updateConnectionLines() {
        if (svgLineTL && mainTL && vidTopMark) {
          const p1 = getCenterCoords(mainTL);
          const p2 = getCenterCoords(vidTopMark);
          svgLineTL.setAttribute('x1', p1.x);
          svgLineTL.setAttribute('y1', p1.y);
          svgLineTL.setAttribute('x2', p2.x);
          svgLineTL.setAttribute('y2', p2.y);
        }
        if (svgLineTR && mainTR && vidAnchorTR) {
          const p1 = getCenterCoords(mainTR);
          const p2 = getCenterCoords(vidAnchorTR);
          svgLineTR.setAttribute('x1', p1.x);
          svgLineTR.setAttribute('y1', p1.y);
          svgLineTR.setAttribute('x2', p2.x);
          svgLineTR.setAttribute('y2', p2.y);
        }
        if (svgLineBL && mainBL && vidAnchorBL) {
          const p1 = getCenterCoords(mainBL);
          const p2 = getCenterCoords(vidAnchorBL);
          svgLineBL.setAttribute('x1', p1.x);
          svgLineBL.setAttribute('y1', p1.y);
          svgLineBL.setAttribute('x2', p2.x);
          svgLineBL.setAttribute('y2', p2.y);
        }
        if (svgLineBR && mainBR && vidBotMark) {
          const p1 = getCenterCoords(mainBR);
          const p2 = getCenterCoords(vidBotMark);
          svgLineBR.setAttribute('x1', p1.x);
          svgLineBR.setAttribute('y1', p1.y);
          svgLineBR.setAttribute('x2', p2.x);
          svgLineBR.setAttribute('y2', p2.y);
        }
        
        allProdCards.forEach(card => {
          const prefix = card.dataset.linePrefix;
          if (!prefix) return;
          
          const lineTL = document.getElementById(prefix + '-line-tl');
          const lineTR = document.getElementById(prefix + '-line-tr');
          const lineBL = document.getElementById(prefix + '-line-bl');
          const lineBR = document.getElementById(prefix + '-line-br');
          
          const rect = card.getBoundingClientRect();
          
          if (lineTL && mainTL) {
            const p1 = getCenterCoords(mainTL);
            lineTL.setAttribute("x1", p1.x);
            lineTL.setAttribute("y1", p1.y);
            lineTL.setAttribute("x2", rect.left);
            lineTL.setAttribute("y2", rect.top);
          }
          if (lineTR && mainTR) {
            const p1 = getCenterCoords(mainTR);
            lineTR.setAttribute("x1", p1.x);
            lineTR.setAttribute("y1", p1.y);
            lineTR.setAttribute("x2", rect.right);
            lineTR.setAttribute("y2", rect.top);
          }
          if (lineBL && mainBL) {
            const p1 = getCenterCoords(mainBL);
            lineBL.setAttribute("x1", p1.x);
            lineBL.setAttribute("y1", p1.y);
            lineBL.setAttribute("x2", rect.left);
            lineBL.setAttribute("y2", rect.bottom);
          }
          if (lineBR && mainBR) {
            const p1 = getCenterCoords(mainBR);
            lineBR.setAttribute("x1", p1.x);
            lineBR.setAttribute("y1", p1.y);
            lineBR.setAttribute("x2", rect.right);
            lineBR.setAttribute("y2", rect.bottom);
          }
        });

        requestAnimationFrame(updateConnectionLines);
      }
      
      // Start the loop
      requestAnimationFrame(updateConnectionLines);


      /* =========================================
         DYNAMIC LABEL LOGIC
         ========================================= */
      const dynamicLabel = document.getElementById('dynamic-label');
      let dlAnimFrame;

      const updateDlPosition = (prodCard) => {
        if (dynamicLabel && dynamicLabel.classList.contains('visible') && prodCard) {
          const rect = prodCard.getBoundingClientRect();
          dynamicLabel.style.left = `${rect.right - 48}px`;
          
          const imgEl = prodCard.querySelector('img');
          if (imgEl) {
            const imgRect = imgEl.getBoundingClientRect();
            const dlRect = dynamicLabel.getBoundingClientRect();
            const targetBottom = imgRect.bottom - (imgRect.height * 0.20);
            dynamicLabel.style.top = `${targetBottom - dlRect.height}px`;
            
            const dlTopText = dynamicLabel.querySelector('.dl-top-text');
            if (dlTopText) {
              dlTopText.textContent = imgEl.alt.trim().toUpperCase();
            }
          } else {
            dynamicLabel.style.top = `${rect.top}px`;
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
    });
