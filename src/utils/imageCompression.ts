/**
 * Compress and resize image for faster AI processing
 */
export const compressImageForAI = (
  imageDataUrl: string,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      let { width, height } = img;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Use better image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to JPEG for smaller size (unless it's a PNG with transparency)
      const outputFormat = imageDataUrl.includes('image/png') ? 'image/png' : 'image/jpeg';
      const compressedDataUrl = canvas.toDataURL(outputFormat, quality);
      
      console.log(`Image compressed: ${Math.round(imageDataUrl.length / 1024)}KB -> ${Math.round(compressedDataUrl.length / 1024)}KB`);
      
      resolve(compressedDataUrl);
    };
    
    img.onerror = () => {
      // If we can't load the image, return the original
      console.warn('Could not load image for compression, using original');
      resolve(imageDataUrl);
    };
    
    img.src = imageDataUrl;
  });
};

/**
 * Fetch image from URL and convert to compressed base64
 */
export const fetchAndCompressImage = async (
  imageUrl: string,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.8
): Promise<string> => {
  // If already a data URL, just compress it
  if (imageUrl.startsWith('data:')) {
    return compressImageForAI(imageUrl, maxWidth, maxHeight, quality);
  }
  
  // For external URLs, we need to fetch and convert
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    
    img.onerror = () => {
      // If loading fails, return the original URL
      console.warn('Could not fetch image for compression:', imageUrl);
      resolve(imageUrl);
    };
    
    img.src = imageUrl;
  });
};

/**
 * Process multiple images in parallel for faster processing
 */
export const compressMultipleImages = async (
  images: Array<{ imageUrl: string; name: string }>,
  maxWidth: number = 600,
  maxHeight: number = 600,
  quality: number = 0.75
): Promise<Array<{ imageUrl: string; name: string }>> => {
  const results = await Promise.all(
    images.map(async (item) => {
      try {
        const compressedUrl = await fetchAndCompressImage(
          item.imageUrl,
          maxWidth,
          maxHeight,
          quality
        );
        return { ...item, imageUrl: compressedUrl };
      } catch (error) {
        console.error('Failed to compress image:', item.name, error);
        return item;
      }
    })
  );
  
  return results;
};
