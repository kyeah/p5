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

const normalizePointAngle = (point, { originX, originY } = {}) => {
  originX = originX || width/2
  originY = originY || height/2

  let originVector = createVector(originX - point.x, originY - point.y)
  let rotationVector = createVector(
    cos(radians(point.alpha)),
    sin(radians(point.alpha))
  )

  let alpha
  if (abs(originVector.angleBetween(rotationVector)) > radians(90)) {
    alpha = (point.alpha + 180) % 360
  } else {
    alpha = (point.alpha % 360)
  }

  return alpha
}
