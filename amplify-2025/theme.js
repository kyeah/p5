const PORTRAIT_MODE = false;

function getColors() {
  const color1 = color(0, 255, 255);
  const color2 = color(150, 255, 150);
  return [color1, color2];
}

function setPointColor(v) {
  const [color1, color2] = getColors();
  let clr = lerpColor(color1, color2, map(v, 0, 255, 0, 1));
  // clr.setAlpha(map(time, 80, 100, 255, 0, true));
  fill(clr);
}

function setLineColor() {
  const [color1, color2] = getColors();
  const v = int(255 / 2 + (255 / 2) * sin(0.01 * (frameCount + 50)));
  let clr = lerpColor(color1, color2, map(v, 0, 255, 0, 1));
  clr.setAlpha(map(frameCount, 60, 120, 0, 100, true));
  //   clr.setAlpha(map(frameCount, 60, 120, 0, 200, true));
  stroke(clr);
}
