'use strict'

const DEBUG = false

// Modes: MOUSE, SINE
const mode = 'MOUSE'
const speed = 2 // # of steps per frame

const _l = _.noConflict()


const pickHex = (arr) => {
  const idx = random(0, arr.length)
  return `#${arr.splice(idx, 1)}`
}

// Ensure the .ttf or .otf font stored in the assets directory
// is loaded before setup() and draw() are called.
//
// NOTE: If you're running this locally, you need to run it from a server
//       so that it will pull your local file.
//
//       I use `python -m http.server` but you can follow p5js docs
//       for more guidance: https://github.com/processing/p5.js/wiki/Local-server
let font;

const awkAdjustX = 40

function preload() {
  font = loadFont('assets/KevinTest3-Regular.otf')
  console.log(font)
}

// This is it! Our text!
const fontSize = 48
let translated = false

class Text {
  constructor(text, bounds, progress) {
    this.text = text
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
    this.stallResetCounter = 0
  }

  // Reset the points for another round of slit-scanning!
  resetSlitScan () {
    // this.pointsShifted = _l.cloneDeep(this.points)
    for (const p of this.pointsShifted) {
      p.shiftX = undefined
      p.shiftY = undefined
    }

    this.progress = 0
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

    if (!translated) {
      translated = true
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

      const newX = this.xToCanvas(p.x) + (p.shiftX || 0) + awkAdjustX
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

// The raw points that will represent our text when initialized.
let points

let textObjs = []

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
const height = 600
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

const offset = 100
const spacing = 220

const drawBounds = () => {
  stroke(0, 255, 0)
  line(0, offset, width, offset)
  line(0, 400 + offset, width, 400 + offset)
  line(1200, 0, 1200, height)
  noStroke()
}

const drawMask = () => {
  fill(255)
  rect(0, -200, width, offset + 200)
  rect(1200, -200, 2000, 1000)
}

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

function setup() {
  createCanvas(width, height)

  const scheme = new ColorScheme
  scheme.from_hue(21)
    .scheme('triade')
    .variation('pastel')

  colors = scheme.colors()
  bgColor = pickHex(colors)
  gColor = pickHex(colors)
  tColor = pickHex(colors)

  const texts = ['GENERATIVE', 'TYPOGRAPHY']

  let currentTextIndex = 0
  let currentOffset = 0

  for (let i = 0; i < 4; i++) {
    textObjs.push(new Text(
      texts[currentTextIndex],
      bounds,
      currentOffset
    ))

    currentOffset -= spacing
    currentTextIndex = (currentTextIndex + 1) % texts.length
  }
}

function draw() {
  // White background and stroke, black fill.
  background(bgColor)
  noStroke()
  //  stroke(255, 255, 255)

  translated = false
  for (const o of textObjs) {
    const color = o.text.startsWith('G') ? gColor : tColor
    fill(color)
    o.draw()
    o.hasStopped = (o.stallResetCounter >= 100)
    o.isScanned = (!o.shiftsUpdated && o.minY >= 200)
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

  for (const o of textObjs) {
    if (o.shiftsUpdated) {
      // Getting slit-scanned, go full speed
      o.stallResetCounter = 0
      o.speed = speed
    } else if (o.minY < 0) {
      // Just created, go full spped
      o.stallResetCounter = 0
      o.speed = speed
    } else {
      o.stallResetCounter += 3.5
      const shift = Math.PI / 2
      const max = Math.max(0.2, abs(sin(shift + (Math.PI * (o.stallResetCounter / 200)))))
      o.speed = speed * max
    }
  }

  textObjs.forEach((o, i) => {
    const nextObj = i <= textObjs.length - 2 ? textObjs[i + 1] : null
    if (nextObj &&
        !nextObj.isScanned && !nextObj.shiftsUpdated && !nextObj.hasStopped &&
        o.isScanned && o.centerY >= 300) {
      o.stallResetCounter = 100
      o.speed = speed * 0.2
    } else if (o.isScanned && o.stallResetCounter > 200) {
      o.speed = speed
    }

    o.progress += o.speed
  })

  const lowestObj = textObjs[0]
  if (lowestObj.minY > 400 + offset) {
    lowestObj.resetSlitScan()
    lowestObj.progress = textObjs[textObjs.length - 1].progress - spacing
    textObjs.shift()
    textObjs.push(lowestObj)
  }

  textObjs = textObjs.filter((o) => !o.delete)

  drawScanLine()
  // drawBounds()
  drawMask()
}
