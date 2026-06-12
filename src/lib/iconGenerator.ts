/**
 * Resizes an uploaded image file into all required branding sizes using HTML5 Canvas.
 * Supports PNG, JPG, JPEG, WEBP, SVG.
 */
export const generateBrandingIcons = (
  file: File,
  sizes: number[]
): Promise<Record<string, string>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const results: Record<string, string> = {};
        
        // Create canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        if (!ctx) {
          reject(new Error("Could not get canvas 2d context"));
          return;
        }

        sizes.forEach((size) => {
          // Set canvas dimensions
          canvas.width = size;
          canvas.height = size;
          
          // Clear canvas
          ctx.clearRect(0, 0, size, size);
          
          // Draw image resized
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          
          // Draw centered image maintaining square fit
          ctx.drawImage(img, 0, 0, size, size);
          
          // Get Data URL (always return PNG for consistent alpha/transparency support)
          results[size.toString()] = canvas.toDataURL("image/png");
        });
        
        resolve(results);
      };
      
      img.onerror = () => {
        reject(new Error("Failed to load image file"));
      };
      
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    
    reader.readAsDataURL(file);
  });
};
