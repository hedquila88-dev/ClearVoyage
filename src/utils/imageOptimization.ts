// Standard image processing configuration for client-side token & bandwidth savings

export const MAX_DIM_VISION = 1024;
export const JPEG_QUALITY_VISION = 0.65;

export async function compressBase64Image(
  base64Str: string,
  maxWidth = MAX_DIM_VISION,
  maxHeight = MAX_DIM_VISION,
  quality = JPEG_QUALITY_VISION
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      // Return original on error to prevent breaking flow
      resolve(base64Str);
    };
  });
}
