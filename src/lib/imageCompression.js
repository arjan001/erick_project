/**
 * Image Compression Utility
 * Compresses images before upload to reduce file size and improve performance
 */

// Default compression options
const DEFAULT_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: false,
  initialQuality: 0.8,
  fileType: 'image/jpeg'
};

/**
 * Compress an image file
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - Compressed file
 */
export async function compressImage(file, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Validate file is an image
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }
  
  // If file is already small enough, return as-is
  if (file.size <= opts.maxSizeMB * 1024 * 1024) {
    return file;
  }
  
  // Create canvas for compression
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      const maxDimension = opts.maxWidthOrHeight;
      
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      
      // Create canvas and draw image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Compress with decreasing quality until size is acceptable
      let quality = opts.initialQuality;
      let compressedFile = null;
      
      const attemptCompression = (currentQuality) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            
            compressedFile = new File([blob], file.name, {
              type: opts.fileType,
              lastModified: Date.now()
            });
            
            // If size is acceptable or quality is too low, return
            if (compressedFile.size <= opts.maxSizeMB * 1024 * 1024 || currentQuality <= 0.1) {
              resolve(compressedFile);
            } else {
              // Try lower quality
              attemptCompression(currentQuality - 0.1);
            }
          },
          opts.fileType,
          currentQuality
        );
      };
      
      attemptCompression(quality);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Compress multiple images
 * @param {File[]} files - Array of image files
 * @param {Object} options - Compression options
 * @returns {Promise<File[]>} - Array of compressed files
 */
export async function compressImages(files, options = {}) {
  const compressedFiles = [];
  
  for (const file of files) {
    try {
      const compressed = await compressImage(file, options);
      compressedFiles.push(compressed);
    } catch (error) {
      console.error(`Failed to compress ${file.name}:`, error);
      // Return original file if compression fails
      compressedFiles.push(file);
    }
  }
  
  return compressedFiles;
}

/**
 * Get image dimensions without loading the full image
 * @param {File} file - Image file
 * @returns {Promise<{width: number, height: number}>} - Image dimensions
 */
export async function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Check if image needs compression
 * @param {File} file - Image file
 * @param {Object} options - Compression options
 * @returns {Promise<boolean>} - Whether image needs compression
 */
export async function needsCompression(file, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Check file size
  if (file.size > opts.maxSizeMB * 1024 * 1024) {
    return true;
  }
  
  // Check dimensions
  try {
    const { width, height } = await getImageDimensions(file);
    if (width > opts.maxWidthOrHeight || height > opts.maxWidthOrHeight) {
      return true;
    }
  } catch {
    // If we can't check dimensions, assume compression is needed if file is large
    return file.size > opts.maxSizeMB * 1024 * 1024;
  }
  
  return false;
}

/**
 * Convert image to WebP format (if supported)
 * @param {File} file - Image file
 * @param {number} quality - Quality (0-1)
 * @returns {Promise<File>} - WebP file
 */
export async function convertToWebP(file, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert to WebP'));
            return;
          }
          
          const webpFile = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), {
            type: 'image/webp',
            lastModified: Date.now()
          });
          
          resolve(webpFile);
        },
        'image/webp',
        quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Check if WebP is supported
 * @returns {boolean} - Whether WebP is supported
 */
export function isWebPSupported() {
  const canvas = document.createElement('canvas');
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Generate thumbnail from image
 * @param {File} file - Image file
 * @param {number} size - Thumbnail size (square)
 * @returns {Promise<File>} - Thumbnail file
 */
export async function generateThumbnail(file, size = 200) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext('2d');
      
      // Calculate crop dimensions to center image
      let { width, height } = img;
      let x = 0, y = 0;
      
      if (width > height) {
        x = (width - height) / 2;
        width = height;
      } else {
        y = (height - width) / 2;
        height = width;
      }
      
      ctx.drawImage(img, x, y, width, height, 0, 0, size, size);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to generate thumbnail'));
            return;
          }
          
          const thumbnail = new File([blob], `thumb_${file.name}`, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          
          resolve(thumbnail);
        },
        'image/jpeg',
        0.7
      );
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Get optimal compression quality based on file size
 * @param {number} fileSize - File size in bytes
 * @param {number} targetSize - Target size in bytes
 * @returns {number} - Quality (0-1)
 */
export function getOptimalQuality(fileSize, targetSize) {
  const ratio = targetSize / fileSize;
  
  if (ratio >= 1) {
    return 1.0; // No compression needed
  }
  
  // Map ratio to quality (0.1 to 1.0)
  return Math.max(0.1, Math.min(1.0, ratio));
}

/**
 * Batch compress images with progress tracking
 * @param {File[]} files - Array of image files
 * @param {Object} options - Compression options
 * @param {Function} onProgress - Progress callback (current, total)
 * @returns {Promise<File[]>} - Array of compressed files
 */
export async function compressImagesWithProgress(files, options = {}, onProgress) {
  const compressedFiles = [];
  
  for (let i = 0; i < files.length; i++) {
    try {
      const compressed = await compressImage(files[i], options);
      compressedFiles.push(compressed);
      
      if (onProgress) {
        onProgress(i + 1, files.length);
      }
    } catch (error) {
      console.error(`Failed to compress ${files[i].name}:`, error);
      compressedFiles.push(files[i]);
      
      if (onProgress) {
        onProgress(i + 1, files.length);
      }
    }
  }
  
  return compressedFiles;
}
