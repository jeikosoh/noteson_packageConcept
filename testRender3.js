const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('function renderCalendar() {', 'function renderCalendar() { console.log("renderCalendar called, appData is:", !!appData);');

const dom = new JSDOM(html, { 
  runScripts: "dangerously", 
  url: "http://localhost/",
  beforeParse(window) {
    window.notesOnDataStore = {
      loadDataAsync: async () => ({
        calendar: {
          events: [
            { date: "2026-07-15", title1: "Summer Tasting" }
          ]
        },
        teaOfTheMonth: { name: "Test", description: { tasteNotes: [] }, recipes: { hot: {}, iced: {}, coldbrew: {} }, story: { body: "" } },
        videoPlayer: {},
        productCards: [ { badge: {}, dynamicLabel: {} }, { badge: {}, dynamicLabel: {} } ]
      })
    };
  }
});

setTimeout(() => {
  dom.window.document.getElementById('next-month-btn').click();
  dom.window.document.getElementById('prev-month-btn').click();
}, 2000);
