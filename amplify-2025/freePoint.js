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
    let clr = color(180, v, 255);
    // clr.setAlpha(map(time, 80, 100, 255, 0, true));
    fill(clr);
    // fill(this.color);
    noStroke();
    var pos = this.body.position;
    ellipse(pos.x, pos.y, this.radius);
  }

  update() {
    let mx = null;
    let my = null;
    let d = null;

    if (frameCount >= 120 && frameCount <= 190) {
      my = 0;
      mx = map(frameCount, 120, 190, -width / 2, width / 2);

      d = dist(this.dest.x, this.dest.y, mx, my);
    }

    if (d != null && d <= height / 5) {
      let maxm = height / 5;
      let v = createVector(
        this.body.position.x - mx,
        this.body.position.y - my
      );
      let m = map(v.mag(), 0, maxm, 20, 0);
      v.setMag(m);
      this.vx = v.x;
      this.vy = v.y;
    } else {
      let dx = this.dest.x - this.body.position.x;
      let dy = this.dest.y - this.body.position.y;
      const d = dist(
        this.body.position.x,
        this.body.position.y,
        this.dest.x,
        this.dest.y
      );

      if (d < 10) {
        this.vx = dx / 20;
        this.vy = dy / 20;
      } else {
        this.vx = dx / 15;
        this.vy = dy / 15;
      }
    }

    this.body.position.x += this.vx;
    this.body.position.y += this.vy;
    this.wander();
  }

  wander() {
    this.dest.x = this.originalDest.x + random(-5, 5);
    this.dest.y = this.originalDest.y + random(-5, 5);
  }
}
