/**
 * Compresses and resizes an image client-side using the Canvas API.
 * @param file The original image file.
 * @param maxWidth The maximum width/height allowed (default 1200px).
 * @param quality The quality of the compressed image (default 0.8).
 * @returns A Promise that resolves to the compressed File.
 */
export async function compressImageClientSide(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    // If it's not an image or it's a vector graphic (SVG), don't touch it
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      resolve(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.width;
      let height = img.height;

      // Scale down if it exceeds max dimensions
      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file); // Fallback to original if Canvas is not supported
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to webp for better compression
      canvas.toBlob((blob) => {
        if (blob) {
          // Replace extension with .webp
          const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
          const newFile = new File([blob], newFileName, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(newFile);
        } else {
          resolve(file); // Fallback
        }
      }, 'image/webp', quality);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    img.src = objectUrl;
  });
}
