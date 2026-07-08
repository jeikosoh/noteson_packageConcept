const fs = require('fs');
const path = require('path');

const dumpPath = path.join(__dirname, 'figma-dump.json');
if (!fs.existsSync(dumpPath)) {
  console.error('❌ figma-dump.json 파일이 존재하지 않습니다.');
  process.exit(1);
}

const figmaData = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));

// html.to.design이 생성한 섹션 노드 찾기
function findImportedSection(node) {
  if (node.name && node.name.includes('html.to.design')) {
    return node;
  }
  if (node.children) {
    for (const child of node.children) {
      const found = findImportedSection(child);
      if (found) return found;
    }
  }
  return null;
}

const targetSection = findImportedSection(figmaData.document);

if (!targetSection) {
  console.error('❌ Figma 파일 내에서 html.to.design으로 생성한 레이아웃을 찾지 못했습니다.');
  process.exit(1);
}

console.log(`🎯 수정을 반영할 피그마 레이어 섹션을 찾았습니다: "${targetSection.name}"`);

// 피그마 내 모든 텍스트 노드 추출 (텍스트 치환용)
function extractTexts(node, textMap = {}) {
  if (node.type === 'TEXT' && node.characters) {
    // 텍스트 고유 ID 또는 소문자 이름을 매핑 키로 사용
    textMap[node.name.toLowerCase().trim()] = node.characters.trim();
  }
  if (node.children) {
    node.children.forEach(child => extractTexts(child, textMap));
  }
  return textMap;
}

const texts = extractTexts(targetSection);
console.log('📝 피그마에서 변경된 텍스트 자산:', texts);

// 피그마 내 커스텀 컬러 변수 추출
function extractStyles(node, cssVars = {}) {
  if (node.fills && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.type === 'SOLID' && fill.color) {
      const r = Math.round(fill.color.r * 255);
      const g = Math.round(fill.color.g * 255);
      const b = Math.round(fill.color.b * 255);
      const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
      
      // 주황색 계열 감지 시 테마 기본 컬러로 치환 매핑
      if (r > 200 && g > 50 && g < 150 && b < 50) {
        cssVars['--color-primary'] = hex;
      }
    }
  }
  if (node.children) {
    node.children.forEach(child => extractStyles(child, cssVars));
  }
  return cssVars;
}

const customCSSVars = extractStyles(targetSection);
console.log('🎨 피그마에서 분석된 CSS 변수 토큰:', customCSSVars);

// HTML 덮어쓰기 및 동기화
const htmlPath = path.join(__dirname, 'index.html');
if (fs.existsSync(htmlPath)) {
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');

  // Figma 텍스트 기반 치환
  Object.keys(texts).forEach(key => {
    // 1. 헤더 로고 텍스트 치환
    if (key.includes('notes on nyc')) {
      htmlContent = htmlContent.replace(/NOTES ON NYC<\/div>/gi, `${texts[key]}</div>`);
    }
    // 2. new york 핵심 텍스트 치환
    if (key === 'new york' || key === 'new york city') {
      htmlContent = htmlContent.replace(/<span>new york<\/span>/gi, `<span>${texts[key]}</span>`);
      htmlContent = htmlContent.replace(/<span>NEW YORK<\/span>/gi, `<span>${texts[key]}</span>`);
    }
    // 3. 메인 설명구 치환
    if (key.includes('뉴욕시의 다양한 공간') || key.length > 60) {
      htmlContent = htmlContent.replace(/<p class="hero-desc">[\s\S]*?<\/p>/gi, `<p class="hero-desc">${texts[key]}</p>`);
    }
  });

  fs.writeFileSync(htmlPath, htmlContent);
  console.log('✅ index.html에 피그마 편집본 텍스트 적용 완료.');
}

// CSS 덮어쓰기 및 동기화
const cssPath = path.join(__dirname, 'src', 'index.css');
if (fs.existsSync(cssPath) && Object.keys(customCSSVars).length > 0) {
  let cssContent = fs.readFileSync(cssPath, 'utf8');
  
  Object.keys(customCSSVars).forEach(varName => {
    const regex = new RegExp(`${varName}:\\s*#[a-fA-F0-9]{6};`, 'g');
    cssContent = cssContent.replace(regex, `${varName}: ${customCSSVars[varName]};`);
  });

  fs.writeFileSync(cssPath, cssContent);
  console.log('✅ index.css에 피그마 편집본 컬러 토큰 적용 완료.');
}
