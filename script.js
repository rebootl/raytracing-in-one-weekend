const c = document.getElementById("mycanvas"); 
const ctx = c.getContext("2d");
 
const width = c.width;
const height = c.height;
 
const imagedata = ctx.createImageData(width, height);

for (let y = 0; y < height; y++) {
  //console.log('line: ' + (y+1))
  for (let x = 0; x < width; x++) {
    const pixelindex = (y * width + x) * 4;

    const red = x / (width - 1);
    const green = (255 - y) / (height - 1);
    const blue = 0.25;
    
    imagedata.data[pixelindex] = parseInt(red * 255.999);
    imagedata.data[pixelindex+1] = parseInt(green * 255.999);
    imagedata.data[pixelindex+2] = parseInt(blue * 255.999);
    imagedata.data[pixelindex+3] = 255;
  }
}

ctx.putImageData(imagedata, 0, 0);


