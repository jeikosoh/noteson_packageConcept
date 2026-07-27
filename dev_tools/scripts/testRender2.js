const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');

// We must set the mock BEFORE JSDOM parses it, so we use beforeParse
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
  const boxes = dom.window.document.querySelectorAll('.week-box');
  const events = dom.window.document.querySelectorAll('.week-box.event');
  console.log("Total boxes:", boxes.length);
  console.log("Event boxes initially:", events.length);
  
  // Now simulate click next month
  dom.window.document.getElementById('next-month-btn').click();
  const eventsNext = dom.window.document.querySelectorAll('.week-box.event');
  console.log("Event boxes next month:", eventsNext.length);

  // Now simulate click prev month
  dom.window.document.getElementById('prev-month-btn').click();
  const eventsPrev = dom.window.document.querySelectorAll('.week-box.event');
  console.log("Event boxes prev month:", eventsPrev.length);
}, 2000);
