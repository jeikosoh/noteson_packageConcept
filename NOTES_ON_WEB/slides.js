document.addEventListener('DOMContentLoaded', () => {
  // === 1. DOM 요소 취득 ===
  const activeSlideImg = document.getElementById('active-slide');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const currentIndexDisplay = document.getElementById('current-index-display');
  const totalCountDisplay = document.getElementById('total-count-display');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const themeToggle = document.getElementById('theme-toggle');
  const themeText = themeToggle.querySelector('.theme-text');
  const sunIcon = themeToggle.querySelector('.sun-icon');
  const moonIcon = themeToggle.querySelector('.moon-icon');
  const thumbTrack = document.querySelector('.thumbnails-track');
  const deckSelect = document.getElementById('deck-select');

  // 전체화면 관련 DOM
  const slidesApp = document.querySelector('.slides-app');
  const fullscreenToggle = document.getElementById('fullscreen-toggle');
  const expandIcon = fullscreenToggle.querySelector('.expand-icon');
  const shrinkIcon = fullscreenToggle.querySelector('.shrink-icon');
  const fullscreenText = fullscreenToggle.querySelector('.fullscreen-text');

  // === 2. 덱 구성 정보 ===
  const decks = {
    v1: {
      name: "DECK 01: PACKAGE CONCEPT",
      folder: "03_CONTENTS/slides_v1",
      count: 9
    },
    v2: {
      name: "DECK 02: PRODUCT LINE-UP",
      folder: "03_CONTENTS/slides_v2",
      count: 9
    }
  };

  // URL Query Param 파싱 (?deck=v1 or ?deck=v2)
  const urlParams = new URLSearchParams(window.location.search);
  let currentDeckKey = urlParams.get('deck') || 'v2';
  if (!decks[currentDeckKey]) currentDeckKey = 'v2';

  let currentIndex = 0;
  let totalSlides = 9;
  let slides = [];
  let thumbItems = [];

  function loadDeck(deckKey) {
    const deckInfo = decks[deckKey];
    totalSlides = deckInfo.count;
    currentIndex = 0;

    slides = Array.from({ length: totalSlides }, (_, i) => ({
      src: `${deckInfo.folder}/slide${i + 1}.png`,
      alt: `${deckInfo.name} - Slide ${i + 1}`
    }));

    if (totalCountDisplay) {
      totalCountDisplay.textContent = String(totalSlides).padStart(2, '0');
    }

    // 썸네일 동적 생성
    if (thumbTrack) {
      thumbTrack.innerHTML = '';
      slides.forEach((slide, i) => {
        const btn = document.createElement('button');
        btn.className = `thumb-item ${i === 0 ? 'active' : ''}`;
        btn.setAttribute('data-index', i);
        btn.setAttribute('aria-label', `슬라이드 ${i + 1}로 이동`);
        btn.innerHTML = `
          <img src="${slide.src}" alt="Thumbnail ${i + 1}">
          <span class="thumb-num">${String(i + 1).padStart(2, '0')}</span>
        `;
        btn.addEventListener('click', () => {
          if (i > currentIndex) {
            goToSlide(i, 'forward');
          } else if (i < currentIndex) {
            goToSlide(i, 'backward');
          }
        });
        thumbTrack.appendChild(btn);
      });
      thumbItems = thumbTrack.querySelectorAll('.thumb-item');
    }

    // 1번 슬라이드로 세팅
    updateDOM(0);
  }

  if (deckSelect) {
    deckSelect.value = currentDeckKey;
    deckSelect.addEventListener('change', (e) => {
      const selectedKey = e.target.value;
      if (decks[selectedKey]) {
        currentDeckKey = selectedKey;
        const newUrl = `${window.location.pathname}?deck=${currentDeckKey}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
        loadDeck(currentDeckKey);
      }
    });
  }

  // 초기 덱 로딩
  loadDeck(currentDeckKey);

  // === 3. 테마 토글 (라이트 / 다크) ===
  const savedTheme = localStorage.getItem('noteson-slides-theme') || 'light';
  if (savedTheme === 'dark') {
    enableDarkMode();
  } else {
    enableLightMode();
  }

  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark-mode');
    if (isDark) {
      enableLightMode();
    } else {
      enableDarkMode();
    }
  });

  function enableDarkMode() {
    document.documentElement.classList.add('dark-mode');
    document.documentElement.classList.remove('light-mode');
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
    themeText.textContent = 'LIGHT MODE';
    localStorage.setItem('noteson-slides-theme', 'dark');
  }

  function enableLightMode() {
    document.documentElement.classList.remove('dark-mode');
    document.documentElement.classList.add('light-mode');
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
    themeText.textContent = 'DARK MODE';
    localStorage.setItem('noteson-slides-theme', 'light');
  }

  // === 3-1. 전체화면 토글 제어 ===
  fullscreenToggle.addEventListener('click', toggleFullscreen);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      slidesApp.requestFullscreen().catch(err => {
        console.error(`전체화면 모드 진입 실패: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }

  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
      expandIcon.style.display = 'none';
      shrinkIcon.style.display = 'block';
      fullscreenText.textContent = 'EXIT FULL';
    } else {
      expandIcon.style.display = 'block';
      shrinkIcon.style.display = 'none';
      fullscreenText.textContent = 'FULLSCREEN';
    }
  });

  // === 4. 슬라이드 전환 핵심 로직 (View Transitions API 적용) ===
  function goToSlide(newIndex, direction) {
    if (newIndex === currentIndex) return;

    if (newIndex < 0) {
      newIndex = totalSlides - 1;
    } else if (newIndex >= totalSlides) {
      newIndex = 0;
    }

    if (!document.startViewTransition) {
      updateDOM(newIndex);
      currentIndex = newIndex;
      return;
    }

    document.startViewTransition({
      update: () => updateDOM(newIndex),
      types: [direction]
    });

    currentIndex = newIndex;
  }

  // DOM 갱신 기능
  function updateDOM(newIndex) {
    if (!slides[newIndex]) return;
    activeSlideImg.src = slides[newIndex].src;
    activeSlideImg.alt = slides[newIndex].alt;

    const formattedNum = String(newIndex + 1).padStart(2, '0');
    if (currentIndexDisplay) currentIndexDisplay.textContent = formattedNum;

    const progressPercent = ((newIndex + 1) / totalSlides) * 100;
    if (progressBarFill) progressBarFill.style.width = `${progressPercent}%`;

    if (thumbItems && thumbItems.length > 0) {
      thumbItems.forEach((item, idx) => {
        if (idx === newIndex) {
          item.classList.add('active');
          item.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        } else {
          item.classList.remove('active');
        }
      });
    }
  }

  // === 5. 이벤트 리스너 설정 ===
  btnPrev.addEventListener('click', () => {
    goToSlide(currentIndex - 1, 'backward');
  });

  btnNext.addEventListener('click', () => {
    goToSlide(currentIndex + 1, 'forward');
  });

  // === 6. 키보드 네비게이션 지원 ===
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      goToSlide(currentIndex - 1, 'backward');
    } else if (e.key === 'ArrowRight') {
      goToSlide(currentIndex + 1, 'forward');
    }
  });

  // === 7. 모바일 터치 스와이프 지원 ===
  let touchStartX = 0;
  let touchEndX = 0;
  const minSwipeDistance = 50;
  const slideViewport = document.querySelector('.slide-viewport');

  slideViewport.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  slideViewport.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeDistance = touchEndX - touchStartX;
    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        goToSlide(currentIndex - 1, 'backward');
      } else {
        goToSlide(currentIndex + 1, 'forward');
      }
    }
  }
});
