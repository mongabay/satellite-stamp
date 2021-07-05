export const IMAGE_SCALE = 2;

/**
 * Wait (resolve) until a condition is met
 * @param {() => boolean} condition Condition that must be true to execute the callback
 * @param {number} [delay] Minimum initial delay before checking the condition (ms)
 */
export const waitUntil = async (condition, delay) => {
  const startWait = resolve => {
    if (condition()) {
      resolve();
    } else {
      const interval = setInterval(() => {
        if (condition()) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    }
  };

  return new Promise(resolve => {
    if (delay) {
      setTimeout(startWait, delay, resolve);
    } else {
      startWait(resolve);
    }
  });
};

/**
 * Generate the canvas frame of the visualization
 */
export const generateCanvasFrame = async () => {
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

  return canvas;
};

/**
 * Download the image of the map
 */
export const downloadImage = async () => {
  const canvas = await generateCanvasFrame();

  const url = canvas.toDataURL();
  const link = document.createElement('a');
  link.setAttribute('download', 'map.png');
  link.setAttribute('href', url);
  link.click();
};

/**
 * Download the animated image of the map
 * @param {HTMLCanvasElement[]} canvasFrames List of canvas frames
 * @param {number} duration Duration of the animation (s)
 */
export const downloadAnimatedImage = async (canvasFrames, duration) => {
  const GifJs = (await import('public/libs/gif-js/gif.js')).default;

  const gif = new GifJs({
    workerScript: '/libs/gif-js/gif.worker.js',
  });

  canvasFrames.forEach(frame =>
    gif.addFrame(frame, { delay: (duration * 1000) / canvasFrames.length })
  );

  gif.on('finished', function(blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('download', 'map.gif');
    link.setAttribute('href', url);
    link.click();
  });

  gif.render();
};
