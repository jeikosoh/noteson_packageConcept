const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");

const html = fs.readFileSync("admin.html", "utf8");
const js = fs.readFileSync("admin.js", "utf8");

const dom = new JSDOM(html, { runScripts: "dangerously" });
dom.window.eval(js);

try {
  dom.window.document.getElementById('cal-date').value = "2026-07-15";
  dom.window.document.getElementById('cal-title-1').value = "Title";
  dom.window.document.getElementById('add-event-btn').click();
  console.log("Events count:", dom.window.currentData.calendar.events.length);
} catch (e) {
  console.error("Error:", e);
}
