// --- Imports ---
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const { createCanvas, Image } = require("canvas");

// --- Setup DOM environment for Fabric.js ---
const { window } = new JSDOM("<!DOCTYPE html><html><body></body></html>");
global.window = window;
global.document = window.document;
global.navigator = { userAgent: "node.js" };
global.HTMLCanvasElement = window.HTMLCanvasElement;
global.HTMLImageElement = window.HTMLImageElement;
global.Image = Image;
global.createCanvas = createCanvas;
global.Document = window.Document;
global.DOMParser = window.DOMParser;

// ✅ Import Fabric.js (works best with v5.3.0)
const { fabric } = require("fabric");

// --- File Paths ---
const svgPath = path.join(__dirname, "public/files/templates/img/52.svg");
const jsonOutput = path.join(__dirname, "public/files/templates/json/52.json");

// --- Convert SVG to Editable Fabric JSON ---
(async () => {
  try {
    const svgData = fs.readFileSync(svgPath, "utf8");
    const canvas = new fabric.StaticCanvas(null);

    fabric.loadSVGFromString(svgData, (objects, options) => {
      const group = fabric.util.groupSVGElements(objects, options);
      canvas.add(group);
      canvas.renderAll();

      // ✅ Extract only essential editable properties
      const json = canvas.toJSON([
        "selectable",
        "evented",
        "editable",
        "type",
        "left",
        "top",
        "fill",
        "stroke",
        "strokeWidth",
        "scaleX",
        "scaleY",
        "angle",
        "width",
        "height",
        "text",
        "fontSize",
        "fontFamily",
        "fontWeight",
        "fontStyle",
        "textAlign",
        "opacity",
      ]);

      // ✅ Compact & lightweight output
      const minified = JSON.stringify(json);

      fs.writeFileSync(jsonOutput, minified);
      console.log("✅ SVG successfully converted to lightweight editable JSON!");
      console.log(`📁 Saved at: ${jsonOutput}`);
    });
  } catch (err) {
    console.error("❌ Error converting SVG:", err);
  }
})();
