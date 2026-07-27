const fs = require('fs');
const scriptContent = fs.readFileSync('script.html', 'utf8');
const file = '/Users/jeikosoh/Work Station/002_NOTES_ON/index.html';
let html = fs.readFileSync(file, 'utf8');

// If there's already a script tag, remove it
html = html.replace(/<script>[\s\S]*<\/script>/, '');
html = html.replace('</body>', scriptContent + '\n</body>');

fs.writeFileSync(file, html);
console.log('Script recovered.');
