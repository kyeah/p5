class FreePoint {
  constructor(x, y, radius, dest) {
    this.body = {
      position: {
        x: x,
        y: y,
      },
    };

    this.vx = 0;
    this.vy = 0;

    let rand = random(1);
    if (rand < 0.1) {
      this.color = color("#fe2179");
    } else if (rand < 0.2) {
      this.color = color("white");
    } else if (rand < 0.3) {
      this.color = color("#fce345");
    } else {
      this.color = color("#37f79b");
    }
    this.color.setAlpha(255);
    this.radius = radius;
    this.sx = x;
    this.sy = y;
    this.dest = dest;
    this.originalDest = {
      x: dest.x,
      y: dest.y,
    };
  }

  draw(v, time) {
    setPointColor(v);
    // fill(this.color);
    noStroke();
    var pos = this.body.position;
    ellipse(pos.x, pos.y, this.radius);
  }

  update() {
    let mx = null;
    let my = null;
    let md = null;

    const frames = [
      //   { sframe: 120, eframe: 250 },
      //   { sframe: 310, eframe: 440 },
      { sframe: 100, eframe: 230 },
      { sframe: 290, eframe: 420 },
      { sframe: 480, eframe: 610 },
      { sframe: 670, eframe: 800 },
    ];

    let vlen = 200;
    let vwait = 60;
    const portraitFrames = [
      { sframe: 100, eframe: 300 },
      { sframe: 360, eframe: 560 },
      { sframe: 620, eframe: 820 },
    ];

    const currentFrame = (PORTRAIT_MODE ? portraitFrames : frames).find(
      (f) => frameCount >= f.sframe && frameCount <= f.eframe
    );

    if (currentFrame != null) {
      if (PORTRAIT_MODE) {
        mx = 0;
        my = map(
          frameCount,
          currentFrame.sframe,
          currentFrame.eframe,
          -height / 2,
          height / 2
        );
      } else {
        my = 0;
        mx = map(
          frameCount,
          currentFrame.sframe,
          currentFrame.eframe,
          -width / 2,
          width / 2
        );
      }
      md = dist(this.originalDest.x, this.originalDest.y, mx, my);
    }

    let dx = this.dest.x - this.body.position.x;
    let dy = this.dest.y - this.body.position.y;
    const d = dist(
      this.body.position.x,
      this.body.position.y,
      this.dest.x,
      this.dest.y
    );

    if (md != null && md <= height / 5 && !this.isReset) {
      const disburseScale = 500;
      this.dest.x += random(-disburseScale, disburseScale);
      this.dest.y += random(-disburseScale, disburseScale);
      this.vx = dx / 30;
      this.vy = dy / 30;
      this.isReset = true;
    } else if (md != null && md > height / 5 && this.isReset) {
      this.dest.x = this.originalDest.x;
      this.dest.y = this.originalDest.y;

      if (d < 10) {
        this.vx = dx / 20;
        this.vy = dy / 20;
      } else {
        this.vx = dx / 12;
        this.vy = dy / 12;
      }
    } else if (md != null) {
      this.vx = dx / 30;
      this.vy = dy / 30;
    } else if (this.isReset) {
      this.dest.x = this.originalDest.x;
      this.dest.y = this.originalDest.y;
      this.isReset = false;
    } else {
      if (d < 10) {
        this.vx = dx / 20;
        this.vy = dy / 20;
      } else {
        this.vx = dx / 12;
        this.vy = dy / 12;
      }
      this.wander();
    }

    this.body.position.x += this.vx;
    this.body.position.y += this.vy;
  }

  wander() {
    this.dest.x = this.originalDest.x + random(-5, 5);
    this.dest.y = this.originalDest.y + random(-5, 5);
  }
}
