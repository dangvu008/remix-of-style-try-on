import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

const MAX_IMAGE_DIMENSION = 1024;

let segmenter: any = null;
let isInitializing = false;
let initPromise: Promise<void> | null = null;

function resizeImageIfNeeded(
  canvas: HTMLCanvasElement, 
  ctx: CanvasRenderingContext2D, 
  image: HTMLImageElement
): boolean {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

export const initBackgroundRemover = async (onProgress?: (progress: number) => void): Promise<void> => {
  // Return existing promise if already initializing
  if (isInitializing && initPromise) {
    return initPromise;
  }
  
  if (segmenter) {
    onProgress?.(100);
    return;
  }
  
  isInitializing = true;
  onProgress?.(10);
  
  initPromise = (async () => {
    try {
      // Try WebGPU first
      console.log('Attempting to load segmenter with WebGPU...');
      segmenter = await pipeline(
        'image-segmentation',
        'Xenova/segformer-b0-finetuned-ade-512-512',
        { device: 'webgpu' }
      );
      console.log('Segmenter loaded with WebGPU');
      onProgress?.(100);
    } catch (error) {
      console.warn('WebGPU not available, falling back to CPU:', error);
      try {
        segmenter = await pipeline(
          'image-segmentation',
          'Xenova/segformer-b0-finetuned-ade-512-512'
        );
        console.log('Segmenter loaded with CPU');
        onProgress?.(100);
      } catch (cpuError) {
        console.error('Failed to load segmenter:', cpuError);
        isInitializing = false;
        initPromise = null;
        throw new Error('Không thể khởi tạo bộ xóa nền. Vui lòng thử lại.');
      }
    }
    isInitializing = false;
  })();
  
  return initPromise;
};

export const removeBackground = async (
  imageDataUrl: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    onProgress?.(5);
    
    // Initialize if needed
    if (!segmenter) {
      try {
        await initBackgroundRemover((p) => onProgress?.(5 + p * 0.4));
      } catch (initError) {
        console.warn('Background remover initialization failed:', initError);
        // Return original image if we can't remove background
        return imageDataUrl;
      }
    }
    
    if (!segmenter) {
      console.warn('Segmenter not available, returning original image');
      return imageDataUrl;
    }
    
    onProgress?.(50);
    
    // Load image
    const img = await loadImage(imageDataUrl);
    
    if (!img || img.naturalWidth === 0 || img.naturalHeight === 0) {
      console.warn('Invalid image, returning original');
      return imageDataUrl;
    }
    
    // Convert to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('Could not get canvas context, returning original image');
      return imageDataUrl;
    }
    
    resizeImageIfNeeded(canvas, ctx, img);
    
    onProgress?.(60);
    
    // Get image data as base64 for processing
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    // Process with segmentation model
    let result;
    try {
      result = await segmenter(imageData);
    } catch (segError) {
      console.error('Segmentation failed:', segError);
      return imageDataUrl;
    }
    
    onProgress?.(80);
    
    if (!result || !Array.isArray(result) || result.length === 0) {
      console.warn('Empty segmentation result, returning original image');
      return imageDataUrl;
    }
    
    // Find best mask (prefer person or clothing related labels)
    let bestMask = result[0]?.mask;
    
    // Look for person/clothing related segments
    for (const segment of result) {
      if (segment.label && segment.mask) {
        const label = segment.label.toLowerCase();
        if (label.includes('person') || label.includes('clothing') || 
            label.includes('shirt') || label.includes('dress') ||
            label.includes('pants') || label.includes('apparel')) {
          bestMask = segment.mask;
          break;
        }
      }
    }
    
    if (!bestMask || !bestMask.data) {
      console.warn('No valid mask found, returning original image');
      return imageDataUrl;
    }
    
    // Create output canvas
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) {
      console.warn('Could not get output canvas context, returning original image');
      return imageDataUrl;
    }
    
    // Draw original image
    outputCtx.drawImage(canvas, 0, 0);
    
    // Apply mask
    const outputImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    const data = outputImageData.data;
    
    // Check if mask data length matches pixel count
    const expectedLength = outputCanvas.width * outputCanvas.height;
    if (bestMask.data.length !== expectedLength) {
      console.warn(`Mask size mismatch: ${bestMask.data.length} vs ${expectedLength}, returning original image`);
      return imageDataUrl;
    }
    
    // Invert mask to keep subject (clothing)
    for (let i = 0; i < bestMask.data.length; i++) {
      const maskValue = bestMask.data[i];
      // Invert: keep foreground (clothing), remove background
      const alpha = Math.round((1 - maskValue) * 255);
      data[i * 4 + 3] = alpha;
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    
    onProgress?.(100);
    
    console.log('Background removal successful');
    return outputCanvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error removing background:', error);
    // Return original image instead of throwing
    return imageDataUrl;
  }
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    const timeoutId = setTimeout(() => {
      reject(new Error('Image load timeout'));
    }, 30000); // 30 second timeout
    
    img.onload = () => {
      clearTimeout(timeoutId);
      resolve(img);
    };
    img.onerror = (e) => {
      clearTimeout(timeoutId);
      reject(new Error('Failed to load image'));
    };
    img.src = src;
  });
};

// Check if image has transparency (already has background removed)
export const hasTransparentBackground = async (imageDataUrl: string): Promise<boolean> => {
  try {
    const img = await loadImage(imageDataUrl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Check corners and edges for transparency
    const checkPoints = [
      0, // top-left
      (canvas.width - 1) * 4, // top-right
      (canvas.height - 1) * canvas.width * 4, // bottom-left
      ((canvas.height - 1) * canvas.width + canvas.width - 1) * 4, // bottom-right
    ];
    
    let transparentCount = 0;
    for (const point of checkPoints) {
      if (point + 3 < data.length && data[point + 3] < 200) { // Alpha channel
        transparentCount++;
      }
    }
    
    return transparentCount >= 2;
  } catch {
    return false;
  }
};

// Reset the segmenter (useful for error recovery)
export const resetBackgroundRemover = () => {
  segmenter = null;
  isInitializing = false;
  initPromise = null;
};
