import { storage } from "@/config/firebase";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

class FirebaseStorageService {
  private static readonly USER_IMAGES_FOLDER = "user/images";
  private static readonly SUPPLIES_IMAGES_FOLDER = "supplies/images";

  /**
   * Check if Firebase Storage is properly initialized
   */
  private static validateStorage(): void {
    if (!storage) {
      throw new Error("Firebase Storage is not initialized");
    }
  }

  /**
   * Upload a profile image to Firebase Storage
   * @param userId - The user's UID
   * @param imageUri - Local image URI
   * @param fileName - Optional custom filename
   * @returns Promise<string> - Download URL of the uploaded image
   */
  static async uploadProfileImage(
    userId: string,
    imageUri: string,
    fileName?: string
  ): Promise<string> {
    try {
      // Validate Firebase Storage initialization
      this.validateStorage();

      console.log(`Starting profile image upload for user ${userId}`);
      console.log(`Image URI: ${imageUri}`);

      // Validate inputs
      if (!userId || !imageUri) {
        throw new Error("User ID and image URI are required");
      }

      // Generate filename if not provided
      const timestamp = Date.now();
      const extension = this.getFileExtension(imageUri);
      const finalFileName = fileName || `${userId}_${timestamp}.${extension}`;

      console.log(`Generated filename: ${finalFileName}`);

      // Create storage reference
      const storageRef = ref(
        storage,
        `${this.USER_IMAGES_FOLDER}/${finalFileName}`
      );

      console.log(
        `Storage reference path: ${this.USER_IMAGES_FOLDER}/${finalFileName}`
      );

      // Convert image URI to blob
      console.log("Converting image URI to blob...");
      const response = await fetch(imageUri);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch image: ${response.status} ${response.statusText}`
        );
      }

      const blob = await response.blob();
      console.log(
        `Blob created successfully, size: ${blob.size} bytes, type: ${blob.type}`
      );

      // Upload the image
      console.log(`Uploading to Firebase Storage...`);
      const snapshot = await uploadBytes(storageRef, blob);
      console.log(`Upload completed successfully`);

      // Get download URL
      console.log("Getting download URL...");
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log(`Profile image uploaded successfully: ${downloadURL}`);

      return downloadURL;
    } catch (error) {
      console.error("Error uploading profile image:", error);
      console.error("Error details:", {
        userId,
        imageUri,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to upload profile image: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete a profile image from Firebase Storage
   * @param imageUrl - The download URL of the image to delete
   */
  static async deleteProfileImage(imageUrl: string): Promise<void> {
    try {
      // Validate Firebase Storage initialization
      this.validateStorage();
      // Validate input
      if (!imageUrl || typeof imageUrl !== "string") {
        console.warn("Invalid image URL provided for deletion:", imageUrl);
        return;
      }

      // Check if it's a Firebase Storage URL
      if (!imageUrl.includes("firebasestorage.googleapis.com")) {
        console.warn(
          "Not a Firebase Storage URL, skipping deletion:",
          imageUrl
        );
        return;
      }

      // Extract the path from the download URL
      let path: string;
      try {
        const url = new URL(imageUrl);
        if (!url.pathname) {
          throw new Error("URL pathname is undefined");
        }

        const pathParts = url.pathname.split("/o/");
        if (pathParts.length < 2) {
          throw new Error("Invalid Firebase Storage URL format");
        }

        path = decodeURIComponent(pathParts[1].split("?")[0]);
      } catch (urlError) {
        console.error("Error parsing Firebase Storage URL:", urlError);
        throw new Error("Invalid Firebase Storage URL format");
      }

      const imageRef = ref(storage, path);
      await deleteObject(imageRef);
      console.log("Profile image deleted successfully");
    } catch (error) {
      console.error("Error deleting profile image:", error);
      throw new Error("Failed to delete profile image");
    }
  }

  /**
   * Extract file extension from image URI
   * @param imageUri - The image URI
   * @returns string - File extension (default: 'jpg')
   */
  private static getFileExtension(imageUri: string): string {
    try {
      // Handle different URI formats
      const uriParts = imageUri.split(".");
      const extension = uriParts[uriParts.length - 1].toLowerCase();

      // Validate common image extensions
      const validExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
      if (validExtensions.includes(extension)) {
        return extension;
      }

      // Default to jpg if extension is not recognized
      return "jpg";
    } catch (error) {
      console.warn("Could not extract file extension, defaulting to jpg");
      return "jpg";
    }
  }

  /**
   * Generate a unique filename for profile images
   * @param userId - The user's UID
   * @param imageUri - The image URI to extract extension from
   * @returns string - Unique filename
   */
  static generateProfileImageFileName(
    userId: string,
    imageUri: string
  ): string {
    const timestamp = Date.now();
    const extension = this.getFileExtension(imageUri);
    return `${userId}_profile_${timestamp}.${extension}`;
  }

  /**
   * Upload a supply image to Firebase Storage
   * @param productCode - The product code for the supply
   * @param imageUri - Local image URI
   * @param fileName - Optional custom filename
   * @returns Promise<string> - Download URL of the uploaded image
   */
  static async uploadSupplyImage(
    productCode: string,
    imageUri: string,
    fileName?: string
  ): Promise<string> {
    try {
      // Validate Firebase Storage initialization
      this.validateStorage();

      console.log(`Starting supply image upload for product ${productCode}`);
      console.log(`Image URI: ${imageUri}`);

      // Validate inputs
      if (!productCode || !imageUri) {
        throw new Error("Product code and image URI are required");
      }

      // Generate filename if not provided
      const timestamp = Date.now();
      const extension = this.getFileExtension(imageUri);
      const finalFileName =
        fileName || `${productCode}_${timestamp}.${extension}`;

      console.log(`Generated filename: ${finalFileName}`);

      // Create storage reference
      const storageRef = ref(
        storage,
        `${this.SUPPLIES_IMAGES_FOLDER}/${finalFileName}`
      );

      console.log(
        `Storage reference path: ${this.SUPPLIES_IMAGES_FOLDER}/${finalFileName}`
      );

      // Convert image URI to blob
      console.log("Converting image URI to blob...");
      const response = await fetch(imageUri);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch image: ${response.status} ${response.statusText}`
        );
      }

