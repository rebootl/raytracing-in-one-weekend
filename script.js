import { Vector, Color, writeColor, Ray, getRandom,
  getRandomVectorInUnitSphere, getRandomColor, Sphere, Scene, Camera,
  DiffuseMaterial, MetalMaterial, RefractingMaterial } from './lib.js';

function rayColor(ray, scene, depth = 50) {
  // hitrecord
  const rec = {};

  if (depth <= 0)
    return new Color(0, 0, 0);

  if (scene.hit(ray, 0.001, Infinity, rec)) {
    if (rec.material.scatter(ray, rec)) {
      return rayColor(rec.scatteredRay,
        scene, depth - 1).mulColor(rec.attenuation);
    }
    return new Color(0, 0, 0);
  }

  // background
  const t = 0.5 * (ray.direction.unit.y + 1.0)
  const c1 = new Color(1.0, 1.0, 1.0);
  const c2 = new Color(0.5, 0.7, 1.0);
  return c1.scale(1.0 - t).addColor(c2.scale(t));
}

function getRandomScene() {
  const scene = new Scene();

  const materialGround = new DiffuseMaterial(new Color(0.5, 0.5, 0.5));
  scene.add(new Sphere(new Vector(0, -1000, -1), 1000, materialGround));

  for (let a = -11; a < 11; a++) {
    for (let b = -11; b < 11; b++) {
      const chooseMat = Math.random();
      const center = new Vector(a + 0.9 * Math.random(), 0.2,
        b + 0.9 * Math.random());

      if (center.subtractVector(new Vector(4, 0.2, 0)).length) {
        if (chooseMat < 0.8) {
          const albedo = getRandomColor().mulColor(getRandomColor());
          const sphereMaterial = new DiffuseMaterial(albedo);
          scene.add(new Sphere(center, 0.2, sphereMaterial));
        } else if (chooseMat < 0.95) {
          const albedo = getRandomColor(0.5, 1);
          const fuzz = getRandom(0, 0.5);
          const sphereMaterial = new MetalMaterial(albedo, fuzz);
          scene.add(new Sphere(center, 0.2, sphereMaterial));
        } else {
          const sphereMaterial = new RefractingMaterial(1.5);
          scene.add(new Sphere(center, 0.2, sphereMaterial));
        }
      }
    }
  }
  const material1 = new RefractingMaterial(1.5);
  scene.add(new Sphere(new Vector(0, 1, 0), 1, material1));

  const material2 = new DiffuseMaterial(new Color(0.4, 0.2, 0.1));
  scene.add(new Sphere(new Vector(-4, 1, 0), 1, material2));

  const material3 = new MetalMaterial(new Color(0.7, 0.6, 0.5), 0.0);
  scene.add(new Sphere(new Vector(4, 1, 0), 1, material3));

  return scene;
}

function main() {
  const c = document.querySelector('#mycanvas');
  const ctx = c.getContext('2d');

  // image
  const width = parseInt(document.querySelector('#width').value);
  const height = parseInt(document.querySelector('#height').value);
  const samplesPerPixel = parseInt(document.querySelector('#samples').value);
  const maxDepth = parseInt(document.querySelector('#maxdepth').value);

  c.width = width;
  c.height = height;

  const aspectRatio = width / height;
  const imagedata = ctx.createImageData(width, height);

  // world
  const scene = getRandomScene();

  // camera
  const lookFrom = new Vector(13, 2, 3);
  const lookAt = new Vector(0, 0, 0);
  const vup = new Vector(0, 1, 0);
  const distToFocus = 10.0;
  const aperture = 0.1;

  const camera = new Camera(
    lookFrom,
    lookAt,
    vup,
    20,
    aspectRatio,
    aperture,
    distToFocus
  );

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let pixelColor = new Color(0, 0, 0);
      for (let s = 0; s < samplesPerPixel; ++s) {
        const u = (x + Math.random()) / (width - 1);
        const v = (height - y + Math.random()) / (height - 1);
        const r = camera.getRay(u, v);
        pixelColor = pixelColor.addColor(rayColor(r, scene, maxDepth));
      }
      writeColor(imagedata, width, x, y, pixelColor, samplesPerPixel);
    }
  }

  ctx.putImageData(imagedata, 0, 0);
}

const renderButton = document.querySelector('#render-button');
renderButton.addEventListener('click', () => main());
main();
