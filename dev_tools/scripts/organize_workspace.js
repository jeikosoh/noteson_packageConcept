const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const scriptsTargetDir = path.join(rootDir, 'dev_tools/scripts');
const logsTargetDir = path.join(rootDir, 'dev_tools/logs_temp');

// Create directories if they don't exist
if (!fs.existsSync(scriptsTargetDir)) {
  fs.mkdirSync(scriptsTargetDir, { recursive: true });
}
if (!fs.existsSync(logsTargetDir)) {
  fs.mkdirSync(logsTargetDir, { recursive: true });
}

// Temporary script files to move
const scriptFiles = [
  'builder.js', 'builder2.js', 'builder3.js', 'builder4.js',
  'check_console.js', 'check_divs.js', 'check_dots.js',
  'download-slides.js', 'extract_html.js', 'extract_js.js',
  'extract_script.js', 'extract_vid.js', 'extract_vid2.js',
  'figma-build.js', 'figma-pull.js', 'figma-sync.js',
  'finish_rebuild.js', 'fix_css.js', 'fix_css2.js',
  'fix_html.js', 'fix_script.js', 'parse_diff.js',
  'parse_diff2.js', 'parse_diff3.js', 'parse_diff4.js',
  'parse_diff5.js', 'patch.js', 'rebuild_html.js',
  'recover_script.js', 'update_html.js', 'test2.js',
  'test3.js', 'test4.js', 'testFirebase.js', 'testRender.js',
  'testRender2.js', 'testRender3.js', 'testRender4.js',
  'test_add_event.js', 'test_script.js', 'test_script2.js',
  'test_script3.js'
];

// Temporary text/log files to move
const logFiles = [
  'all_code.txt', 'all_replacements.txt', 'cards_html.txt',
  'extracted_html.log', 'extracted_scripts.txt', 'full_diff.txt',
  'full_diff_fixed.txt', 'last_message.txt', 'reconstructed.txt',
  'replace_logs.txt', 'script_chunks.txt', 'system_diff.txt',
  'temp.js', 'temp2.js', 'user_diff.txt'
];

// Move function
function moveFile(filename, targetFolder) {
  const src = path.join(rootDir, filename);
  const dest = path.join(targetFolder, filename);
  if (fs.existsSync(src)) {
    try {
      fs.renameSync(src, dest);
      console.log(`Moved: ${filename} -> ${path.relative(rootDir, dest)}`);
    } catch (err) {
      console.error(`Failed to move ${filename}:`, err);
    }
  }
}

console.log('Starting workspace organization...');
scriptFiles.forEach(file => moveFile(file, scriptsTargetDir));
logFiles.forEach(file => moveFile(file, logsTargetDir));
console.log('Workspace organization complete!');
