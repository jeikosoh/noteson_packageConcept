// NOTES ON NYC Figma Plugin v3.0 — code.js
// 방식: getComputedStyle + getBoundingClientRect 기반 정밀 트리 → Figma 노드

figma.showUI(__html__, { width: 320, height: 620, title: 'NOTES ON NYC Sync' });

/* ── 유틸 ─────────────────────────────────── */
function toSolidFill(c) {
  if (!c) return null;
  return { type: 'SOLID', color: { r: c.r, g: c.g, b: c.b }, opacity: c.a };
}

function safeChars(s) {
  var t = (s || '').trim();
  return t.length > 0 ? t : ' ';
}

function getFrames(page) {
  try {
    return page.children
      .filter(function(n) { return n.type === 'FRAME' || n.type === 'SECTION'; })
      .map(function(n) { return { id: n.id, name: n.name }; });
  } catch(e) {
    return [];
  }
}

/* ── 폰트 매핑 (Figma에 없는 폰트 → Inter 대체) ── */
var FONT_FALLBACK = {
  '-apple-system':       'Inter',
  'BlinkMacSystemFont':  'Inter',
  'system-ui':           'Inter',
  'Segoe UI':            'Inter',
  'Arial':               'Inter',
  'Helvetica':           'Helvetica Neue',
  'Helvetica Neue':      'Helvetica Neue',
  'Georgia':             'Georgia',
  'Times New Roman':     'Times New Roman',
  'Courier New':         'Courier New',
  'monospace':           'Roboto Mono',
  'Roboto Mono':         'Roboto Mono',
  'Roboto':              'Roboto',
  'Inter':               'Inter',
};

function mapFont(family) {
  return FONT_FALLBACK[family] || 'Inter';
}

function fontStyle(weight) {
  if (weight >= 700) return 'Bold';
  if (weight >= 500) return 'Medium';
  return 'Regular';
}

/* ── 폰트 사전 수집 ─────────────────────────── */
function collectFonts(node, set) {
  if (!node) return;
  if (node.type === 'TEXT') {
    var family = mapFont(node.fontFamily || 'Inter');
    var style  = fontStyle(node.fontWeight || 400);
    set[family + '|' + style] = { family: family, style: style };
    // Medium이 없을 경우를 대비해 Regular도 등록
    if (style === 'Medium') {
      set[family + '|Regular'] = { family: family, style: 'Regular' };
    }
  }
  if (node.children) {
    for (var i = 0; i < node.children.length; i++) {
      collectFonts(node.children[i], set);
    }
  }
}

/* ── 폰트 로드 (실패 시 Inter로 대체) ────────── */
function loadFonts(fontMap) {
  var keys = Object.keys(fontMap);
  var loaded = {};

  function loadNext(i) {
    if (i >= keys.length) return Promise.resolve(loaded);
    var k = keys[i];
    var f = fontMap[k];
    return figma.loadFontAsync(f)
      .then(function() {
        loaded[k] = f;
        return loadNext(i + 1);
      })
      .catch(function() {
        // 해당 폰트 없음 → Inter로 대체
        var fallback = { family: 'Inter', style: f.style === 'Bold' ? 'Bold' : 'Regular' };
        loaded[k] = fallback;
        return figma.loadFontAsync(fallback)
          .then(function() { return loadNext(i + 1); })
          .catch(function() {
            loaded[k] = { family: 'Inter', style: 'Regular' };
            return loadNext(i + 1);
          });
      });
  }

  return loadNext(0);
}

