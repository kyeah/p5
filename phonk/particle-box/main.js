/*
 * Phonk Example: Processing
 *
 * This is a tiny bit modified version of Processing.org
 * for Android.
 * The usage its pretty similar, you just need to prepend
 * the processing object (p.) to the methods to access them
 * example: p.rect(x, y, w, h)
 *
 */

ui.addTitle(app.name)

var processing = ui.addProcessingCanvas(0, 0, 1, 1)

var numParticles = 100
var particles = []

sensors.gravity.start()

var ax = 0
var ay = 0

sensors.gravity.onChange(function (data) {
  ax = -data.x
  ay = data.y
})

var Particle = function (color, x, y, radius, vx, vy) {
    this.color = color
    this.x = x
    this.y = y
    this.radius = radius
    this.vx = vx
    this.vy = vy
}
  
Particle.prototype.draw = function(p) {
    p.fill(this.color)
    p.ellipse(this.x, this.y, this.radius, this.radius)
  }
  
Particle.prototype.update = function(p) {
    this.x += this.vx
    this.y += this.vy
    
    this.vx += ax
    this.vy += ay
    
    if (this.x - this.radius <= 0 || this.x + this.radius >= p.width) {
      this.vx *= -0.8
    }
    
    if (this.y - this.radius <= 0 || this.y + this.radius >= p.height) {
      this.vy *= -0.8
    }
}

processing.settings(function (p) {
  p.size(p.displayWidth, p.displayHeight, p.P3D)
})

processing.setup(function (p) {
  p.frameRate(25)
  
  for (var i = 0; i < numParticles; i += 1) {
    createParticle(p)
  }
})

processing.draw(function (p) {
  p.background(0)
  p.noStroke()

  createParticle(p, p.mouseX, p.mouseY)

  for (var i = 0; i < particles.length; i++) {
    particles[i].draw(p)
    particles[i].update(p)
  }
})

function createParticle(p, x, y) {
  var radius = p.random(10, 30)
  if (!x) {
    x = p.random(radius, p.width - radius)
  }
  if (!y) {
    y = p.random(radius, p.height - radius)
  }
    
    particles.push(new Particle(
      p.color(p.random(255), p.random(255), p.random(255), p.random(50, 200)),
      x,
      y,
      radius,
      p.random(-5, 5),
      p.random(-5, 5)
    ))
}
