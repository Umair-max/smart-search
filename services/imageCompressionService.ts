import * as ImageManipulator from "expo-image-manipulator";

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  format?: "jpeg" | "png";
}

export interface CompressionResult {
  uri: string;
  width: number;
  height: number;
  base64?: string;
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: number;
}

class ImageCompressionService {
  /**
   * Default compression options for different use cases
   */
  static readonly PRESETS = {
    profile: {
      maxWidth: 400,
      maxHeight: 400,
      quality: 0.8,
      format: "jpeg" as const,
    },
    itemImage: {
      maxWidth: 800,
      maxHeight: 600,
      quality: 0.85,
      format: "jpeg" as const,
    },
    thumbnail: {
      maxWidth: 150,
      maxHeight: 150,
      quality: 0.7,
      format: "jpeg" as const,
    },
    highQuality: {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.9,
      format: "jpeg" as const,
    },
  };

  /**
   * Compress an image with specified options
   */
  static async compressImage(
    imageUri: string,
    options: CompressionOptions = {}
  ): Promise<CompressionResult> {
    try {
      // Default options
      const {
        maxWidth = 800,
        maxHeight = 600,
        quality = 0.8,
        format = "jpeg",
      } = options;

      // Get original image info
      const originalInfo = await ImageManipulator.manipulateAsync(
        imageUri,
        [],
        { base64: false }
      );

      // Calculate resize dimensions while maintaining aspect ratio
      const { width: originalWidth, height: originalHeight } = originalInfo;
      const aspectRatio = originalWidth / originalHeight;

      let newWidth = originalWidth;
      let newHeight = originalHeight;

      // Resize if image is larger than max dimensions
      if (originalWidth > maxWidth || originalHeight > maxHeight) {
        if (aspectRatio > 1) {
          // Landscape
          newWidth = Math.min(maxWidth, originalWidth);
          newHeight = newWidth / aspectRatio;

          if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = newHeight * aspectRatio;
          }
        } else {
          // Portrait or square
          newHeight = Math.min(maxHeight, originalHeight);
          newWidth = newHeight * aspectRatio;

          if (newWidth > maxWidth) {
            newWidth = maxWidth;
            newHeight = newWidth / aspectRatio;
          }
        }
      }

      // Round dimensions to integers
      newWidth = Math.round(newWidth);
      newHeight = Math.round(newHeight);

      // Compress the image
      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: newWidth, height: newHeight } }],
        {
          compress: quality,
          format:
            format === "jpeg"
              ? ImageManipulator.SaveFormat.JPEG
              : ImageManipulator.SaveFormat.PNG,
          base64: true,
        }
      );

      // Calculate compression stats
      const originalSize = await this.getImageSize(imageUri);
      const compressedSize = result.base64
        ? Math.round((result.base64.length * 3) / 4)
        : 0;
      const compressionRatio =
        originalSize > 0 ? compressedSize / originalSize : 1;

      return {
        uri: result.uri,
        width: result.width,
        height: result.height,
        base64: result.base64,
        originalSize,
        compressedSize,
        compressionRatio,
      };
    } catch (error) {
      console.error("Error compressing image:", error);
      throw new Error("Failed to compress image");
    }
  }

  /**
   * Compress image for profile picture use
   */
  static async compressForProfile(
    imageUri: string
  ): Promise<CompressionResult> {
    return this.compressImage(imageUri, this.PRESETS.profile);
  }

  /**
   * Compress image for item photos
   */
  static async compressForItem(imageUri: string): Promise<CompressionResult> {
    return this.compressImage(imageUri, this.PRESETS.itemImage);
  }

  /**
   * Create thumbnail from image
   */
  static async createThumbnail(imageUri: string): Promise<CompressionResult> {
    return this.compressImage(imageUri, this.PRESETS.thumbnail);
  }

  /**
   * Compress image to specific file size (approximate)
   * Note: This is a best-effort approach and may require multiple iterations
   */
  static async compressToSize(
    imageUri: string,
    targetSizeKB: number,
    maxAttempts: number = 5
  ): Promise<CompressionResult> {
    let quality = 0.9;
    let attempt = 0;
    let result: CompressionResult;

    do {
      result = await this.compressImage(imageUri, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality,
        format: "jpeg",
      });

      const sizeKB = (result.compressedSize || 0) / 1024;

      if (sizeKB <= targetSizeKB || attempt >= maxAttempts - 1) {
        break;
      }

      // Reduce quality for next attempt
      quality = Math.max(0.1, quality - 0.15);
      attempt++;
    } while (attempt < maxAttempts);

    return result;
  }

  /**
   * Get approximate file size of an image
   */
  private static async getImageSize(imageUri: string): Promise<number> {
    try {
      // This is an approximation since React Native doesn't provide direct file size access
      // We'll use the base64 length as a proxy
      const result = await ImageManipulator.manipulateAsync(imageUri, [], {
        base64: true,
      });

      return result.base64 ? Math.round((result.base64.length * 3) / 4) : 0;
    } catch (error) {
      console.error("Error getting image size:", error);
      return 0;
    }
  }

  /**
   * Validate image format
   */
  static isValidImageFormat(imageUri: string): boolean {
    const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
    const lowerUri = imageUri.toLowerCase();
    return validExtensions.some((ext) => lowerUri.includes(ext));
  }

  /**
   * Get image dimensions without loading the full image
   */
  static async getImageDimensions(
    imageUri: string
  ): Promise<{ width: number; height: number }> {
    try {
      const result = await ImageManipulator.manipulateAsync(imageUri, [], {
        base64: false,
      });
      return { width: result.width, height: result.height };
    } catch (error) {
      console.error("Error getting image dimensions:", error);
      throw new Error("Failed to get image dimensions");
    }
  }

  /**
   * Convert image to base64 with compression
   */
  static async imageToBase64(
    imageUri: string,
    options: CompressionOptions = {}
  ): Promise<string> {
    try {
      const result = await this.compressImage(imageUri, options);
      return result.base64 || "";
    } catch (error) {
      console.error("Error converting image to base64:", error);
      throw new Error("Failed to convert image to base64");
    }
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  /**
   * Calculate compression savings
   */
  static getCompressionStats(originalSize: number, compressedSize: number) {
    const savings = originalSize - compressedSize;
    const percentage = originalSize > 0 ? (savings / originalSize) * 100 : 0;

    return {
      originalSize: this.formatFileSize(originalSize),
      compressedSize: this.formatFileSize(compressedSize),
      savings: this.formatFileSize(savings),
      percentage: Math.round(percentage),
    };
  }
}

export default ImageCompressionService;
