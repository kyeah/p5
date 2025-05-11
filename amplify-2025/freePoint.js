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
  }

  draw(layer) {
    fill(this.color);
    noStroke();
    var pos = this.body.position;
    ellipse(pos.x, pos.y, this.radius);
  }

  update() {
    let dx = this.dest.x - this.body.position.x;
    let dy = this.dest.y - this.body.position.y;
    this.vx = dx / 10;
    this.vy = dy / 10;

    this.body.position.x += this.vx;
    this.body.position.y += this.vy;
  }
}
