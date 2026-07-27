const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('function renderCalendar() {', `function renderCalendar() {
  console.log("renderCalendar called");
  console.log("currentCalendarDate:", currentCalendarDate);
  console.log("year:", currentCalendarDate.getFullYear(), "month:", currentCalendarDate.getMonth());
  console.log("appData exists?", !!appData);
  if (appData) console.log("events in appData:", appData.calendar.events);
`);

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
