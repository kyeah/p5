'use strict'

const DEBUG = true

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
  font = loadFont('<INSERT YOUR FONT HERE>')
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

const yMin = -100
const yMax = 100

// We don't actually want the text height to fit the full boundary,
// so specify how much room we're providing for slit-scanning.
//
// e.g. 1/8 means that the base text should fill 1/8 of the full height.
const heightScale = 1 / 8

// This is it! Our text!
const text = 'GENERATIVE'

// Break down our text into characters and calculate the indices
// that mark the next character. For instance, if the first character 'G'
// has 536 points, then the character boundary will be '536' and we'll end
// the 'G' shape there. Otherwise, every letter will be connected in one
// big ol' shape.
const setupCharacterBoundaries = () => {
  characterBoundaries = text.split('').reduce((arr, char) => {
    const prevBoundary = arr[arr.length - 1] || 0

    // Convert the single character into points and count the length.
    const test = font.textToPoints(char, 0, 0, 32, {
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

  y = yMin
}

// Scale a text point to the canvas size
const xToCanvas = (x) => {
  return x * width / bounds.w
}

// Scale a text point to the canvas size.
//
// Note that we use heightScale so it only
// covers a portion of the full canvas height.
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

// Draw a totally inaccurate visual
// representation of our scan line.
const drawScanLine = () => {
  stroke(255, 0, 0)
  line(0, y, width, y)
  line(0, 100, width, 100)
  ellipse(0, y, 20)
  noStroke()
}

function setup() {
  createCanvas(800, 800)

  points = font.textToPoints(text, 0, 0, 32, {
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
  stroke(255, 255, 255)
  fill(0, 0, 0)

  beginShape()

  // Move the drawing into our draw boundaries.
  translate(-xToCanvas(bounds.x), -yToCanvas(bounds.y))

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
    if (!p.shift && yToCanvas(p.y) > y) {
      p.shiftX = mouseX
      p.shiftY = mouseY
    }

    vertex(
      xToCanvas(p.x) + (p.shiftX || 0),
      yToCanvas(p.y) + (p.shiftY || 0)
    )
  })

  endShape()
  drawScanLine()

  y += 1
  if (y > yMax) {
    resetSlitScan()
  }
}