/* ── Figma 노드 재귀 생성 ────────────────────── */
function buildNode(node, parent, parentX, parentY, loadedFonts) {
  if (!node) return;

  var relX = node.x - parentX;
  var relY = node.y - parentY;

  if (node.type === 'TEXT') {
    var raw = safeChars(node.text);
    var family = mapFont(node.fontFamily || 'Inter');
    var style  = fontStyle(node.fontWeight || 400);
    var fontKey = family + '|' + style;
    var font = loadedFonts[fontKey] || { family: 'Inter', style: 'Regular' };

    var t = figma.createText();
    t.x = relX;
    t.y = relY;
    t.fontName  = font;
    t.characters = raw;
    t.fontSize  = node.fontSize || 16;
    if (node.lineHeight && node.lineHeight > 0) {
      t.lineHeight = { value: node.lineHeight, unit: 'PIXELS' };
    }
    if (node.letterSpacing && node.letterSpacing !== 0) {
      t.letterSpacing = { value: node.letterSpacing, unit: 'PIXELS' };
    }
    if (node.color) {
      var fill = toSolidFill(node.color);
      if (fill) t.fills = [fill];
    }
    if (node.textAlign === 'center') t.textAlignHorizontal = 'CENTER';
    if (node.textAlign === 'right')  t.textAlignHorizontal = 'RIGHT';

    if (node.opacity !== undefined && node.opacity < 1) t.opacity = node.opacity;
    // 텍스트 영역이 고정 크기가 아니면 텍스트 길이에 따라 부모 크기를 넘을 수 있으므로 autoResize 적용
    t.textAutoResize = 'WIDTH_AND_HEIGHT';
    parent.appendChild(t);

  } else if (node.type === 'SVG') {
    try {
      var svgNode = figma.createNodeFromSvg(node.svg);
      svgNode.x = relX;
      svgNode.y = relY;
      svgNode.resize(Math.max(node.w, 1), Math.max(node.h, 1));
      svgNode.name = 'SVG';
      parent.appendChild(svgNode);
    } catch(e) {
      console.error('SVG import fail', e);
    }
  } else {
    // FRAME
    var f = figma.createFrame();
    f.x = relX;
    f.y = relY;
    f.resize(Math.max(node.w, 1), Math.max(node.h, 1));
    f.name = node.tag || 'div';
    f.clipsContent = true;

    // 배경
    if (node.bg) {
      var bgFill = toSolidFill(node.bg);
      f.fills = bgFill ? [bgFill] : [];
    } else {
      f.fills = [];
    }

    // 보더
    if (node.borderColor && node.borderWidth > 0) {
      var bFill = toSolidFill(node.borderColor);
      if (bFill) {
        f.strokes = [bFill];
        f.strokeWeight = Math.max(node.borderWidth, 1);
        f.strokeAlign = 'INSIDE';
      }
    }

    // 보더 레디어스
    if (node.borderRadius > 0) {
      f.cornerRadius = node.borderRadius;
    }

    // 불투명도
    if (node.opacity !== undefined && node.opacity < 1) {
      f.opacity = node.opacity;
    }

    parent.appendChild(f);

    // 자식 재귀
    var children = node.children || [];
    for (var i = 0; i < children.length; i++) {
      buildNode(children[i], f, node.x, node.y, loadedFonts);
    }
  }
}

