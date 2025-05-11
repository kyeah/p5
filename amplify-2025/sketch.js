let font;
let fontSize = 400;
let text = "AMPLIFY";
let linedWord;

let bgImg;

// Animation variables
let maxLength = 30;
let speed = 0.05;
let counterspeed = 0.01;

let xOff = 0;
let bgCanvas;

let targetCounter = 0;

let c = 1000;
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

  // Load a piece of text as points
  xOff = random(100);

  bgCanvas = createGraphics(width, height, WEBGL);
  bgImg.resize(width, height);
  linedWord = new LinedWord(font, text, fontSize, 0, 0);
  frameRate(60);
}

function draw() {
  if (frameCount === 1500) {
  }

  const time = frameCount;

  colorMode(RGB);
  // background("#121212");
  clear();
  image(bgImg, 0, 0);
  translate(width / 2, height / 2);
  stroke(255);

  xOff += 0.02;

  let maxAdjustment = Math.max(0, 50 * sin(0.01 * time));

  noStroke();

  let v = int(50 + 255 / 2 + (255 / 2) * sin(0.01 * time));
  let v2 = int(counter);

  let d = targetCounter - counter;
  counter += d * counterspeed;

  if (targetCounter === 0 && (time === 500 || time === 1250)) {
    targetCounter = c;
    counterspeed = 0.006;
  } else if (targetCounter !== 0 && time === 750) {
    targetCounter = 0;
    counterspeed = 0.01;
  }

  fill(v, 255, 255, 0.2);
  colorMode(RGB);
  linedWord.render(maxAdjustment, v, v2);
}
