const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptStart = html.lastIndexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');
const scriptContent = html.substring(scriptStart + 8, scriptEnd);
fs.writeFileSync('test_script.js', scriptContent);
