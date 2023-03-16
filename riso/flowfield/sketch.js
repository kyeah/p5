import Colors from "../theme.js";

const createSketch = (parent) => {
  return (p) => {
    let canvas;
    let font;
    let fontSize = 100;

    // let width = 1200;
    // let height = 700;
    let width = 8.5 * 72;
    let height = 11 * 72;
    let numXTiles = 100;
    let numYTiles = 100;
    let xStep = 1;
    let yStep = 1;
    let tileW;
    let tileH;

    // Animation variables
    let maxShift = 30;
    let speed = 0.1;

    let grid;
    let numColumns = 100;
    let numRows = 100;
    let vertices = [];

    let srcLayer;

    let charset = "...::/\\/\\/\\+=*abcdef01XYZ#";

    let pressed = false;

    const centers = [
      // { x: width / 4, y: height / 2 },
      // { x: (3 * width) / 4, y: height / 2 },
      { x: width / 2, y: height / 2 },
    ];

    let img;
    let riso1, riso2;

    p.preload = () => {
      font = p.loadFont("/riso/fonts/IBMPlexMono-Medium.otf");
    };

    p.mousePressed = () => {
      if (pressed) {
        p.stopRecording();
      } else {
        p.startRecording();
        pressed = true;
      }
    };

    // Initialize the grid with perlin noise
    const perlinGrid = () => {
      grid = Array(numColumns)
        .fill()
        .map((_, colIdx) => {
          return Array(numRows)
            .fill()
            .map((_, rowIdx) => {
              // Processing's noise() works best when the step between
              // points is approximately 0.005, so scale down to that
              const scaledX = colIdx * 0.005;
              const scaledY = rowIdx * 0.005;

              // Get our noise value, between 0.0 and 1.0.
              const noiseVal = p.noise(scaledX, scaledY);
              const tx = tileW * colIdx;
              const ty = tileH * rowIdx;
              // const d = p.dist(tileW * colIdx, tileH * rowIdx, width/2, height/2);

              let ang = p.map(noiseVal, 0.0, 1.0, 0.0, Math.PI * 2.0);
              let diffTotal = 0;

              for (let center of centers) {
                const vec = p.createVector(center.x - tx, center.y - ty);
                const diff = p5.Vector.fromAngle(ang).angleBetween(vec);
                diffTotal += diff;
              }

              // Translate the noise value to an angle (between 0 and 2 * PI)
              return diffTotal / centers.length;
            });
        });
    };

    p.setup = () => {
      const goodSeeds = [880504163.6973618];
      img = p.createGraphics(width, height, p.WEBGL);
      img.pixelDensity(1);
      riso1 = p.color(RISOCOLORS.find((c) => c.name === "VIOLET").color);
      let r = p.random(RISOCOLORS);
      riso2 = p.color(r.color);
      console.log(r);
      let seed = p.random(999999999);
      console.log({ seed });
      p.noiseSeed(seed);
      canvas = p.createCanvas(width, height);
      canvas.parent(parent);
      p.frameRate(20);

      window.canvas = canvas;

      tileW = Math.floor(width / numXTiles);
      tileH = Math.floor(height / numYTiles);
      perlinGrid();

      srcLayer = p.createGraphics(width, height);
      srcLayer.pixelDensity(1);
      srcLayer.background(Colors.bg);
      verts(500);
    };

    function verts(num) {
      for (let center of centers) {
        // TODO: move calculation
        let ratioX = center.x / width;
        let ratioY = center.y / height;
        for (let i = 0; i < num; i++) {
          vertices.push({
            x: ratioX * numColumns + p.random(-2, 2),
            y: ratioY * numRows + p.random(-2, 2),
          });
        }
      }
    }

    function getSrcPixel(x, y, i) {
      const idx = 4 * (width * y + x);

      const layer = i || srcLayer;
      return p.color(
        layer.pixels[idx],
        layer.pixels[idx + 1],
        layer.pixels[idx + 2],
        layer.pixels[idx + 3]
      );
    }

    function drawImg() {
      img.clear();
      let sizeX = 300;
      let sizeY = 300;

      img.push();
      img.rotateX(0.5 + p.frameCount * 0.01);
      img.rotateY(0.5 + p.frameCount * 0.01);
      img.box(300);
      img.pop();

      img.loadPixels();
    }

    p.draw = () => {
      drawImg();
      const bgColor = p.color(Colors.bg);
      bgColor.setAlpha(10);
      //   p.blendMode(p.BLEND);
      srcLayer.background(bgColor);
      verts(2);
      //   p.blendMode(p.MULTIPLY);
      // stroke("white");
      //   strokeWeight(2);
      srcLayer.noStroke();
      srcLayer.fill("white");
      for (let v of vertices) {
        let ang1 = grid[Math.floor(v.x)];

        if (ang1 === undefined) {
          continue;
        }

        let ang = ang1[Math.floor(v.y)];

        if (ang === undefined) {
          continue;
        }

        let nx = v.x + 0.2 * Math.cos(ang);
        let ny = v.y + 0.2 * Math.sin(ang);
        // line(v.x * tileW, v.y * tileH, nx * tileW, ny * tileH);
        srcLayer.rect(nx * tileW, ny * tileH, tileW, tileH);

        v.x = nx;
        v.y = ny;
      }

      srcLayer.loadPixels();

      let pix, flowPix;
      let gran = 7;
      // p.background(Colors.bg);
      p.background(riso1);

      p.textAlign(p.CENTER, p.CENTER);
      for (let x = 0; x < width; x += gran) {
        for (let y = 0; y < height; y += gran) {
          flowPix = getSrcPixel(x, y);
          pix = getSrcPixel(x, y, img);
          let fb = p.brightness(flowPix);
          let b = p.brightness(pix);

          let mode = 1;
          if (mode === 1) {
            let color = riso2;
            color.setAlpha(b);
            p.fill(riso2);
          } else {
            let col = p.color(Colors.h1);
            // col.setAlpha(b * 6);
            // pix.setAlpha(b);

            const lerped = p.lerpColor(pix, col, p.map(b, 0, 255, 0, 1));
            lerped.setAlpha(b * 6);
            p.fill(lerped);
          }

          p.textSize(p.map(b, 0, 200, 12, 6));
          // if (fb > 30 && b < 24) {
          //   p.fill("#FFFFFF44");
          //   p.text(
          //     charset[Math.round(p.map(fb, 0, 200, 4, charset.length))],
          //     x,
          //     y
          //   );
          // }
          if (b > 24 && fb > 20) {
            p.text(
              charset[Math.round(p.map(fb, 0, 200, 4, charset.length))],
              x,
              y
            );
          }
          // p.rect(x, y, 10, 10);
        }
      }

      window.pixels = p.pixels;
    };
  };
};

export default createSketch;
