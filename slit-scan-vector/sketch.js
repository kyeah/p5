'use strict'

const _l = _.noConflict()

const DEBUG = false

// Modes: MOUSE, SINE
const mode = 'MOUSE'

// Max # of px per framestep for type to fall.
const speed = 2

// Nudge X so type falls centered in the frame
const nudgeX = 40

const fontSize = 48
const sampleFactor = 5
const spacing = 220

const textObjs = []

// The y-level of the scanline.
const y = 100

// The control center for MOUSE mode.
const ctrlX = y
const ctrlY = y

// The preferred text boundaries at the start are 800x100.
// 
// We don't actually want the canvas to be that tight,
// so specify how much extra room we're providing for slit-scanning.
const width = 1200
const height = 400
const widthScale = 1 / (width / 800)
const heightScale = 1 / (height / 100)

// Usually you would do something like:
// const bounds = font.textBounds(` GENERATIVE `, 0, 0, fontSize)
// console.log(bounds)
//
// However, we aren't fitting our text tightly within our canvas,
// so to make this easy for myself I'm copying the bounds that I get
// from a canvas of 800x100.
//
const bounds = { x: 0, y: -23.296, h: 24, w: 258.176, advance: 0 }

let colors
let bgColor
let gColor
let tColor
let font

// Ensure the .ttf or .otf font stored in the assets directory
// is loaded before setup() and draw() are called.
//
// NOTE: If you're running this locally, you need to run it from a server
//       so that it will pull your local file.
//
//       I use `python -m http.server` but you can follow p5js docs
//       for more guidance: https://github.com/processing/p5.js/wiki/Local-server
function preload() {
  font = loadFont('assets/KevinTest3-Regular.otf')
}

class Text {
  constructor(text, bounds, progress) {
    this.text = text
    this.points = font.textToPoints(text, 0, 0, fontSize, {
      sampleFactor,
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
    this.stallResetCounter = 0
  }

  // Reset the points for another round of slit-scanning!
  resetSlitScan (progress) {
    // this.pointsShifted = _l.cloneDeep(this.points)
    for (const p of this.pointsShifted) {
      p.shiftX = undefined
      p.shiftY = undefined
    }

    this.progress = progress
    this.stallResetCounter = 0
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

    // Slit line attributes for sine mode
    const amplitude = 15
    const period = 30

    let shiftY
    if (mode === 'SINE') {
      shiftY = 15 * (this.progress / period)
    } else if (mode === 'MOUSE') {
      shiftY = mouseY - ctrlY
    }

    this.shiftsUpdated = false
    this.minX = undefined
    this.minY = undefined
    this.maxX = undefined
    this.maxY = undefined
  
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
        this.shiftsUpdated = true
        if (mode === 'SINE') {
          p.shiftX = amplitude * sin(Math.PI * (this.progress / period))
        } else {
          p.shiftX = mouseX - ctrlX
        }

        p.shiftY = shiftY
      }

      const newX = this.xToCanvas(p.x) + (p.shiftX || 0) + nudgeX
      const newY = this.yToCanvas(p.y) + (p.shiftY || 0) + (this.progress)

      if (!this.minX) {
        this.minX = this.maxX = newX
        this.minY = this.maxY = newY
      } else {
        this.minX = Math.min(this.minX, newX)
        this.maxX = Math.max(this.maxX, newX)
        this.minY = Math.min(this.minY, newY)
        this.maxY = Math.max(this.maxY, newY)
      }

      vertex(newX, newY)
    })

    endShape()

    this.centerX = this.minX + ((this.maxX - this.minX) / 2)
    this.centerY = this.minY + ((this.maxY - this.minY) / 2)
  }
}

// Break our text down into characters and calculate the indices
// that mark the next character.
//
// For instance, if the first character 'G' has 536 points, then the character
// boundary will be '536' and we'll end the 'G' shape there.
//
// Otherwise, every letter will be connected in one big ol' shape.
const getCharacterBoundaries = (text) => {
  return text.split('').reduce((arr, char) => {
    const prevBoundary = arr[arr.length - 1] || 0

    // Convert the single character into points and count the length.
    const test = font.textToPoints(char, 0, 0, fontSize, {
      sampleFactor,
      simplifyThreshold: 0
    })

    // Offset the length by the previous character boundary.
    arr.push(prevBoundary + test.length)
    return arr
  }, [])
}