      const blob = await response.blob();
      console.log(
        `Blob created successfully, size: ${blob.size} bytes, type: ${blob.type}`
      );

      // Upload the image
      console.log(`Uploading to Firebase Storage...`);
      const snapshot = await uploadBytes(storageRef, blob);
      console.log(`Upload completed successfully`);

      // Get download URL
      console.log("Getting download URL...");
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log(`Supply image uploaded successfully: ${downloadURL}`);

      return downloadURL;
    } catch (error) {
      console.error("Error uploading supply image:", error);
      console.error("Error details:", {
        productCode,
        imageUri,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to upload supply image: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete a supply image from Firebase Storage
   * @param imageUrl - The download URL of the image to delete
   */
  static async deleteSupplyImage(imageUrl: string): Promise<void> {
    try {
      // Validate Firebase Storage initialization
      this.validateStorage();

      // Validate input
      if (!imageUrl || typeof imageUrl !== "string") {
        console.warn("Invalid image URL provided for deletion:", imageUrl);
        return;
      }

      // Check if it's a Firebase Storage URL
      if (!imageUrl.includes("firebasestorage.googleapis.com")) {
        console.warn(
          "Not a Firebase Storage URL, skipping deletion:",
          imageUrl
        );
        return;
      }

      // Extract the path from the download URL
      let path: string;
      try {
        const url = new URL(imageUrl);
        if (!url.pathname) {
          throw new Error("URL pathname is undefined");
        }

        const pathParts = url.pathname.split("/o/");
        if (pathParts.length < 2) {
          throw new Error("Invalid Firebase Storage URL format");
        }

        path = decodeURIComponent(pathParts[1].split("?")[0]);
      } catch (urlError) {
        console.error("Error parsing Firebase Storage URL:", urlError);
        throw new Error("Invalid Firebase Storage URL format");
      }

      const imageRef = ref(storage, path);
      await deleteObject(imageRef);
      console.log("Supply image deleted successfully");
    } catch (error) {
      console.error("Error deleting supply image:", error);
      throw new Error("Failed to delete supply image");
    }
  }
}

export default FirebaseStorageService;
