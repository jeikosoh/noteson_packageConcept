const fs = require('fs');
const path = require('path');
const https = require('https');

const slideUrls = [
  "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/b452ef82-7509-45a4-9070-8c8f2a07f6ff",
  "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/2331f49d-89a5-4036-bd93-11a26ba195dd",
  "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/42139969-5813-4332-a833-810f2784ffc5",
  "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/f2295428-f8f5-43a0-bf75-dfe3c9d54db9",
  "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/5d3fde68-2250-45c1-8282-c43b5847eaf9",
  "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/46ad21b2-394f-488d-aa8f-81b67309493f",
  "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/572127c7-440e-4f2e-8661-71484f8c2227",
  "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/68ca76b0-b719-42b7-825d-50ebfda13a94",
  "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/fd040603-62cc-4071-99d9-db837b595ee9"
];

const outputDir = path.join(__dirname, '03_CONTENTS', 'slides');

// 디렉토리가 없으면 생성
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`📁 생성된 디렉토리: ${outputDir}`);
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: Status Code ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {}); // 에러 발생 시 부분 생성된 파일 삭제
      reject(err);
    });
  });
}

async function start() {
  console.log('🚀 피그마 슬라이드 이미지 다운로드 시작...');
  for (let i = 0; i < slideUrls.length; i++) {
    const slideNum = i + 1;
    const destName = `slide${slideNum}.png`;
    const destPath = path.join(outputDir, destName);
    console.log(`📡 Slide ${slideNum} 다운로드 중: ${slideUrls[i]}`);
    try {
      await downloadImage(slideUrls[i], destPath);
      console.log(`✅ Slide ${slideNum} 저장 완료: ${destName}`);
    } catch (err) {
      console.error(`❌ Slide ${slideNum} 다운로드 실패:`, err.message);
    }
  }
  console.log('🎉 모든 슬라이드 이미지 다운로드 작업 완료!');
}

start();
