import {
  deleteObject,
  FullMetadata,
  getDownloadURL,
  getMetadata,
  listAll,
  ref,
  SettableMetadata,
  StorageReference,
  updateMetadata,
  uploadBytes,
  uploadBytesResumable,
  UploadTask,
  UploadTaskSnapshot,
} from "firebase/storage";
import { storage } from "../config/firebase";

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

export interface FileUploadResult {
  downloadURL: string;
  fullPath: string;
  name: string;
  size: number;
  contentType?: string;
}

export class StorageService {
  /**
   * Upload a file to Firebase Storage
   */
  static async uploadFile(
    file: Blob | Uint8Array | ArrayBuffer,
    path: string,
    metadata?: SettableMetadata,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileUploadResult> {
    try {
      const storageRef = ref(storage, path);

      let uploadTask: UploadTask;

      if (onProgress) {
        // Use resumable upload if progress callback is provided
        uploadTask = uploadBytesResumable(storageRef, file, metadata);

        return new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot: UploadTaskSnapshot) => {
              const progress = {
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes,
                progress:
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
              };
              onProgress(progress);
            },
            (error) => {
              console.error("Upload failed:", error);
              reject(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(
                  uploadTask.snapshot.ref
                );
                const metadata = await getMetadata(uploadTask.snapshot.ref);
                resolve({
                  downloadURL,
                  fullPath: uploadTask.snapshot.ref.fullPath,
                  name: uploadTask.snapshot.ref.name,
                  size: metadata.size,
                  contentType: metadata.contentType,
                });
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      } else {
        // Use simple upload
        const snapshot = await uploadBytes(storageRef, file, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);
        const fileMetadata = await getMetadata(snapshot.ref);

        return {
          downloadURL,
          fullPath: snapshot.ref.fullPath,
          name: snapshot.ref.name,
          size: fileMetadata.size,
          contentType: fileMetadata.contentType,
        };
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  /**
   * Delete a file from Firebase Storage
   */
  static async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  /**
   * Get download URL for a file
   */
  static async getDownloadURL(path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error getting download URL:", error);
      throw error;
    }
  }

  /**
   * Get metadata for a file
   */
  static async getFileMetadata(path: string): Promise<FullMetadata> {
    try {
      const storageRef = ref(storage, path);
      return await getMetadata(storageRef);
    } catch (error) {
      console.error("Error getting file metadata:", error);
      throw error;
    }
  }

  /**
   * Update metadata for a file
   */
  static async updateFileMetadata(
    path: string,
    metadata: SettableMetadata
  ): Promise<FullMetadata> {
    try {
      const storageRef = ref(storage, path);
      return await updateMetadata(storageRef, metadata);
    } catch (error) {
      console.error("Error updating file metadata:", error);
      throw error;
    }
  }

  /**
   * List all files in a directory
   */
  static async listFiles(path: string): Promise<{
    items: StorageReference[];
    prefixes: StorageReference[];
  }> {
    try {
      const storageRef = ref(storage, path);
      return await listAll(storageRef);
    } catch (error) {
      console.error("Error listing files:", error);
      throw error;
    }
  }

  /**
   * Generate a unique file path with timestamp
   */
  static generateUniqueFileName(
    directory: string,
    fileName: string,
    extension: string
  ): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    return `${directory}/${timestamp}_${randomId}_${fileName}.${extension}`;
  }
}

// Utility functions for common storage operations
export const storageUtils = {
  /**
   * Upload user avatar
   */
  async uploadAvatar(
    userId: string,
    file: Blob | Uint8Array | ArrayBuffer,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileUploadResult> {
    const path = `avatars/${userId}/avatar_${Date.now()}`;
    const metadata: SettableMetadata = {
      contentType: "image/jpeg",
      customMetadata: {
        userId,
        type: "avatar",
      },
    };

    return StorageService.uploadFile(file, path, metadata, onProgress);
  },

  /**
   * Upload post image
   */
  async uploadPostImage(
    userId: string,
    postId: string,
    file: Blob | Uint8Array | ArrayBuffer,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileUploadResult> {
    const path = `posts/${userId}/${postId}/image_${Date.now()}`;
    const metadata: SettableMetadata = {
      contentType: "image/jpeg",
      customMetadata: {
        userId,
        postId,
        type: "post-image",
      },
    };

    return StorageService.uploadFile(file, path, metadata, onProgress);
  },

  /**
   * Upload document/file
   */
  async uploadDocument(
    userId: string,
    file: Blob | Uint8Array | ArrayBuffer,
    fileName: string,
    contentType: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileUploadResult> {
    const path = `documents/${userId}/${fileName}_${Date.now()}`;
    const metadata: SettableMetadata = {
      contentType,
      customMetadata: {
        userId,
        originalName: fileName,
        type: "document",
      },
    };

    return StorageService.uploadFile(file, path, metadata, onProgress);
  },

  /**
   * Delete user avatar
   */
  async deleteAvatar(userId: string, fileName: string): Promise<void> {
    const path = `avatars/${userId}/${fileName}`;
    return StorageService.deleteFile(path);
  },

  /**
   * Delete post image
   */
  async deletePostImage(
    userId: string,
    postId: string,
    fileName: string
  ): Promise<void> {
    const path = `posts/${userId}/${postId}/${fileName}`;
    return StorageService.deleteFile(path);
  },

  /**
   * Get user's uploaded files
   */
  async getUserFiles(userId: string): Promise<StorageReference[]> {
    const result = await StorageService.listFiles(`documents/${userId}`);
    return result.items;
  },

  /**
   * Convert File object to ArrayBuffer (for React Native/Web compatibility)
   */
  async fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  },

  /**
   * Validate file size and type
   */
  validateFile(
    file: File,
    maxSizeMB: number = 5,
    allowedTypes: string[] = []
  ): boolean {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error(`File size must be less than ${maxSizeMB}MB`);
    }

    // Check file type if specified
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      throw new Error(`File type must be one of: ${allowedTypes.join(", ")}`);
    }

    return true;
  },
};

export default StorageService;
