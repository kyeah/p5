'use strict'

const width = 1000
const height = 1000

// Setup grid boundaries in a smaller space, to allow curves
// to flow in and out of the drawing space continuously.
//
// <--canvas--->
//    <grid>
// ------------
// |  ______  |
// |  |    |  |
// |  |    |  |
// |  ------  |
// ------------
//
const leftX = Math.floor(width * -0.5)
const rightX = Math.floor(width * 1.5)
const topY = Math.floor(height * -0.5)
const bottomY = Math.floor(height * 1.5) 
const resolution = Math.floor(width * 0.01) 
  
const numColumns = (rightX - leftX) / resolution
const numRows = (bottomY - topY) / resolution
  
let grid = []

// Initialize the grid with perlin noise
const perlinGrid = () => {
  grid = Array(numColumns).fill().map((_, colIdx) => {
    return Array(numRows).fill().map((_, rowIdx) => {
      // Processing's noise() works best when the step between
      // points is approximately 0.005, so scale down to that
      const scaledX = colIdx * 0.005
      const scaledY = rowIdx * 0.005
    
      // Get our noise value, between 0.0 and 1.0.
      const noiseVal = noise(scaledX, scaledY)

      // Translate the noise value to an angle (between 0 and 2 * PI)
      return map(noiseVal, 0.0, 1.0, 0.0, Math.PI * 2.0)
    })
  })
}

function setup() {
  createCanvas(width, height)
  perlinGrid()
  noLoop()
}

function draw() {
  colorMode(HSB, 360)
  background(360, 0, height)

  drawGrid()

  for (let i = 0; i < 1000; i++) {
    const x = random(leftX, rightX)
    const y = random(topY, bottomY)
    drawCurve(x, y, 200, width * 0.005)
  }
}

// Draw the flow grid
const drawGrid = () => {
  grid.forEach((col, x) => {
    col.forEach((angle, y) => {
      ellipse(x * resolution, y * resolution, 2, 2)
      
      const v = p5.Vector.fromAngle(angle, 5)
      const gridX = x * resolution
      const gridY = y * resolution
      line(gridX, gridY, gridX + v.x, gridY + v.y)
    })
  })
}

// Draw a curve starting at (x, y)
const drawCurve = (x, y, numSteps, stepLength) => {
  noFill()
  strokeWeight(2)
  beginShape()

  for (let step = 0; step < numSteps; step++) {
    curveVertex(x, y)

    const xOffset = x - leftX
    const yOffset = y - topY

    const colIdx = Math.floor(xOffset / resolution)
    const rowIdx = Math.floor(yOffset / resolution)

    try {
      const gridAngle = grid[colIdx][rowIdx]
      const xStep = stepLength * Math.cos(gridAngle)
      const yStep = stepLength * Math.sin(gridAngle)

      x += xStep
      y += yStep
    } catch (e) {
      // Curve has overstepped the boundaries; break silently.
      break
    }
  }

  endShape()
}
