document.addEventListener('DOMContentLoaded', () => {
  // === 1. DOM 요소 취득 ===
  const activeSlideImg = document.getElementById('active-slide');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const currentIndexDisplay = document.getElementById('current-index-display');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const themeToggle = document.getElementById('theme-toggle');
  const themeText = themeToggle.querySelector('.theme-text');
  const sunIcon = themeToggle.querySelector('.sun-icon');
  const moonIcon = themeToggle.querySelector('.moon-icon');
  const thumbItems = document.querySelectorAll('.thumb-item');
  const thumbnailsContainer = document.querySelector('.thumbnails-container');

  // === 2. 상태 변수 ===
  let currentIndex = 0;
  const totalSlides = thumbItems.length;

  // 슬라이드 데이터 리스트
  const slides = Array.from({ length: totalSlides }, (_, i) => ({
    src: `03_CONTENTS/slides/slide${i + 1}.png`,
    alt: `Slide ${i + 1}`
  }));

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

  // === 4. 슬라이드 전환 핵심 로직 (View Transitions API 적용) ===
  function goToSlide(newIndex, direction) {
    if (newIndex === currentIndex) return;

    // 인덱스 범위 초과 방지 (순환 구조)
    if (newIndex < 0) {
      newIndex = totalSlides - 1;
    } else if (newIndex >= totalSlides) {
      newIndex = 0;
    }

    // View Transition 미지원 브라우저 대응 Fallback
    if (!document.startViewTransition) {
      updateDOM(newIndex);
      currentIndex = newIndex;
      return;
    }

    // 트랜지션 실행 및 방향(forward/backward) 주입
    document.startViewTransition({
      update: () => updateDOM(newIndex),
      types: [direction]
    });

    currentIndex = newIndex;
  }

  // DOM 갱신 기능 (View Transition 내부에서 호출됨)
  function updateDOM(newIndex) {
    // 1. 메인 슬라이드 이미지 변경
    activeSlideImg.src = slides[newIndex].src;
    activeSlideImg.alt = slides[newIndex].alt;

    // 2. 카운터 디스플레이 갱신 (01, 02 포맷)
    const formattedNum = String(newIndex + 1).padStart(2, '0');
    currentIndexDisplay.textContent = formattedNum;

    // 3. 프로그레스 바 갱신
    const progressPercent = ((newIndex + 1) / totalSlides) * 100;
    progressBarFill.style.width = `${progressPercent}%`;

    // 4. 썸네일 활성 클래스 갱신
    thumbItems.forEach((item, idx) => {
      if (idx === newIndex) {
        item.classList.add('active');
        // 활성화된 썸네일이 화면 영역에 보이도록 스크롤 동기화
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

  // === 5. 이벤트 리스너 설정 ===
  
  // 이전 버튼 클릭
  btnPrev.addEventListener('click', () => {
    goToSlide(currentIndex - 1, 'backward');
  });

  // 다음 버튼 클릭
  btnNext.addEventListener('click', () => {
    goToSlide(currentIndex + 1, 'forward');
  });

  // 썸네일 직접 클릭
  thumbItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetIndex = parseInt(item.getAttribute('data-index'), 10);
      if (targetIndex > currentIndex) {
        goToSlide(targetIndex, 'forward');
      } else if (targetIndex < currentIndex) {
        goToSlide(targetIndex, 'backward');
      }
    });
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
  const minSwipeDistance = 50; // 스와이프로 인식할 최소 거리 (픽셀)

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
        // 오른쪽으로 스와이프 => 이전 슬라이드
        goToSlide(currentIndex - 1, 'backward');
      } else {
        // 왼쪽으로 스와이프 => 다음 슬라이드
        goToSlide(currentIndex + 1, 'forward');
      }
    }
  }
});
