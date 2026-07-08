const fs = require('fs');

// 1. Get the current index.html which has the correct <head> and <body> structure, up to the end of <section id="view-home">
const currentIndex = fs.readFileSync('index.html', 'utf8');
const beforeCards = currentIndex.substring(0, currentIndex.indexOf('      <!-- ABOUT VIEW -->'));

const afterCards = currentIndex.substring(currentIndex.indexOf('      <!-- ABOUT VIEW -->'));
// Wait, the about view and other views are STILL in index.html!
// I just need to insert the product cards and video player right before <script src="src/App.js">!
// Or wait, in all_code.txt, the product cards were placed AFTER the script tag?
// No, the script tag was the last thing in the body!
// The product cards were placed AT THE END of <section id="view-home"> or just before </body>.
