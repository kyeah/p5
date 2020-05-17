const fontPts = ({ font, text, x, y, fontSize, maxWidth, maxHeight, options }) => {
  const bounds = font.textBounds(text, x, y, fontSize, options);

  let ratioWidth, ratioHeight

  if (options.fill) {
    ratioWidth = maxWidth || width
    ratioHeight = maxHeight || width
  } else {
    const textRatio = bounds.w / bounds.h
    const canvasRatio = (maxWidth || width) / (maxHeight || height)
    
    if (textRatio > canvasRatio) {
      ratioWidth = width
      ratioHeight = width / textRatio
    } else {
      ratioHeight = height
      ratioWidth = textRatio * height
    }
  }

  return pts.map(pt => {
      x: (-bounds.x* ratioWidth / bounds.w) + pt.x * ratioWidth / bounds.w,
      y: (-bounds.y* ratioHeight / bounds.h) + pt.y * ratioHeight / bounds.h
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
