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

class Ray {
  constructor(origin, direction) {
    this.origin = origin;
    this.direction = direction;
  }
  at(t) {
    return this.origin.addVector(this.direction.scale(t));
  }
}

export { Vector, Color, Ray };