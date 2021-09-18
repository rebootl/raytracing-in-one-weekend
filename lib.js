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
  reflect(normal) {
    return this.subtractVector(normal.scale(this.dot(normal) * 2.0));
  }
  refract(normal, refractionRatio) {
    const cosTheta = Math.min(this.scale(-1.0).dot(normal), 1.0);
    const rOutPerp = this.addVector(normal
      .scale(cosTheta))
      .scale(refractionRatio);
    const rOutParallel = normal.scale(-Math.sqrt(
      Math.abs(1.0 - rOutPerp.lengthSquared)
    ));
    return rOutPerp.addVector(rOutParallel);
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
    rec.frontFace = ray.direction.dot(outwardNormal) < 0;
    rec.normal = rec.frontFace ? outwardNormal
      : outwardNormal.scale(-1.0);

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
        rec.frontFace = tempRec.frontFace;
        rec.material = tempRec.material;
      }
    });

    return hitAnything;
  }
}

class Camera {
  constructor(
    lookFrom,
    lookAt,
    vup,
    vfov,
    aspectRatio,
    aperture,
    focusDist
  ) {
    const theta = deg2rad(vfov);
    const h = Math.tan(theta / 2);

    this.aspectRatio = aspectRatio;
    this.viewportHeight = 2.0 * h;
    this.viewportWidth = this.viewportHeight * aspectRatio;
    this.focalLength = 1.0;

    const w = lookFrom.subtractVector(lookAt).unit;
    this.u = vup.cross(w).unit;
    this.v = w.cross(this.u);

    this.origin = lookFrom;
    this.horizontal = this.u.scale(this.viewportWidth * focusDist);
    this.vertical = this.v.scale(this.viewportHeight * focusDist);
    this.lowerLeftCorner = this.origin
      .subtractVector(this.horizontal.divide(2))
      .subtractVector(this.vertical.divide(2))
      .subtractVector(w.scale(focusDist));

    this.lensRadius = aperture / 2;
  }
  getRay(u, v) {
    const rd = getRandomVectorInUnitDisk().scale(this.lensRadius);
    const offset = this.u.scale(rd.x)
      .addVector(this.v.scale(rd.y));

    return new Ray(
      this.origin.addVector(offset),
      this.lowerLeftCorner
        .addVector(this.horizontal.scale(u))
        .addVector(this.vertical.scale(v))
        .subtractVector(this.origin)
        .subtractVector(offset)
      );
  }
}

function deg2rad(deg) {
  return Math.PI * deg / 180.0;
}

function clamp(v, min, max) {
  return Math.max(Math.min(v, max), min);
}

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomVector() {
  return new Vector(getRandom(-1, 1), getRandom(-1, 1), getRandom(-1, 1));
}

function getRandomColor(min = 0, max = 1) {
  return new Color(
    getRandom(min, max),
    getRandom(min, max),
    getRandom(min, max)
  );
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

function getRandomVectorInUnitDisk() {
  while (true) {
    const p = new Vector(getRandom(-1, 1), getRandom(-1, 1), 0);
    if (p.lengthSquared >= 1) continue;
    return p;
  }
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

class MetalMaterial {
  constructor(color, fuzz = 0) {
    this.color = color;
    this.fuzz = fuzz < 1 ? fuzz : 1;
  }
  scatter(ray, rec) {
    const reflected = ray.direction.unit.reflect(rec.normal);
    rec.scatteredRay = new Ray(
      rec.p,
      reflected.addVector(getRandomVectorInUnitSphere().scale(this.fuzz))
    );
    rec.attenuation = this.color;
    return rec.scatteredRay.direction.dot(rec.normal) > 0;
  }
}

class RefractingMaterial {
  constructor(ir) {
    this.ir = ir;
  }
  scatter(ray, rec) {
    rec.attenuation = new Color(1.0, 1.0, 1.0);
    const refractionRatio = rec.frontFace ? 1.0 / this.ir : this.ir;
    const unitDirection = ray.direction.unit;

    const cosTheta = Math.min(unitDirection.scale(-1.0)
      .dot(rec.normal), 1.0);
    const sinTheta = Math.sqrt(1.0 - cosTheta*cosTheta);

    const cannotRefract = refractionRatio * sinTheta > 1.0;

    let direction;
    if (cannotRefract || this.reflectance(cosTheta, refractionRatio)
      > Math.random())
      direction = unitDirection.reflect(rec.normal);
    else
      direction = unitDirection.refract(rec.normal, refractionRatio);

    rec.scatteredRay = new Ray(rec.p, direction);
    return true;
  }
  reflectance(cosine, refIdx) {
    const r0 = (1 - refIdx) / (1 + refIdx);
    const r0sq = r0 * r0;
    return r0sq + (1 - r0sq) * Math.pow((1- cosine), 5);
  }
}

export { Vector, Color, writeColor, Ray, getRandom,
  getRandomVectorInUnitSphere, getRandomColor, Sphere, Scene, Camera,
  clamp, DiffuseMaterial, MetalMaterial, RefractingMaterial };
