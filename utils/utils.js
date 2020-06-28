const fontPts = ({ font, text, x = 0, y = 0, fontSize, maxWidth, maxHeight, options }) => {
  const pts = font.textToPoints(text, x, y, fontSize, options)
  const bounds = font.textBounds(text, x, y, fontSize, options)

  let ratioWidth, ratioHeight

  if (options.fill) {
    ratioWidth = maxWidth || width
    ratioHeight = maxHeight || height
  } else {
    const textRatio = bounds.w / bounds.h

    const canvasWidth = maxWidth || width
    const canvasHeight = maxHeight || height
    const canvasRatio = canvasWidth / canvasHeight
    
    if (textRatio > canvasRatio) {
      ratioWidth = canvasWidth
      ratioHeight = canvasWidth / textRatio
    } else {
      ratioHeight = canvasHeight
      ratioWidth = textRatio * canvasHeight
    }
  }

  return pts.map(pt => {
    return {
      x: (-bounds.x * ratioWidth / bounds.w) + pt.x * ratioWidth / bounds.w,
      y: (-bounds.y * ratioHeight / bounds.h) + pt.y * ratioHeight / bounds.h
    }
  })
}

const textHeight = ({ text, maxWidth }) => {
  var words = text.split(' ');
  var line = '';
  var h = textLeading();

  for (var i = 0; i < words.length; i++) {
    var testLine = line + words[i] + ' ';
    var testWidth = drawingContext.measureText(testLine).width;

    if (testWidth > maxWidth && i > 0) {
      line = words[i] + ' ';
      h += textLeading();
    } else {
      line = testLine;
    }
  }

  return h;
}

// Break our text down into characters and calculate the indices
// that mark the next character.
//
// For instance, if the first character 'G' has 536 points, then the character
// boundary will be '536' and we'll end the 'G' shape there.
//
// Otherwise, every letter will be connected in one big ol' shape.
const getCharacterBoundaries = ({ text, fontSize, options }) => {
  return text.split('').reduce((arr, char) => {
    const prevBoundary = arr[arr.length - 1] || 0

    // Convert the single character into points and count the length.
    const test = font.textToPoints(char, 0, 0, fontSize, options)
    // Offset the length by the previous character boundary.
    arr.push(prevBoundary + test.length)
    return arr
  }, [])
}

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

const normalizeTextToPointAngles = (points, { originX, originY }) => {
  points.map((pt) => {
    let originVector = createVector(originX - pt.x, originY - pt.y)
    let rotationVector = createVector(
      cos(radians(pt.alpha)), 
      sin(radians(pt.alpha))
    )

    let alpha
    if (abs(origin.angleBetween(rVec)) > radians(90)) {
      alpha = (pt.alpha + 180) % 360
    } else {
      alpha = (pt.alpha % 360)
    }

    { ...pt, alpha }
  }
}
