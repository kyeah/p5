import Colors from "../theme.js";

const createSketch = (parent) => {
  return (p) => {
    let font;
    let fontSize = 100;

    let width = 1200;
    let height = 700;
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

    p.preload = () => {
      font = p.loadFont("/fonts/IBMPlexMono-Medium.otf");
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

              // Translate the noise value to an angle (between 0 and 2 * PI)
              return p.map(noiseVal, 0.0, 1.0, 0.0, Math.PI * 2.0);
            });
        });
    };

    p.setup = () => {
      const canvas = p.createCanvas(width, height);
      canvas.parent(parent);

      tileW = Math.floor(width / numXTiles);
      tileH = Math.floor(height / numYTiles);
      perlinGrid();
      p.background(Colors.bg);

      verts();
    };

    function verts() {
      for (let i = 0; i < 100; i++) {
        vertices.push({
          x: p.random(0, numColumns),
          y: p.random(0, numRows),
        });
      }
    }

    p.draw = () => {
      const bgColor = p.color(Colors.bg);
      bgColor.setAlpha(50);
         p.blendMode(p.BLEND);
      p.background(bgColor);
      vertices.push({
        x: p.random(0, numColumns),
        y: p.random(0, numRows),
      });
         p.blendMode(p.MULTIPLY);
      // stroke("white");
      //   strokeWeight(2);
      p.noStroke();
      p.fill(Colors.sub2);
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
        p.rect(nx * tileW, ny * tileH, tileW, tileH);

        v.x = nx;
        v.y = ny;
      }
    };
  };
};

export default createSketch;
