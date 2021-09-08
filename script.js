import { Vector, Color, Ray } from './classes.js';

const c = document.getElementById("mycanvas"); 
const ctx = c.getContext("2d");

const width = c.width;
const height = c.height;
const aspectRatio = width / height;
 
const imagedata = ctx.createImageData(width, height);

// camera
const viewportHeight = 2.0;
const viewportWidth = viewportHeight * aspectRatio;
const focalLength = 1.0;

const origin = new Vector(0, 0, 0);
const horizontal = new Vector(viewportWidth, 0, 0);
const vertical = new Vector(0, viewportWidth, 0);
const lowerLeftCorner = origin
  .subtractVector(horizontal.divide(2))
  .subtractVector(vertical.divide(2))
  .subtractVector(new Vector(0, 0, focalLength));

function writeColor(x, y, c) {
    const pixelindex = (y * width + x) * 4;
    imagedata.data[pixelindex] = parseInt(c.r * 255.999);
    imagedata.data[pixelindex+1] = parseInt(c.g * 255.999);
    imagedata.data[pixelindex+2] = parseInt(c.b * 255.999);
    imagedata.data[pixelindex+3] = 255;  
}

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {

    const c = new Color(
      x / (width - 1),
      (255 - y) / (height - 1),
      0.25
    );
    
    writeColor(x, y, c);
  }
}

ctx.putImageData(imagedata, 0, 0);