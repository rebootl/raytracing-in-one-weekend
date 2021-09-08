class Vector {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

class Point extends Vector {
  constructor(x, y, z) {
    super(x, y, z);
  }
}