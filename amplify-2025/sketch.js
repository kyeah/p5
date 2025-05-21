let font;
let txt = "AMPLIFY";

let linedWords = [];
let dottedWords = [];

let bgImg;

// Animation variables
let maxLength = 30;
let speed = 0.05;
let counterspeed = 0.01;
let targetCounter = 0;

let c = 0;
// let c = 400;
let counter = c;

let totalFrameCount = 450;

// let cWidth = PORTRAIT_MODE ? 1080 : 1920;
// let cHeight = PORTRAIT_MODE ? 1980 : 1080;
let vmargin = SCALE * 300;
let fontSize = SCALE * (PORTRAIT_MODE ? 250 : 350);
let cWidth = SCALE * (PORTRAIT_MODE ? 1080 : 1920);
let cHeight = SCALE * (PORTRAIT_MODE ? 1980 : 1080);

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

  if (!PORTRAIT_MODE) {
    linedWords.push(new LinedWord(font, txt, fontSize, 0, 0));
    dottedWords.push(new DottedWord(font, txt, fontSize, 0, 0));
  } else {
    const chars = txt.split("");

    for (let i = 0; i < chars.length; i++) {
      linedWords.push(
        new LinedWord(
          font,
          chars[i],
          fontSize,
          0,
          map(
            i,
            0,
            chars.length - 1,
            height / 2 - vmargin,
            -height / 2 + vmargin
          )
        )
      );
      dottedWords.push(
        new DottedWord(
          font,
          chars[i],
          fontSize,
          0,
          map(
            i,
            0,
            chars.length - 1,
            height / 2 - vmargin,
            -height / 2 + vmargin
          )
        )
      );
    }
  }
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

  let maxAdjustment = Math.max(0, SCALE * 50 * sin(0.01 * time));

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

  // let clr = color(180, v, 255);
  // clr.setAlpha(map(time, 60, 100, 0, 255, true));
  // fill(clr);
  for (const linedWord of linedWords) {
    linedWord.render(maxAdjustment, v, v2);
  }

  for (const dottedWord of dottedWords) {
    dottedWord.render(v, time);
  }
  // const [color1, color2] = getColors();
  // const v3 = int(255 / 2 + (255 / 2) * sin(0.01 * (frameCount - 100)));
  // let clr = lerpColor(color1, color2, map(v3, 0, 255, 0, 1));
  // clr.setAlpha(map(frameCount, 60, 120, 0, 200, true));
  // fill(clr);
  // textAlign(CENTER, CENTER);

  // text(txt, 0, -50);

  const framesToSave = PORTRAIT ? [95, 245, 295, 310] : [105, 245, 254, 296];

  if (frameCount >= 901) {
    noLoop();
  } else {
    if (framesToSave.includes(frameCount)) {
      // save(`amplify-2025-landscape-lg/dotted/frames/${frameCount}.png`);
      save(`amplify-2025-portrait-lg/frames/${frameCount}.png`);
    }
  }
}
