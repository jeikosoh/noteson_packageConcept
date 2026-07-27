const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html);
const dots = dom.window.document.querySelector('.dot-grid-overlay');
console.log("dots found?", !!dots);
console.log("className:", dots ? dots.className : "");
