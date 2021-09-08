class Vector {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  
  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  
  add_vector(v) {
    return Vector(v.x + this.x, v.y + this.y, v.z + this.z);
  }
  scale(f) {
    return Vector(this.x * f, this.y * f, this.z * f);
  }
  dot(v) {
    return v.x * this.x + v.y * this.y + v.z * this.z;
  }
  cross(v) {
    return Vector(
      this.y * v.z - this.z * v.y,
      
  }
}

class Point extends Vector {
  constructor(x, y, z) {
    super(x, y, z);
  }
}

class Color {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
}

export { Vector, Point, Color };