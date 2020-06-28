const rotateVector = (x, y, angle) => {
  return createVector(
    x * cos(angle) - y * sin(angle),
    x * sin(angle) + y * cos(angle)
  );
};

const ptDistance = (x, y, otherX, otherY) => {
  return Math.sqrt(abs(x - otherX)**2 + abs(y - otherY)**2)
}

// Initialize a flow grid with perlin noise
// Processing's noise() works best when the step between
// points is approximately 0.005, so scale down to that
const perlinGrid = ({ cols, rows, scale = 0.005 }) => {
  return Array(cols).fill().map((_, colIdx) => {
    return Array(rows).fill().map((_, rowIdx) => {
      const scaledX = colIdx * scale
      const scaledY = rowIdx * scale
    
      // Get our noise value, between 0.0 and 1.0.
      const noiseVal = noise(scaledX, scaledY)

      // Translate the noise value to an angle (between 0 and 2 * PI)
      return map(noiseVal, 0.0, 1.0, 0.0, Math.PI * 2.0)
    })
  })
}

// Draw a flow grid
const drawGrid = (grid, { resolution, ptSize = 2, vecSize = 5 }) => {
  grid.forEach((col, x) => {
    col.forEach((angle, y) => {
      ellipse(x * resolution, y * resolution, ptSize, ptSize)

      const v = p5.Vector.fromAngle(angle, vecSize)
      const gridX = x * resolution
      const gridY = y * resolution
      line(gridX, gridY, gridX + v.x, gridY + v.y)
    })
  })
}

const gridSteps = (grid, { stepLength, colIdx, rowIdx }) => {
  const gridAngle = grid[colIdx][rowIdx]
  const xStep = stepLength * Math.cos(gridAngle)
  const yStep = stepLength * Math.sin(gridAngle)

  return [xStep, yStep]
}
