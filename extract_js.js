const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');

if (scriptStart !== -1 && scriptEnd !== -1) {
    const jsContent = html.substring(scriptStart + 8, scriptEnd);
    fs.writeFileSync('extracted.js', jsContent);
    console.log('Extracted JS to extracted.js');
} else {
    console.log('Script tag not found');
}
