import { Vector, Color, writeColor, Ray, getRandomVectorInUnitSphere,
  Sphere, Scene, Camera, DiffuseMaterial, MetalMaterial,
  RefractingMaterial } from './lib.js';


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
  const scene = new Scene();

  const materialGround = new DiffuseMaterial(
    new Color(0.8, 0.8, 0.0)
  );
  const materialCenter = new DiffuseMaterial(
    new Color(0.1, 0.2, 0.5)
  );
  const materialLeft = new RefractingMaterial(1.5);
  const materialRight = new MetalMaterial(
    new Color(0.8, 0.6, 0.2),
    0.0
  );
  scene.add(new Sphere(new Vector(0, -100.5, -1), 100, materialGround));
  scene.add(new Sphere(new Vector(0, 0, -1), 0.5, materialCenter));
  scene.add(new Sphere(new Vector(-1, 0, -1), 0.5, materialLeft));
  scene.add(new Sphere(new Vector(-1, 0, -1), -0.4, materialLeft));
  scene.add(new Sphere(new Vector(1, 0, -1), 0.5, materialRight));

  // camera
  const camera = new Camera(aspectRatio);

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
