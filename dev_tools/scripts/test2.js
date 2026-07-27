const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");

const html = fs.readFileSync("admin.html", "utf8");
const dsJs = fs.readFileSync("dataStore.js", "utf8");
const adminJs = fs.readFileSync("admin.js", "utf8");

const dom = new JSDOM(html, { runScripts: "dangerously" });
dom.window.eval(dsJs);
dom.window.eval(adminJs);

dom.window.document.addEventListener("DOMContentLoaded", () => {
  try {
    dom.window.document.getElementById('cal-date').value = "2026-07-15";
    dom.window.document.getElementById('cal-title-1').value = "Title1";
    dom.window.document.getElementById('add-event-btn').click();
    
    const list = dom.window.document.getElementById('cal-events-list').innerHTML;
    console.log("List HTML:", list);
  } catch (e) {
    console.error("Error:", e);
  }
});
dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