// Draw the scan line in red.
const drawScanLine = (yShift) => {
  stroke(255, 0, 0)
  line(0, y, width, y)

  // If it's mouse mode, also draw the control point
  // and projected scan shift for the user.
  if (mode === 'MOUSE') {
    ellipse(ctrlX, ctrlY, 10)
    line(ctrlX, ctrlY, mouseX, mouseY)
  }

  noStroke()
}

function setup() {
  createCanvas(width, height)

  // Setup some colors
  //
  // Pick a color from a generic array of values and add the hex symbol.
  const pickHex = (arr) => {
    const idx = random(0, arr.length)
    return `#${arr.splice(idx, 1)}`
  }

  const scheme = new ColorScheme
  scheme.from_hue(21)
    .scheme('triade')
    .variation('pastel')

  colors = scheme.colors()
  bgColor = pickHex(colors)
  gColor = pickHex(colors)
  tColor = pickHex(colors)

  // Setup a couple of text objects.
  // Add two sets of "GENERATIVE" "TYPOGRAPHY".
  //
  // We're going to reuse the texts over and over again, but two sets
  // will allow us to make the texts drop continuously instead of
  // waiting for the text at the bottom to fall out of frame and
  // be usable again.
  const texts = ['GENERATIVE', 'TYPOGRAPHY']

  let currentTextIndex = 0
  let currentOffset = 0

  for (let i = 0; i < 4; i++) {
    textObjs.push(new Text(
      texts[currentTextIndex],
      bounds,
      currentOffset
    ))

    // space the texts out consistently.
    // I adjusted the spacing manually until it looked right.
    currentOffset -= spacing
    currentTextIndex = (currentTextIndex + 1) % texts.length
  }
}

function draw() {
  background(bgColor)
  noStroke()

  for (const o of textObjs) {
    const color = o.text.startsWith('G') ? gColor : tColor
    fill(color)
    o.draw()
  }

  // Set some helper attributes and figure out how fast our text should be dropping.
  for (const o of textObjs) {
    o.hasStopped = (o.stallResetCounter >= 100)
    o.isScanned = (!o.shiftsUpdated && o.minY >= y)

    if (o.minY < -100 || o.shiftsUpdated) {
      // It hasn't dropped into view yet, or it's
      // getting slit-scanned, so go full speed.
      o.stallResetCounter = 0
      o.speed = speed
    } else {
      // It's hanging out either above or below the line, so
      // give a reasonable sine-wavey momentum. The top will
      // fall right below the line before going in, and the
      // bottom will "present" itself in the bottom frame
      // befire heading out.
      o.stallResetCounter += 3.5

      // Make sure we start at the top of the sine wave. This way
      // we ease into a slowdown and then ease back up to speed.
      //
      // Also, provide a minimum of 0.2 so that we never
      // fully stop, cuz that's weird.
      const shift = Math.PI / 2
      const waveProgress = o.stallResetCounter / 200
      const max = Math.max(0.2, abs(sin(shift + (Math.PI * waveProgress))))
      o.speed = speed * max
    }
  }

  // Adjust speed of the bottommost text so that it waits for the text
  // above it. Since the exact timing and placement of the bottom text
  // depends on how far the user shifted it down through the scanline,
  // This helps us to maintain movement consistency.
  textObjs.forEach((o, i) => {
    // If the text has already stopped, go ahead and do
    // full throttle so it doesn't stop multiple times before
    // or after going through the scanline.
    if (o.stallResetCounter > 200) {
      o.speed = speed
    }

    const nextObj = i <= textObjs.length - 2 ? textObjs[i + 1] : null
    const nextIsScanning = nextObj && (nextObj.shiftsUpdated || nextObj.maxY >= y)
    const isPastBottomCenter = o.centerY >= y + ((height - y) / 2)

    if (nextObj && !nextObj.isScanned && !nextIsScanning && !nextObj.hasStopped &&
        o.isScanned && isPastBottomCenter) {
      // Reset speed to the bottom of the sine wave
      o.stallResetCounter = 100
      o.speed = speed * 0.2
    }

    o.progress += o.speed
  })

  // As soon as the bottom text is out of frame, reset it back to the
  // top behind the other text objects.
  const lowestObj = textObjs[0]
  if (lowestObj.minY > height) {
    const progress = textObjs[textObjs.length - 1].progress - spacing
    lowestObj.resetSlitScan(progress)
    textObjs.shift()
    textObjs.push(lowestObj)
  }

  drawScanLine()
}
