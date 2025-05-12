class DottedWord {
  constructor(font, text, fontSize, x, y) {
    this.font = font;
    this.text = text;
    this.x = x;
    this.y = y;
    this.fontSize = fontSize;
    this.sampleFactor = 0.4;
    this.points = centeredTextToPoints(
      font,
      text,
      x - width / 2,
      y - height / 2,
      fontSize,
      {
        sampleFactor: this.sampleFactor,
      }
    );

    this.boundaries = getCharacterBoundaries({
      font,
      text,
      fontSize,
      options: {
        sampleFactor: this.sampleFactor,
      },
    });

    this.drawReference();
    this.setupDots();
  }

  getDest() {
    let idx = int(random(this.gridPts.length - 1));
    let pt = this.gridPts.splice(idx, 1)[0];
    return {
      x: pt.x - width / 2,
      y: pt.y - height / 2,
    };
  }

  setupDots() {
    this.dots = [];
    const initSize = min(width, height);
    const initX = width;
    const initY = height;

    function getPixel(layer, x, y) {
      return layer.pixels[
        layer.pixelDensity() * 4 * (layer.width * Math.floor(y) + Math.floor(x))
      ];
    }

    const bounds = this.font.textBounds(this.text, 0, 0, this.fontSize);

    const textBounds = {
      minX: width / 2 - bounds.w / 2,
      minY: height / 2 - bounds.h / 2,
      maxX: width / 2 + bounds.w / 2,
      maxY: height / 2 + bounds.h / 2,
    };

    this.textBounds = textBounds;

    let step = initSize / 200;
    let pointRadius = initSize / 300;
    let offset = 2;

    this.gridPts = [];

    for (let y = 0; y <= height; y += step) {
      offset = offset === 2 ? 0 : 2;

      let firstX, lastX;

      for (let x = 0; x <= width; x += 1) {
        if (!firstX && getPixel(this.bgCanvas, x, y) !== 0) {
          firstX = x;
        } else if (firstX && getPixel(this.bgCanvas, x, y) !== 0) {
          lastX = x;
        }
      }

      let numPoints = (lastX - firstX) / step;

      // This should just be numPoints but it's broken
      // so hack it with 3*
      for (let i = 0; i < numPoints; i++) {
        let x = firstX + pointRadius + i * step;
        let col = getPixel(this.bgCanvas, x, y);
        let lastColor = getPixel(this.bgCanvas, x - step, y);
        let nextcol = getPixel(this.bgCanvas, x + step, y);

        let lastRowCol = getPixel(this.bgCanvas, x, y - step);
        let nextRowCol = getPixel(this.bgCanvas, x, y + step);

        if (col > 10) {
          let nextX = x;
          let nextY = y;
          if (lastColor === col && nextcol === col) {
            nextX += random(-pointRadius, pointRadius);
          }

          if (lastRowCol === col && nextRowCol === col) {
            nextY += random(-pointRadius, pointRadius);
          }
          this.gridPts.push({
            x: nextX,
            y: nextY,
          });
        }
      }
    }

    let gridPtsCopy = JSON.parse(JSON.stringify(this.gridPts));
    while (this.gridPts.length > 0) {
      let x = random(width) - initX / 2;
      let y = random(height) - initY / 2;
      let dest = this.getDest();
      this.dots.push(
        new FreePoint(x, y, random(pointRadius, pointRadius * 2), dest)
      );
    }
    this.gridPts = gridPtsCopy;
    console.log(this.dots.length);
    console.log(this.dots);
  }

  shuffle() {
    let gridPtsCopy = JSON.parse(JSON.stringify(this.gridPts));
    for (let pt of this.dots) {
      let x = pt.body.position.x;
      let y = pt.body.position.y;
      let dest = this.getDest();
      pt.dest = dest;
    }
    this.gridPts = gridPtsCopy;
  }

  drawReference() {
    this.bgCanvas = createGraphics(width, height);
    this.bgCanvas.pixelDensity(1);

    let clr = color(180, 255, 255);
    clr.setAlpha(255);
    this.bgCanvas.fill(clr);
    this.bgCanvas.noStroke();

    this.bgCanvas.beginShape();
    let startIdx = 0;
    for (let i = 0; i < this.points.length; i++) {
      if (this.boundaries.includes(i)) {
        this.bgCanvas.vertex(this.points[startIdx].x, this.points[startIdx].y);
        this.bgCanvas.endShape();
        this.bgCanvas.beginShape();
        startIdx = i;
      }
      this.bgCanvas.vertex(this.points[i].x, this.points[i].y);
    }

    this.bgCanvas.vertex(this.points[startIdx].x, this.points[startIdx].y);
    this.bgCanvas.endShape(CLOSE);
    this.bgCanvas.loadPixels();
  }

  render(v, time) {
    // image(this.bgCanvas, -width / 2, -height / 2);
    for (const dot of this.dots) {
      dot.draw(v, time);
      dot.update();
    }

    // if (frameCount >= 120 && frameCount <= 150) {
    //   const minBound = map(frameCount, 120, 150, this.textBounds.minX, this.textBounds.maxX);
    //   const maxBound = map(frameCount + 1, 120, 150, this.textBounds.minX, this.textBounds.maxX);
    //   if (dot.dest.x >= minBound && dot.dest.x <= maxBound) {
    //     dot.dest.x
    //   }
    // }
    // }

    // if (frameCount % 100 == 0) {
    // this.shuffle();
    // }
  }
}
