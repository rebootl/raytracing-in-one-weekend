class Vector {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  
  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  get unit() {
    return this.divide(this.length);
  }

  addVector(v) {
    return new Vector(v.x + this.x, v.y + this.y, v.z + this.z);
  }
  subtractVector(v) {
    return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
  }
  scale(f) {
    return new Vector(this.x * f, this.y * f, this.z * f);
  }
  divide(f) {
    return this.scale(1/f);
  }
  dot(v) {
    return v.x * this.x + v.y * this.y + v.z * this.z;
  }
  cross(v) {
    return new Vector(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }
}

/*class Point extends Vector {
  constructor(x, y, z) {
    super(x, y, z);
  }
}*/

class Color {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
}

function writeColor(imagedata, width, x, y, c) {
    const pixelindex = (y * width + x) * 4;
    imagedata.data[pixelindex] = parseInt(c.r * 255.999);
    imagedata.data[pixelindex+1] = parseInt(c.g * 255.999);
    imagedata.data[pixelindex+2] = parseInt(c.b * 255.999);
    imagedata.data[pixelindex+3] = 255;  
}

class Ray {
  constructor(origin, direction) {
    this.origin = origin;
    this.direction = direction;
  }
  at(t) {
    return this.origin.addVector(this.direction.scale(t));
  }
}

function rayColor(r) {
  const t = 0.5 * (r.unit.y + 1.0)
}

export { Vector, Color, writeColor, Ray };