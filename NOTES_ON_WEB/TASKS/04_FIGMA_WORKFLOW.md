# 04_FIGMA_WORKFLOW

이 문서는 Figma와 웹사이트 코드(HTML/CSS/JS) 간의 디자인 컴포넌트 양방향 연동(Sync)을 구현하고 편집 편의성을 확보하기 위한 워크플로우 가이드라인입니다.

## 🔄 HTML과 Figma 동기화 설계

Figma에서 디자인을 편집했을 때 코드가 자동 업데이트되고, 코드의 구조가 Figma에 유지되도록 하기 위해 다음과 같은 방법을 적용합니다.

### 1단계: HTML -> Figma (디자인 추출)
*   **방법**: Figma의 **"HTML to Design"** 플러그인 또는 **Builder.io** 플러그인을 사용합니다.
*   **프로세스**: 
    1. 우리가 개발한 HTML 랜딩 페이지의 URL(또는 로컬 서버 주소)을 해당 플러그인에 입력합니다.
    2. 플러그인이 HTML의 DOM 구조와 CSS 스타일을 온전한 Figma Layer 및 Auto Layout 프레임으로 파싱하여 Figma 캔버스에 생성해 줍니다.
    3. Figma에서 각 컴포넌트(Header, Cards, Buttons)를 자유롭게 시각적으로 수정합니다.

### 2단계: Figma -> HTML (자동 코드 업데이트)
*   **방법**: Figma 플러그인(예: **Anima** 혹은 **Builder.io CLI**)을 사용합니다.
*   **프로세스**:
    1. Figma에서 디자인이 완료되거나 레이아웃을 수정하면, Anima/Builder.io를 통해 변경 사항을 추출합니다.
    2. 동기화 스크립트(CLI 또는 API 연동)를 통해 CSS 변수값(`--color-primary`, `--font-family` 등)과 컴포넌트 레이아웃 코드가 프로젝트 파일에 덮어씌워지도록 워크플로우를 자동화합니다.

---
*Prev: [03_WEB_SPECIFICATION](file:///Users/jeikosoh/Work%20Station/002_NOTES_ON/NOTES_ON_WEB/03_WEB_SPECIFICATION.md)*
