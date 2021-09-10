class Vector {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  
  get length() {
    return Math.sqrt(this.lengthSquared);
  }
  get lengthSquared() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
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

class Color {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
  scale(f) {
    return new Color(this.r * f, this.g * f, this.b * f);
  }
  addColor(c) {
    return new Color(this.r + c.r, this.g + c.g, this.b + c.b);
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
  let t = hitSphere(new Vector(0, 0, -1), 0.5, r);
  if (t > 0.0) {
    const N = r.at(t).subtractVector(new Vector(0, 0, -1.0)).unit;
    return new Color(N.x + 1, N.y + 1, N.z + 1).scale(0.5);
  }
    
  t = 0.5 * (r.direction.unit.y + 1.0)
  const c1 = new Color(1.0, 1.0, 1.0);
  const c2 = new Color(0.5, 0.7, 1.0);
  return c1.scale(1.0 - t).addColor(c2.scale(t));
}

function hitSphere(center, radius, r) {
  const oc = r.origin.subtractVector(center);
  const a = r.direction.lengthSquared;
  const halfb = oc.dot(r.direction);
  const c = oc.lengthSquared - radius*radius;
  const d = halfb*halfb - a * c;
  if (d < 0) {
    return -1.0;
  }
  return (-halfb - Math.sqrt(d)) / a;
}

export { Vector, Color, writeColor, Ray, rayColor };