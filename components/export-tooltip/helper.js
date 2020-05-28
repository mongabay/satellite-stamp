/**
 * Download the image of the map
 */
export const downloadImage = async () => {
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(document.querySelector('.js-visualization'), { scale: 1 });
  const url = canvas.toDataURL();
  const link = document.createElement('a');
  link.setAttribute('download', 'map.png');
  link.setAttribute('href', url);
  link.click();
};
