const fs = require('fs');
const path = require('path');

const conversationId = process.argv[2];
if (!conversationId) {
  console.error('Error: conversationId is required as the first argument.');
  process.exit(1);
}

const rootDir = path.resolve(__dirname, '../..');
const projectName = path.basename(rootDir);
const brainDir = `/Users/jeikosoh/.gemini/antigravity-ide/brain/${conversationId}`;
const transcriptPath = path.join(brainDir, '.system_generated/logs/transcript.jsonl');
const walkthroughPath = path.join(brainDir, 'walkthrough.md');

if (!fs.existsSync(transcriptPath)) {
  console.error(`Error: Transcript file not found at ${transcriptPath}`);
  process.exit(1);
}

// 1. Parse transcript.jsonl
const lines = fs.readFileSync(transcriptPath, 'utf8').trim().split('\n');
let userRequests = [];
let changedFiles = new Set();
let sessionTopic = '';

lines.forEach(line => {
  if (!line) return;
  try {
    const data = JSON.parse(line);
    if (data.type === 'USER_INPUT') {
      const match = data.content.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
      const req = match ? match[1].trim() : data.content;
      userRequests.push(req);
      if (!sessionTopic) {
        // Extract a clean topic from the first line of the first request
        sessionTopic = req.split('\n')[0].replace(/[#*`[\]]/g, '').trim().substring(0, 30);
      }
    } else if (data.source === 'MODEL' && data.content && typeof data.content === 'string') {
      // Analyze modified file paths
      const fileMatches = data.content.matchAll(/file:\/\/\/Users\/jeikosoh\/Work\sStation\/[^\s/)]+\/([^\s"'()]+)/gi);
      for (const m of fileMatches) {
        changedFiles.add(m[1]);
      }
    }
  } catch (e) {
    // Skip parse errors
  }
});

// 2. Determine category (folder) based on changed files
let category = '04_ARCHIVES'; // Default category
const categories = ['01_INVITATIONS', '02_BRAND', '03_CONTENTS', '99_FOUNDING_DOCUMENTS'];

for (const file of changedFiles) {
  const matchingCat = categories.find(cat => file.startsWith(cat + '/'));
  if (matchingCat) {
    category = matchingCat;
    break;
  }
}

// 3. Build Markdown Content
const today = new Date().toISOString().split('T')[0];
if (!sessionTopic) sessionTopic = '작업 로그';

let mdContent = `---
date: ${today}
project: ${projectName}
conversation_id: ${conversationId}
category: ${category}
tags:
  - antigravity
  - work-log
  - ${projectName.toLowerCase()}
---

# Antigravity 작업 & 대화 로그: ${sessionTopic}

## 1. 작업 개요 (Overview)

### 사용자의 주요 요청
${userRequests.map(req => `> ${req.replace(/\n/g, '\n> ')}`).join('\n\n')}

`;

// Append walkthrough.md if it exists
if (fs.existsSync(walkthroughPath)) {
  const walkthroughContent = fs.readFileSync(walkthroughPath, 'utf8');
  mdContent += `\n## 2. 작업 완료 보고 (Walkthrough)\n\n${walkthroughContent}\n`;
}

// Format detailed history
mdContent += `\n## 3. 대화 및 실행 이력 (Execution History)\n`;

lines.forEach(line => {
  if (!line) return;
  try {
    const data = JSON.parse(line);
    if (data.type === 'USER_INPUT') {
      const match = data.content.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
      const req = match ? match[1].trim() : data.content;
      mdContent += `\n### 👤 User Request\n\`\`\`\n${req}\n\`\`\`\n`;
    } else if (data.type === 'PLANNER_RESPONSE' && data.thinking) {
      const thoughts = data.thinking.trim();
      if (thoughts) {
        mdContent += `\n### 🤖 Antigravity Thought\n> ${thoughts.replace(/\n/g, '\n> ')}\n`;
      }
    }
  } catch (e) {}
});

// 4. Save to Obsidian (Project Directory)
const targetDir = path.join(rootDir, category);
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Create a safe filename
const safeTopic = sessionTopic.replace(/[^a-zA-Z0-9가-힣\s_-]/g, '').trim().replace(/\s+/g, '_');
const outputFilename = `${today}_${safeTopic}.md`;
const outputPath = path.join(targetDir, outputFilename);

fs.writeFileSync(outputPath, mdContent, 'utf8');
console.log(`Successfully saved Obsidian note to: ${outputPath}`);
