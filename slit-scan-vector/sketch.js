'use strict'

const DEBUG = false

// Modes: MOUSE, SINE
const mode = 'MOUSE'
const speed = 2 // # of steps per frame

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

// This is it! Our text!
const fontSize = 32

class Text {
  constructor(text, bounds, progress) {
    this.initialProgress = progress

    this.points = font.textToPoints(text, 0, 0, fontSize, {
      sampleFactor: 5,
      simplifyThreshold: 0
    })

    // Contains the indices that mark the end of a character. This will
    // allow us to break our text up into individual character shapes,
    // for cleaner typography. yay!
    this.characterBoundaries = getCharacterBoundaries(text)

    // A copy of the text points, which will be slit-scanned and reset on occasion.
    this.pointsShifted = _l.cloneDeep(this.points)
    // The text boundaries. Admittedly, I have no idea what this information represents,
    // but it helps us to scale and fit our text to screen.
    this.bounds = bounds
    // Movement of text
    this.progress = progress
    // A counter to stall reset after the entire text has been slit-scanned.
    // This lets us appreciate our work for a bit.
    this.stallResetCounter = -40
  }

  // Reset the points for another round of slit-scanning!
  resetSlitScan () {
    this.pointsShifted = _l.cloneDeep(this.points)
    for (const p of this.pointsShifted) {
      p.shiftX = undefined
      p.shiftY = undefined
    }

    this.progress = 0
    this.stallResetCounter = -40
  }

  // Scale a text point to the canvas size
  xToCanvas (x) {
    return x * width * widthScale / this.bounds.w
  }

  // Scale a text point to the canvas size.
  yToCanvas (y) {
    return y * height * heightScale / this.bounds.h
  }

  // Add a lil debugging circle at point p.
  debugRed (p) {
    if (DEBUG) {
      fill(255, 0, 0)
      ellipse(
        this.xToCanvas(p.x) + (p.shiftX || 0),
        this.yToCanvas(p.y) + (p.shiftY || 0),
        20
      )
      fill(0,0,0)
    }
  }
  
  draw () {
    beginShape()

    // hack to only translate on first thing for now
    if (this.initialProgress > 0) {
      // Move the drawing into our draw boundaries.
      translate(-this.xToCanvas(this.bounds.x), -this.yToCanvas(this.bounds.y))
    }

    // Slit line attributes for sine mode
    const amplitude = 15
    const period = 30

    let shiftY
    if (mode === 'SINE') {
      shiftY = 15 * (this.progress / period)
    } else if (mode === 'MOUSE') {
      shiftY = mouseY - ctrlY
    }

    let hasNotShifted = true
    let minY
  
    // Draw the text
    this.pointsShifted.forEach((p, i) => {
      // If we've reached a character
    // boundary, start a new shape.
      if (this.characterBoundaries.includes(i)) {
        endShape()
        beginShape()

        // Add a lil circle to let us know where
        // the new character is starting.
        this.debugRed(p)
      }

      // Add shift if the scanline has crossed the point.
      if (!p.shiftX && this.yToCanvas(p.y) + this.progress > y) {
        hasNotShifted = false
        if (mode === 'SINE') {
          p.shiftX = amplitude * sin(Math.PI * (this.progress / period))
        } else {
          p.shiftX = mouseX - ctrlX
        }

        p.shiftY = shiftY
      }

      const newY = this.yToCanvas(p.y) + (p.shiftY || 0) + (this.progress)
      if (!minY) {
        minY = newY
      } else {
        minY = Math.min(minY, newY)
      }

      vertex(
        this.xToCanvas(p.x) + (p.shiftX || 0),
        newY
      )
    })

    endShape()

    if (hasNotShifted) {
      if (this.stallResetCounter < 0) {
        this.progress += speed
        this.stallResetCounter += 1
      } else {
        this.stallResetCounter += 3.5
        const shift = Math.PI / 2
        const max = Math.max(0.2, abs(sin(shift + (Math.PI * (this.stallResetCounter / 200)))))
        if (this.stallResetCounter > 200) {
          this.progress += speed
        } else {
          this.progress += speed * max
        }
      }
    } else {
      this.stallResetCounter = 0
      this.progress += speed
    }

    if (minY > 400) {
      this.resetSlitScan()
    }    
  }
}

// The raw points that will represent our text when initialized.
let points

const textObjs = []

// A counter to represent the line being scanned through. This doesn't actually
// match exactly what you'll see because I'm lazy right now.
let y = 200

const ctrlX = 200
const ctrlY = 200

// The preferred text boundaries at the start are 800x100.
// 
// We don't actually want the canvas to be that tight,
// so specify how much extra room we're providing for slit-scanning.
const width = 1400
const height = 800
const widthScale = 1 / (width / 800)
const heightScale = 1 / (height / 100)

// Break down our text into characters and calculate the indices
// that mark the next character. For instance, if the first character 'G'
// has 536 points, then the character boundary will be '536' and we'll end
// the 'G' shape there. Otherwise, every letter will be connected in one
// big ol' shape.
const getCharacterBoundaries = (text) => {
  return text.split('').reduce((arr, char) => {
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

// Draw the scan line.
const drawScanLine = (yShift) => {
  stroke(255, 0, 0)
  line(0, y, width, y)
  ellipse(ctrlX, ctrlY, 10)
  line(ctrlX, ctrlY, mouseX, mouseY)
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

  // Usually you would do something like:
  // bounds = font.textBounds(` ${text} `, 0, 0, 32)
  //
  // However, we aren't fitting our text tightly within our canvas,
  // so to make this easy for myself I'm copying the bounds that I get
  // from a canvas of 800x100.
  const bounds = { x: 0, y: -23.296, h: 24, w: 258.176, advance: 0 }

  textObjs.push(new Text(
    'GENERATIVE',
    bounds,
    100
  ))

  textObjs.push(new Text(
    'TYPOGRAPHY',
    bounds,
    -100
  ))

  for (const o of textObjs) {
    // o.resetSlitScan()
  }
}

function draw() {
  // White background and stroke, black fill.
  background(255)
  noStroke()
  //  stroke(255, 255, 255)
  fill(0, 0, 0)

  for (const o of textObjs) {
    o.draw()
  }

  // y += speed
  // progress += speed

  // if (hasNotShifted && pointsShifted[0].shiftX) {
  //   stallResetCounter += 1
  // }
  // if (stallResetCounter == 0 || stallResetCounter < 15 || stallResetCounter > 60) {
  //   progress += speed
  // }
  //if (y > yMax || stallResetCounter > stallResetTime) {
  //  resetSlitScan()
  //}

  drawScanLine()
  drawBounds()
}
