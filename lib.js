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
  get nearZero() {
    const s = 1e-8;
    return Math.abs(this.x) < s && Math.abs(this.y) < s &&
      Math.abs(this.z) < s;
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
  mulColor(c) {
    return new Color(this.r * c.r, this.g * c.g, this.b * c.b);
  }
}

function writeColor(imagedata, width, x, y, c, samplesPerPixel) {
    const pixelindex = (y * width + x) * 4;

    const s = 1.0 / samplesPerPixel;
    const r = Math.sqrt(c.r * s);
    const g = Math.sqrt(c.g * s);
    const b = Math.sqrt(c.b * s);

    imagedata.data[pixelindex] = parseInt(256 * clamp(r, 0.0, 0.999));
    imagedata.data[pixelindex+1] = parseInt(256 * clamp(g, 0.0, 0.999));
    imagedata.data[pixelindex+2] = parseInt(256 * clamp(b, 0.0, 0.999));
    imagedata.data[pixelindex+3] = 255;
}

class Ray {
  constructor(origin, direction) {
    this.origin = origin;
    this.direction = direction;
  }
  at(t) {
    return this.origin
      .addVector(this.direction.scale(t));
  }
}

function setFaceNormal(r, outwardNormal) {
  const frontFace = r.direction.dot(outwardNormal) < 0;
  return frontFace ?
    outwardNormal :
    outwardNormal.scale(-1.0);
}

/*class SceneObject {
  constructor() {}
  hit(ray, tMin, tMax) {}
}*/

class Sphere {
  constructor(center, radius, material) {
    this.center = center;
    this.radius = radius;
    this.material = material;
  }
  hit(ray, tMin, tMax, rec) {
    const oc = ray.origin.subtractVector(this.center);
    const a = ray.direction.lengthSquared;
    const halfb = oc.dot(ray.direction);
    const c = oc.lengthSquared - this.radius*this.radius;
    const d = halfb*halfb - a * c;
    if (d < 0) return false;

    const sqrtd = Math.sqrt(d);

    let root = (-halfb - sqrtd) / a;
    if (root < tMin || root > tMax) {
      root = (-halfb + sqrtd) / a;
      if (root < tMin || root > tMax)
        return false;
    }

    rec.t = root;
    rec.p = ray.at(rec.t);
    const outwardNormal = rec.p
      .subtractVector(this.center)
      .divide(this.radius);
    rec.normal = setFaceNormal(ray, outwardNormal);

    rec.material = this.material;

    return true;
  }
}

class Scene {
  constructor() {
    this.sceneObjects = [];
  }
  add(object) {
    this.sceneObjects.push(object);
  }
  hit(ray, tMin, tMax, rec) {
    let tempRec = {};
    let hitAnything = false;
    let closestSoFar = tMax;

    this.sceneObjects.forEach(obj => {
      if (obj.hit(ray, tMin, closestSoFar, tempRec)) {
        hitAnything = true;
        closestSoFar = tempRec.t;
        rec.t = tempRec.t;
        rec.p = tempRec.p;
        rec.normal = tempRec.normal;
        rec.material = tempRec.material;
      }
    });

    return hitAnything;
  }
}

class Camera {
  constructor(aspectRatio) {
    this.aspectRatio = aspectRatio;
    this.viewportHeight = 2.0;
    this.viewportWidth = this.viewportHeight * aspectRatio;
    this.focalLength = 1.0;

    this.origin = new Vector(0, 0, 0);
    this.horizontal = new Vector(this.viewportWidth, 0, 0);
    this.vertical = new Vector(0, this.viewportHeight, 0);
    this.lowerLeftCorner = this.origin
      .subtractVector(this.horizontal.divide(2))
      .subtractVector(this.vertical.divide(2))
      .subtractVector(new Vector(0, 0, this.focalLength));
  }
  getRay(u, v) {
    return new Ray(
      this.origin,
      this.lowerLeftCorner
        .addVector(this.horizontal.scale(u))
        .addVector(this.vertical.scale(v))
        .subtractVector(this.origin)
      );
  }
}

function clamp(v, min, max) {
  return Math.max(Math.min(v, max), min);
}

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomVector(min, max) {
  return new Vector(getRandom(-1, 1), getRandom(-1, 1), getRandom(-1, 1));
}

function getRandomVectorInUnitSphere() {
  while (true) {
    const p = getRandomVector(-1, 1);
    if (p.lengthSquared >= 1) continue;
    return p;
  }
}

function getRandomVectorInHemisphere(normal) {
  const r = getRandomVectorInUnitSphere();
  if (r.dot(normal) > 0.0)
    return r;
  else
    return r.scale(-1.0);
}

class DiffuseMaterial {
  constructor(color) {
    this.color = color;
  }
  scatter(ray, rec) {
    const scatterDirection = rec.normal
      .addVector(getRandomVectorInUnitSphere());
    if (scatterDirection.nearZero)
      scatterDirection = rec.normal;
    rec.scatteredRay = new Ray(rec.p, scatterDirection);
    rec.attenuation = this.color;
    return true;
  }
}

export { Vector, Color, writeColor, Ray, getRandomVectorInUnitSphere,
  Sphere, Scene, Camera, clamp, DiffuseMaterial };
