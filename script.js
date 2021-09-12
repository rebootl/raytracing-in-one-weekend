import { Vector, Color, writeColor, Ray, rayColor,
  Sphere, Scene, Camera } from './lib.js';

const c = document.getElementById("mycanvas");
const ctx = c.getContext("2d");

// image
const width = c.width;
const height = c.height;
const aspectRatio = width / height;
const samplesPerPixel = 25;
const maxDepth = 50;

const imagedata = ctx.createImageData(width, height);

// world
const scene = new Scene();
scene.add(new Sphere(new Vector(0, 0, -1), 0.5));
scene.add(new Sphere(new Vector(0, -100.5, -1), 100));

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
