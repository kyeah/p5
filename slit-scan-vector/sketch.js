'use strict'

const DEBUG = false

// Modes: MOUSE, SINE
const mode = 'MOUSE'
const speed = 0.5 // # of steps per frame

const _l = _.noConflict()

// Ensure the .ttf or .otf font stored in the assets directory
// is loaded before setup() and draw() are called.
//
// NOTE: If you're running this locally, you need to run it from a server
//       so that it will pull your local file.
//
//       I use `python -m http.server` but you can follow p5js docs
//       for more guidance: https://github.com/processing/p5.js/wiki/Local-server
let font;
function preload() {
  font = loadFont('assets/KevinTest2-Regular.otf')
}

// The raw points that will represent our text when initialized.
let points

// A copy of the text points, which will be slit-scanned and reset on occasion.
let pointsShifted

// Contains the indices that mark the end of a character. This will
// allow us to break our text up into individual character shapes,
// for cleaner typography. yay!
let characterBoundaries

// The text boundaries. Admittedly, I have no idea what this information represents,
// but it helps us to scale and fit our text to screen.
let bounds

// A counter to represent the line being scanned through. This doesn't actually
// match exactly what you'll see because I'm lazy right now.
let y
let progress

const yMin = 200
const yMax = 100

// A counter to stall reset after the entire text has been slit-scanned.
// This lets us appreciate our work for a bit.
let stallResetCounter = 0
const stallResetTime = 50

// The preferred text boundaries at the start are 800x100.
// 
// We don't actually want the canvas to be that tight,
// so specify how much extra room we're providing for slit-scanning.
const width = 1400
const height = 800
const widthScale = 1 / (width / 800)
const heightScale = 1 / (height / 100)

// This is it! Our text!
const text = 'GENERATIVE'
const fontSize = 32

// Break down our text into characters and calculate the indices
// that mark the next character. For instance, if the first character 'G'
// has 536 points, then the character boundary will be '536' and we'll end
// the 'G' shape there. Otherwise, every letter will be connected in one
// big ol' shape.
const setupCharacterBoundaries = () => {
  characterBoundaries = text.split('').reduce((arr, char) => {
    const prevBoundary = arr[arr.length - 1] || 0

    // Convert the single character into points and count the length.
    const test = font.textToPoints(char, 0, 0, fontSize, {
      sampleFactor: 5,
      simplifyThreshold: 0
    })

    // Offset the length by the previous character boundary.
    arr.push(prevBoundary + test.length)
    return arr
  }, [])
}

// Reset the points for another round of slit-scanning!
const resetSlitScan = () => {
  pointsShifted = _l.cloneDeep(points)
  for (const p of pointsShifted) {
    p.shiftX = undefined
    p.shiftY = undefined
  }

  y = 0
  progress = 0
  stallResetCounter = 0
}

// Scale a text point to the canvas size
const xToCanvas = (x) => {
  return x * width * widthScale / bounds.w
}

// Scale a text point to the canvas size.
const yToCanvas = (y) => {
  return y * height * heightScale / bounds.h
}

// Add a lil debugging circle at point p.
const debugRed = (p) => {
  if (DEBUG) {
    fill(255, 0, 0)
    ellipse(
      xToCanvas(p.x) + (p.shiftX || 0),
      yToCanvas(p.y) + (p.shiftY || 0),
      20
    )
    fill(0,0,0)
  }
}

// Draw the scan line.
const drawScanLine = (yShift) => {
  stroke(255, 0, 0)
  line(0, y, width, y)
  noStroke()
}

const drawBounds = () => {
  stroke(0, 255, 0)
  line(0, 0, width, 0)
  line(0, 400, width, 400)
  line(1200, 0, 1200, height)
  noStroke()
}

function setup() {
  createCanvas(width, height)

  points = font.textToPoints(text, 0, 0, fontSize, {
    sampleFactor: 5,
    simplifyThreshold: 0
  })

  setupCharacterBoundaries()
  resetSlitScan()

  // Usually you would do something like:
  // bounds = font.textBounds(` ${text} `, 0, 0, 32)
  //
  // However, we aren't fitting our text tightly within our canvas,
  // so to make this easy for myself I'm copying the bounds that I get
  // from a canvas of 800x100.
  bounds = { x: 0, y: -23.296, h: 24, w: 258.176, advance: 0 }
}

function draw() {
  // White background and stroke, black fill.
  background(255)
  noStroke()
  //  stroke(255, 255, 255)
  fill(0, 0, 0)

  beginShape()

  // Move the drawing into our draw boundaries.
  translate(-xToCanvas(bounds.x), -yToCanvas(bounds.y))

  // Slit line attributes for sine mode
  const amplitude = 15
  const period = 30

  let shiftY
  if (mode === 'SINE') {
    shiftY = 15 * ((y - yMin) / period)
  } else if (mode === 'MOUSE') {
    shiftY = mouseY
  }

  let hasNotShifted = true
  
  // Draw the text
  pointsShifted.forEach((p, i) => {
    // If we've reached a character
    // boundary, start a new shape.
    if (characterBoundaries.includes(i)) {
      endShape()
      beginShape()

      // Add a lil circle to let us know where
      // the new character is starting.
      debugRed(p)
    }

    // Add shift if the scanline has crossed the point.
    const rotate = false
    if (!p.shiftX && yToCanvas(p.y) - progress > y) {
      hasNotShifted = false
      if (mode === 'SINE') {
        p.shiftX = amplitude * sin(Math.PI * ((y - yMin) / period))
      } else {
        p.shiftX = mouseX
      }

      p.shiftY = shiftY
    }

    vertex(
      xToCanvas(p.x) + (p.shiftX || 0),
      yToCanvas(p.y) + (p.shiftY || 0) + (progress)
    )
  })

  endShape()

  // y += speed
  progress -= speed * 4

  if (hasNotShifted) {
    stallResetCounter += 1
  } else {
    drawScanLine(shiftY)
  }

  drawBounds()

  //if (y > yMax || stallResetCounter > stallResetTime) {
  //  resetSlitScan()
  //}
}