/* ── push-tree: 트리 기반 빌더 ──────────────── */
function buildFromTree(tree, targetFrameId) {
  var page = figma.currentPage;

  // 폰트 수집
  var fontSet = {};
  // 항상 Inter 계열 미리 등록
  fontSet['Inter|Regular'] = { family: 'Inter', style: 'Regular' };
  fontSet['Inter|Bold']    = { family: 'Inter', style: 'Bold' };
  collectFonts(tree, fontSet);

  return loadFonts(fontSet).then(function(loadedFonts) {
    figma.ui.postMessage({ type: 'import-progress', step: 80, total: 100, label: 'Figma 노드 생성 중...' });

    // 루트 프레임 설정
    var root = null;
    if (targetFrameId && targetFrameId !== 'new') {
      var found = figma.getNodeById(targetFrameId);
      if (found && found.type === 'FRAME') {
        var ch = found.children.slice();
        for (var i = 0; i < ch.length; i++) ch[i].remove();
        root = found;
        root.resize(tree.w || 1440, tree.h || 900);
      }
    }
    if (!root) {
      root = figma.createFrame();
      root.name = 'NOTES ON NYC — Precise Import';
      page.appendChild(root);
      root.resize(tree.w || 1440, tree.h || 900);
    }

    root.fills = tree.bg ? [toSolidFill(tree.bg)] : [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

    // 자식 노드 재귀 생성
    var children = tree.children || [];
    for (var i = 0; i < children.length; i++) {
      buildNode(children[i], root, tree.x || 0, tree.y || 0, loadedFonts);
    }

    figma.viewport.scrollAndZoomIntoView([root]);
    return Promise.resolve();
  });
}

/* ── 이벤트 리스너 ────────────────────────── */
figma.on('selectionchange', function() {
  var sel = figma.currentPage.selection;
  if (sel.length > 0) {
    var node = sel[0];
    if (node.type === 'FRAME' || node.type === 'SECTION') {
      figma.ui.postMessage({
        type: 'selection-changed',
        frameId: node.id,
        frameName: node.name
      });
    }
  }
});

/* ── 메시지 핸들러 ───────────────────────────── */
figma.ui.onmessage = function(msg) {
  if (!msg) return;

  /* UI 준비 완료 → 초기 데이터 전송 */
  if (msg.type === 'ready') {
    figma.ui.postMessage({
      type: 'init-data',
      pages: figma.root.children.map(function(p) { return { id: p.id, name: p.name }; }),
      frames: getFrames(figma.currentPage),
      currentPageId: figma.currentPage.id
    });
    return;
  }

  /* 플러그인 리사이즈 */
  if (msg.type === 'resize') {
    figma.ui.resize(msg.width, msg.height);
    return;
  }

  /* 페이지 전환 */
  if (msg.type === 'change-page') {
    var page = null;
    for (var i = 0; i < figma.root.children.length; i++) {
      if (figma.root.children[i].id === msg.pageId) {
        page = figma.root.children[i]; break;
      }
    }
    if (page) {
      figma.setCurrentPageAsync(page).then(function() {
        figma.ui.postMessage({ type: 'frames-updated', frames: getFrames(page) });
      });
    }
    return;
  }

  /* 정밀 트리 기반 Import (새 방식) */
  if (msg.type === 'push-tree') {
    figma.ui.postMessage({ type: 'import-progress', step: 76, total: 100, label: '폰트 로드 중...' });
    buildFromTree(msg.tree, msg.targetFrameId)
      .then(function() {
        figma.ui.postMessage({ type: 'import-done', success: true, text: '✓ 정밀 Import 완료!' });
      })
      .catch(function(err) {
        var msg2 = err && err.message ? err.message : String(err);
        console.error('[NOTES ON] push-tree error:', msg2);
        figma.ui.postMessage({ type: 'import-done', success: false, text: '✗ ' + msg2 });
      });
    return;
  }

  /* 구버전 호환 (push-html) */
  if (msg.type === 'push-html') {
    figma.ui.postMessage({ type: 'import-done', success: false, text: '✗ 구버전 방식 — 플러그인을 재시작하세요.' });
    return;
  }

  /* Figma → Export */
  if (msg.type === 'pull-figma') {
    var node = (msg.frameId && msg.frameId !== 'all') ? figma.getNodeById(msg.frameId) : figma.currentPage;
    if (!node) {
      figma.ui.postMessage({ type: 'export-done', format: msg.format, data: {}, text: '✗ 프레임을 찾을 수 없습니다' });
      return;
    }
    
    // 전체 노드 개수 세기 (진행률 표시용)
    var total = 0;
    function countNodes(n) {
      total++;
      try {
        if ('children' in n && n.children) {
          for(var i=0; i<n.children.length; i++) countNodes(n.children[i]);
        }
      } catch(e) {}
    }
    countNodes(node);

    var texts = {}, colors = {};
    var current = 0;

    async function walkTree(n) {
      current++;
      if (current % 100 === 0) {
        figma.ui.postMessage({ type: 'export-progress', step: current, total: total, label: `데이터 수집 중 (${current}/${total})` });
        await new Promise(r => setTimeout(r, 5));
      }

      var compData = {};
      try {
        if (n.type === 'TEXT') {
          var k = n.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/, '');
          texts[k] = n.characters.trim();
        }
        if (n.fills && Array.isArray(n.fills) && n.fills[0] && n.fills[0].type === 'SOLID') {
          var c = n.fills[0].color;
          var hex = '#' + [c.r, c.g, c.b].map(function(v) {
            return Math.round(v * 255).toString(16).padStart(2, '0');
          }).join('');
          var k2 = n.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/, '');
          colors[k2] = hex;
        }
        
        compData = {
          id: n.id,
          name: n.name,
          type: n.type,
          x: n.x, y: n.y, width: n.width, height: n.height,
          rotation: n.rotation || 0,
          opacity: n.opacity !== undefined ? n.opacity : 1,
          blendMode: n.blendMode || 'NORMAL',
          isMask: n.isMask || false,
        };

        // 시맨틱 컴포넌트 여부 판단
        var isComponent = false;
        if (n.type === 'COMPONENT' || n.type === 'INSTANCE') isComponent = true;
        // 이름이 모두 대문자이고 길이가 2 이상이면 메인 섹션으로 인식 (숫자만 있는 경우 제외)
        if (n.name && n.name === n.name.toUpperCase() && n.name.length >= 2 && !n.name.match(/^[0-9_]+$/)) {
          isComponent = true;
        }
        // 벡터 그룹(아이콘 등) 식별
        if (n.type === 'VECTOR' || n.type === 'BOOLEAN_OPERATION' || n.type === 'LINE') {
          compData.isVectorAsset = true;
        }
        compData.isComponent = isComponent;

        // Fills, Strokes, Effects, Constraints
        try { if (n.fills && Array.isArray(n.fills) && n.fills.length > 0) compData.fills = JSON.parse(JSON.stringify(n.fills)); } catch(e){}
        try { if (n.strokes && Array.isArray(n.strokes) && n.strokes.length > 0) compData.strokes = JSON.parse(JSON.stringify(n.strokes)); } catch(e){}
        if (n.strokeWeight !== undefined) compData.strokeWeight = n.strokeWeight;
        if (n.strokeAlign) compData.strokeAlign = n.strokeAlign;
        
        try { if (n.effects && Array.isArray(n.effects) && n.effects.length > 0) compData.effects = JSON.parse(JSON.stringify(n.effects)); } catch(e){}
        try { if (n.constraints) compData.constraints = JSON.parse(JSON.stringify(n.constraints)); } catch(e){}
        if (n.layoutAlign) compData.layoutAlign = n.layoutAlign;
        if (n.layoutGrow !== undefined) compData.layoutGrow = n.layoutGrow;
        
        // 프레임 및 오토레이아웃 속성
        if (n.type === 'FRAME' || n.type === 'COMPONENT' || n.type === 'INSTANCE' || n.type === 'GROUP' || n.type === 'SECTION') {
          compData.clipsContent = !!n.clipsContent;
          compData.layoutMode = n.layoutMode || "NONE";
          compData.primaryAxisSizingMode = n.primaryAxisSizingMode || "FIXED";
          compData.counterAxisSizingMode = n.counterAxisSizingMode || "FIXED";
          compData.primaryAxisAlignItems = n.primaryAxisAlignItems || "MIN";
          compData.counterAxisAlignItems = n.counterAxisAlignItems || "MIN";
          compData.itemSpacing = n.itemSpacing || 0;
          compData.itemReverseZIndex = !!n.itemReverseZIndex;
          compData.strokesIncludedInLayout = !!n.strokesIncludedInLayout;
          compData.paddingLeft = n.paddingLeft || 0;
          compData.paddingRight = n.paddingRight || 0;
          compData.paddingTop = n.paddingTop || 0;
          compData.paddingBottom = n.paddingBottom || 0;
          compData.cornerRadius = typeof n.cornerRadius === 'number' ? n.cornerRadius : 0;
          
          if (typeof n.topLeftRadius === 'number') {
            compData.topLeftRadius = n.topLeftRadius;
            compData.topRightRadius = n.topRightRadius;
            compData.bottomLeftRadius = n.bottomLeftRadius;
            compData.bottomRightRadius = n.bottomRightRadius;
          }
        } 
        // 텍스트 상세 속성
        else if (n.type === 'TEXT') {
          compData.text = n.characters;
          compData.fontSize = n.fontSize;
          compData.fontName = n.fontName ? JSON.parse(JSON.stringify(n.fontName)) : null;
          compData.fontWeight = n.fontWeight;
          compData.textAlign = n.textAlignHorizontal;
          compData.textAlignVertical = n.textAlignVertical;
          compData.textAutoResize = n.textAutoResize;
          compData.lineHeight = n.lineHeight ? JSON.parse(JSON.stringify(n.lineHeight)) : null;
          compData.letterSpacing = n.letterSpacing ? JSON.parse(JSON.stringify(n.letterSpacing)) : null;
          compData.textDecoration = n.textDecoration || "NONE";
        }

        // 자식 재귀 탐색
        if ('children' in n && n.children) {
          compData.children = [];
          for (var i = 0; i < n.children.length; i++) {
            var childData = await walkTree(n.children[i]);
            compData.children.push(childData);
          }
        }

      } catch (nodeErr) {
        console.error("Skipping node property due to error:", n.name, nodeErr);
      }
      return compData;
    }

    walkTree(node).then(async (treeData) => {
      var imageBytes = null;
      try {
        figma.ui.postMessage({ type: 'export-progress', step: total, total: total, label: '스크린샷 생성 중...' });
        
        var targetNode = node;
        // 전체 페이지 옵션일 경우, 내부의 첫 번째 프레임을 타겟으로 변경
        if (node.type === 'PAGE' && node.children.length > 0) {
           var frames = node.children.filter(function(c) { return c.type === 'FRAME' || c.type === 'SECTION'; });
           if (frames.length > 0) {
             targetNode = frames[0];
           }
        }
        
        imageBytes = await targetNode.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
      } catch (e) {
        console.error("Screenshot capture failed", e);
      }
      
      var safeName = (node.name || 'figma_design').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

      figma.ui.postMessage({
        type: 'export-done',
        format: msg.format,
        data: { texts: texts, colors: colors, tree: treeData },
        imageBytes: imageBytes,
        filename: safeName,
        text: '✓ 시맨틱 트리 추출 및 캡처 완료'
      });
    }).catch(err => {
      figma.ui.postMessage({ type: 'export-done', format: msg.format, data: {}, text: '✗ ' + String(err) });
    });
    return;
  }
};
