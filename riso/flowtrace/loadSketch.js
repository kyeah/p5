import createSketch from "./sketch.js";

window.addEventListener("DOMContentLoaded", (event) => {
  const sketch = createSketch(document.getElementById("sketch-container"));
  new p5(sketch);
});
