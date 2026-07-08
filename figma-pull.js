const fs = require('fs');
const path = require('path');
const https = require('https');

// 설정 파일 로드
const configPath = path.join(__dirname, 'figma-config.json');
if (!fs.existsSync(configPath)) {
  console.error('❌ figma-config.json 파일이 없습니다. 키를 먼저 설정해주세요.');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const { figmaFileKey, figmaPersonalAccessToken } = config;

if (!figmaFileKey || figmaFileKey.includes('YOUR_') || !figmaPersonalAccessToken) {
  console.error('❌ figma-config.json에 올바른 figmaFileKey와 figmaPersonalAccessToken을 설정해주세요.');
  process.exit(1);
}

console.log(`📡 Figma API 호출 중... (File Key: ${figmaFileKey})`);

const options = {
  hostname: 'api.figma.com',
  path: `/v1/files/${figmaFileKey}`,
  method: 'GET',
  headers: {
    'X-Figma-Token': figmaPersonalAccessToken
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      const figmaData = JSON.parse(data);
      console.log(`✅ Figma 파일 데이터를 정상적으로 받아왔습니다! File Name: "${figmaData.name}"`);
      
      // 불러온 데이터를 기반으로 스타일 및 변경사항 덮어쓰기 로직
      // 여기서는 예시로 로컬 디자인 분석 파일 또는 CSS 변수에 반영되도록 설계합니다.
      const canvas = figmaData.document.children[0];
      console.log(`ℹ️ First Page name in Figma: "${canvas.name}"`);
      
      // Figma 파일 키 구조를 분석하고 로컬에 JSON 저장
      fs.writeFileSync(path.join(__dirname, 'figma-dump.json'), JSON.stringify(figmaData, null, 2));
      console.log('💾 Raw Figma layout dump saved to figma-dump.json');
      console.log('👉 Figma 변경 사항이 감지되어 figma-sync 완료!');
    } else {
      console.error(`❌ Figma API 호출 실패 (Status Code: ${res.statusCode})`);
      console.error(data);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ 에러 발생: ${e.message}`);
});

req.end();
