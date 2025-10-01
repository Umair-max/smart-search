import { MedicalSupply } from "@/components/MedicalSupplyItem";
import { db } from "@/config/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  writeBatch,
} from "firebase/firestore";

export interface FirestoreSupply extends MedicalSupply {
  // Metadata for tracking
  createdAt: string;
  updatedAt: string;
  importedBy: string;
  version: number;
  imageUrl?: string; // Optional image URL
  expiryDate?: string; // Optional expiry date (ISO string)
}

export interface ImportStats {
  newItems: number;
  updatedItems: number;
  totalProcessed: number;
  errors: string[];
  totalItems?: number;
  progressPercentage?: number;
}

export interface ProgressCallback {
  (progress: { current: number; total: number; percentage: number }): void;
}

export interface DuplicateCheckResult {
  newItems: MedicalSupply[];
  existingItems: MedicalSupply[];
  totalNew: number;
  totalExisting: number;
}

class SuppliesFirestoreService {
  private static readonly COLLECTION_NAME = "medical-supplies";

  /**
   * Fetch all medical supplies from Firestore
   */
  static async fetchAllSupplies(): Promise<MedicalSupply[]> {
    try {
      const suppliesRef = collection(
        db,
        SuppliesFirestoreService.COLLECTION_NAME
      );
      const q = query(suppliesRef, orderBy("ProductCode"));
      const querySnapshot = await getDocs(q);

      const supplies: MedicalSupply[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirestoreSupply;
        const supply: MedicalSupply = {
          Store: data.Store,
          StoreName: data.StoreName,
          ProductCode: data.ProductCode,
          ProductDescription: data.ProductDescription,
          Category: data.Category,
          UOM: data.UOM,
          imageUrl: data.imageUrl, // Include image URL
          expiryDate: data.expiryDate, // Include expiry date
        };
        supplies.push(supply);
      });

      return supplies;
    } catch (error) {
      console.error("Error fetching supplies:", error);
      throw new Error("Failed to fetch supplies from database");
    }
  }

  /**
   * Check for duplicates and separate new vs existing items
   */
  static async checkForDuplicates(
    newSupplies: MedicalSupply[],
    userEmail: string
  ): Promise<DuplicateCheckResult> {
    try {
      const newItems: MedicalSupply[] = [];
      const existingItems: MedicalSupply[] = [];

      // Check each item against Firestore
      for (const supply of newSupplies) {
        const docRef = doc(
          db,
          SuppliesFirestoreService.COLLECTION_NAME,
          supply.ProductCode
        );
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          existingItems.push(supply);
        } else {
          newItems.push(supply);
        }
      }

      return {
        newItems,
        existingItems,
        totalNew: newItems.length,
        totalExisting: existingItems.length,
      };
    } catch (error) {
      console.error("Error checking duplicates:", error);
      throw new Error("Failed to check for duplicate items");
    }
  }

  /**
   * Import supplies to Firestore with duplicate handling and progress tracking
   * Handles large datasets by chunking into batches of 500 (Firestore limit)
   */
  static async importSupplies(
    supplies: MedicalSupply[],
    userEmail: string,
    overwriteExisting: boolean = true,
    onProgress?: ProgressCallback
  ): Promise<ImportStats> {
    try {
      const BATCH_SIZE = 500; // Firestore batch limit
      const totalItems = supplies.length;
      const chunks = [];

      // Split supplies into chunks of 500
      for (let i = 0; i < supplies.length; i += BATCH_SIZE) {
        chunks.push(supplies.slice(i, i + BATCH_SIZE));
      }

      const stats: ImportStats = {
        newItems: 0,
        updatedItems: 0,
        totalProcessed: 0,
        errors: [],
        totalItems,
        progressPercentage: 0,
      };

      const now = new Date().toISOString();

      // Process each chunk sequentially
      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunk = chunks[chunkIndex];
        const batch = writeBatch(db);
        let chunkOperations = 0;

        for (const supply of chunk) {
          try {
            // Validate ProductCode before attempting to create document
            if (!supply.ProductCode || supply.ProductCode.trim() === "") {
              stats.errors.push(
                `Item missing ProductCode: ${
                  supply.ProductDescription || "Unknown item"
                }`
              );
              continue;
            }

            const cleanProductCode = supply.ProductCode.trim();

            // Additional validation
            if (cleanProductCode.length === 0) {
              stats.errors.push(
                `ProductCode is empty after trim: ${
                  supply.ProductDescription || "Unknown item"
                }`
              );
              continue;
            }

            // Firestore document ID validation
            const invalidChars = /[\/\x00\x1F\x7F-\x9F]/;
            if (invalidChars.test(cleanProductCode)) {
              stats.errors.push(
                `ProductCode contains invalid characters: ${cleanProductCode}`
              );
              continue;
            }

            // Additional safety check for document ID length
            if (cleanProductCode.length > 1500) {
              stats.errors.push(
                `ProductCode too long (${
                  cleanProductCode.length
                } chars): ${cleanProductCode.substring(0, 50)}...`
              );
              continue;
            }

            const docRef = doc(
              db,
              SuppliesFirestoreService.COLLECTION_NAME,
              cleanProductCode
            );

            const docSnap = await getDoc(docRef);

            const supplyData: FirestoreSupply = {
              Store: supply.Store,
              StoreName: supply.StoreName,
              ProductCode: cleanProductCode,
              ProductDescription: supply.ProductDescription,
              Category: supply.Category,
              UOM: supply.UOM,
              imageUrl: supply.imageUrl, // Include image URL
              updatedAt: now,
              importedBy: userEmail,
              version: docSnap.exists() ? (docSnap.data().version || 0) + 1 : 1,
              createdAt: docSnap.exists()
                ? docSnap.data().createdAt || now
                : now,
            };

            if (docSnap.exists()) {
              if (overwriteExisting) {
                batch.set(docRef, supplyData);
                stats.updatedItems++;
                chunkOperations++;
              }
              // Skip if not overwriting existing
            } else {
              batch.set(docRef, supplyData);
              stats.newItems++;
              chunkOperations++;
            }

            stats.totalProcessed++;

            // Update progress after each item for better granularity
            if (
              onProgress &&
              (stats.totalProcessed % 3 === 0 ||
                stats.totalProcessed === totalItems)
            ) {
              const progressPercentage = Math.round(
                (stats.totalProcessed / totalItems) * 100
              );
              onProgress({
                current: stats.totalProcessed,
                total: totalItems,
                percentage: progressPercentage,
              });
            }
          } catch (error) {
            stats.errors.push(
              `Failed to process ${
                supply.ProductCode ||
                supply.ProductDescription ||
                "unknown item"
              }: ${error}`
            );
            stats.totalProcessed++;

            // Update progress even for errors
            if (
              onProgress &&
              (stats.totalProcessed % 3 === 0 ||
                stats.totalProcessed === totalItems)
            ) {
              const progressPercentage = Math.round(
                (stats.totalProcessed / totalItems) * 100
              );
              onProgress({
                current: stats.totalProcessed,
                total: totalItems,
                percentage: progressPercentage,
              });
            }
          }
        }

        // Commit this chunk's batch if there are operations
        if (chunkOperations > 0) {
          await batch.commit();
        }

        // Update progress after each chunk
        const progressPercentage = Math.round(
          ((chunkIndex + 1) / chunks.length) * 100
        );
        stats.progressPercentage = progressPercentage;

        if (onProgress) {
          onProgress({
            current: stats.totalProcessed,
            total: totalItems,
            percentage: progressPercentage,
          });
        }
      }
      console.log(
        `Import completed: ${stats.newItems} new, ${stats.updatedItems} updated, ${stats.errors.length} errors`
      );
      return stats;
    } catch (error) {
      console.error("Error importing supplies:", error);
      throw new Error("Failed to import supplies to database");
    }
  }

  /**
   * Import only new items (no duplicates)
   */
  static async importNewItemsOnly(
    newItems: MedicalSupply[],
    userEmail: string,
    onProgress?: ProgressCallback
  ): Promise<ImportStats> {
    return this.importSupplies(newItems, userEmail, false, onProgress);
  }

  /**
   * Get a single supply by ProductCode
   */
  static async getSupplyByCode(
    productCode: string
  ): Promise<MedicalSupply | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, productCode);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as FirestoreSupply;
        const supply: MedicalSupply = {
          Store: data.Store,
          StoreName: data.StoreName,
          ProductCode: data.ProductCode,
          ProductDescription: data.ProductDescription,
          Category: data.Category,
          UOM: data.UOM,
        };
        return supply;
      }

      return null;
    } catch (error) {
      console.error("Error fetching supply:", error);
      throw new Error("Failed to fetch supply");
    }
  }

  /**
   * Update a single supply
   */
  static async updateSupply(
    supply: MedicalSupply,
    userEmail: string
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, supply.ProductCode);
      const docSnap = await getDoc(docRef);

      const supplyData: FirestoreSupply = {
        Store: supply.Store,
        StoreName: supply.StoreName,
        ProductCode: supply.ProductCode,
        ProductDescription: supply.ProductDescription,
        Category: supply.Category,
        UOM: supply.UOM,
        imageUrl: supply.imageUrl, // Include image URL
        updatedAt: new Date().toISOString(),
        importedBy: userEmail,
        version: docSnap.exists() ? (docSnap.data().version || 0) + 1 : 1,
        createdAt: docSnap.exists()
          ? docSnap.data().createdAt || new Date().toISOString()
          : new Date().toISOString(),
      };

      await setDoc(docRef, supplyData);
    } catch (error) {
      console.error("Error updating supply:", error);
      throw new Error("Failed to update supply");
    }
  }

  /**
   * Delete a supply
   */
  static async deleteSupply(productCode: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, productCode);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting supply:", error);
      throw new Error("Failed to delete supply");
    }
  }

  /**
   * Get supplies count
   */
  static async getSuppliesCount(): Promise<number> {
    try {
      const suppliesRef = collection(db, this.COLLECTION_NAME);
      const querySnapshot = await getDocs(suppliesRef);
      return querySnapshot.size;
    } catch (error) {
      console.error("Error getting supplies count:", error);
      return 0;
    }
  }
}

export default SuppliesFirestoreService;
