let font;
let fontSize = 400;
let txt = "AMPLIFY";
let linedWord;
let dottedWord;

let bgImg;

// Animation variables
let maxLength = 30;
let speed = 0.05;
let counterspeed = 0.01;
let targetCounter = 0;

let c = 0;
let counter = c;

let totalFrameCount = 450;

let cWidth = 1920;
let cHeight = 1080;

function t() {
  return map(frameCount, 0, totalFrameCount, 0, 1500);
}

function preload() {
  font = loadFont("./Felicettev0.2-ExtraBold.otf");
  bgImg = loadImage("./yellow-red-16-9.png");
}

function setup() {
  createCanvas(cWidth, cHeight);
  stroke(255);
  strokeWeight(1);
  bgImg.resize(width, height);
  linedWord = new LinedWord(font, txt, fontSize, 0, 0);
  dottedWord = new DottedWord(font, txt, fontSize, 0, 0);
  frameRate(60);
}

function draw() {
  const time = frameCount;

  colorMode(RGB);
  // background("#121212");
  clear();
  // image(bgImg, 0, 0);
  translate(width / 2, height / 2);
  stroke(255);

  let maxAdjustment = Math.max(0, 50 * sin(0.01 * time));

  noStroke();

  let v = int(255 / 2 + (255 / 2) * sin(0.01 * time));
  let v2 = int(counter);

  if (frameCount >= 70) {
    let d = targetCounter - counter;
    counter += d * counterspeed;
  }

  if (targetCounter === 0 && (time === 500 || time === 1250)) {
    // targetCounter = c;
    // counterspeed = 0.006;
  } else if (targetCounter !== 0 && time === 750) {
    // targetCounter = 0;
    // counterspeed = 0.01;
  }

  fill(v, 255, 255, 0.2);
  colorMode(RGB);
  textFont(font);
  textSize(fontSize);

  let clr = color(180, v, 255);
  clr.setAlpha(map(time, 60, 100, 0, 255, true));
  fill(clr);
  textAlign(CENTER, CENTER);
  linedWord.render(maxAdjustment, v, v2);
  // text(txt, 0, -57);
  dottedWord.render(v, time);

  if (frameCount >= 451) {
    noLoop();
  } else {
    save(`amplify-2025/frames/${frameCount}.png`);
  }
}
