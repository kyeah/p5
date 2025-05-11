class LinedWord {
  constructor(font, text, fontSize, x, y) {
    this.font = font;
    this.text = text;
    this.x = x;
    this.y = y;
    this.fontSize = fontSize;
    this.sampleFactor = 0.4;
    this.points = centeredTextToPoints(font, text, x, y, fontSize, {
      sampleFactor: this.sampleFactor,
    });

    this.boundaries = getCharacterBoundaries({
      font,
      text,
      fontSize,
      options: {
        sampleFactor: this.sampleFactor,
      },
    });
  }

  crossesBoundary(indexA, indexB) {
    for (const boundary of this.boundaries) {
      if (indexA < boundary && indexB >= boundary) {
        return true;
      }
    }

    return false;
  }

  render(maxAdjustment, v, v2) {
    // let newHistObj = [];
    for (let i = 0; i < this.points.length; i++) {
      let pt = this.points[i];
      let clr = color(map(i, 0, this.points.length - 1, 0, 180), v, 255);
      clr.setAlpha(255);
      stroke(clr);
      let adjustedPt = {
        x:
          pt.x +
          min(
            maxAdjustment,
            50 * sin(0.01 * pt.y + 0.05 * frameCount + Math.PI)
          ),
        y: pt.y,
      };

      if (!this.crossesBoundary(i, i + v2)) {
        let nextPt = this.points[i + v2];
        let extrudedPt = {
          x: nextPt.x,
          y: nextPt.y,
        };

        line(adjustedPt.x, adjustedPt.y, extrudedPt.x, extrudedPt.y);
      }
      noStroke();
      // ellipse(adjustedPt.x, adjustedPt.y, 3);

      //   newHistObj.push(adjustedPt);
    }
    endShape();

    // this.history.push(newHistObj);
    // if (this.history.length > 10) {
    //   this.history.shift();
    // }
  }
}
