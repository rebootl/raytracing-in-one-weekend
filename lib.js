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

function writeColor(imagedata, width, x, y, c, samplesPerPixel) {
    const pixelindex = (y * width + x) * 4;
  
    const s = 1.0 / samplesPerPixel;
    const r = c.r * s;
    const g = c.g * s;
    const b = c.b * s;
  
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
    return this.origin
      .addVector(this.direction.scale(t));
  }
}

function rayColor(ray, scene) {
  // hitrecord
  const rec = {};

  if (scene.hit(ray, 0, Infinity, rec)) {
    return new Color(
      rec.normal.x + 1,
      rec.normal.y + 1,
      rec.normal.z + 1).scale(0.5);
  }

  // background
  const t = 0.5 * (ray.direction.unit.y + 1.0)
  const c1 = new Color(1.0, 1.0, 1.0);
  const c2 = new Color(0.5, 0.7, 1.0);
  return c1.scale(1.0 - t).addColor(c2.scale(t));
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
  constructor(center, radius) {
    this.center = center;
    this.radius = radius;
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

export { Vector, Color, writeColor, Ray, rayColor,
  Sphere, Scene, Camera, clamp };