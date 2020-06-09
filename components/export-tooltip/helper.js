export const IMAGE_SCALE = 2;

/**
 * Download the image of the map
 */
export const downloadImage = async () => {
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(document.querySelector('.js-visualization'), {
    scale: IMAGE_SCALE,
  });

  // We could directly download the image from here, but its resolution is quite poor, especially
  // for the Mongabay logo
  // Instead, we have generated the image with a bigger scale (IMAGE_SCALE) and now we're scaling
  // it back to the size the user asked for
  const context = canvas.getContext('2d');
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  const newCanvas = document.createElement('canvas');
  newCanvas.width = canvas.width;
  newCanvas.height = canvas.height;
  newCanvas.getContext('2d').putImageData(imageData, 0, 0);

  canvas.width = canvas.width / IMAGE_SCALE;
  canvas.height = canvas.height / IMAGE_SCALE;
  context.scale(1 / IMAGE_SCALE, 1 / IMAGE_SCALE);
  context.drawImage(newCanvas, 0, 0);

  const url = canvas.toDataURL();
  const link = document.createElement('a');
  link.setAttribute('download', 'map.png');
  link.setAttribute('href', url);
  link.click();
};
