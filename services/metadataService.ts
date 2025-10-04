import { db } from "@/config/firebase";
import { safeFirestoreOperation } from "@/utils/networkUtils";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

interface AppMetadata {
  suppliesLastUpdated: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

class MetadataService {
  private static readonly METADATA_COLLECTION = "app_metadata";
  private static readonly SUPPLIES_METADATA_DOC = "supplies_metadata";

  /**
   * Get the global last updated timestamp for supplies
   */
  static async getSuppliesLastUpdated(): Promise<Date | null> {
    try {
      const metadataDocRef = doc(
        db,
        this.METADATA_COLLECTION,
        this.SUPPLIES_METADATA_DOC
      );

      const metadataDoc = await getDoc(metadataDocRef);

      if (metadataDoc.exists()) {
        const data = metadataDoc.data() as AppMetadata;
        return data.suppliesLastUpdated?.toDate() || null;
      }

      return null;
    } catch (error) {
      console.error("Error getting supplies last updated timestamp:", error);
      return null;
    }
  }

  /**
   * Update the global last updated timestamp for supplies
   */
  static async updateSuppliesLastUpdated(): Promise<void> {
    try {
      const metadataDocRef = doc(
        db,
        this.METADATA_COLLECTION,
        this.SUPPLIES_METADATA_DOC
      );

      const metadataDoc = await getDoc(metadataDocRef);

      if (metadataDoc.exists()) {
        // Update existing document
        await updateDoc(metadataDocRef, {
          suppliesLastUpdated: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new document if it doesn't exist
        await setDoc(metadataDocRef, {
          suppliesLastUpdated: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      console.log("Updated supplies last updated timestamp");
    } catch (error) {
      console.error("Error updating supplies last updated timestamp:", error);
      throw error;
    }
  }

  /**
   * Initialize metadata document with current timestamp
   */
  static async initializeSuppliesMetadata(): Promise<void> {
    return safeFirestoreOperation(
      async () => {
        const metadataDocRef = doc(
          db,
          this.METADATA_COLLECTION,
          this.SUPPLIES_METADATA_DOC
        );

        const metadataDoc = await getDoc(metadataDocRef);

        if (!metadataDoc.exists()) {
          await setDoc(metadataDocRef, {
            suppliesLastUpdated: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          console.log("Initialized supplies metadata document");
        }
      },
      () => {
        // Offline fallback - do nothing, will sync when online
        console.log(
          "initializeSuppliesMetadata: Offline mode - skipping initialization"
        );
      },
      "Initialize supplies metadata"
    );
  }

  /**
   * Check if data needs to be refreshed based on timestamps
   */
  static async shouldRefreshSupplies(
    userLastFetched: Date | null
  ): Promise<boolean> {
    return safeFirestoreOperation(
      async () => {
        // If user has never fetched, they need to fetch
        if (!userLastFetched) {
          return true;
        }

        const globalLastUpdated = await this.getSuppliesLastUpdated();

        // If no global timestamp exists, assume data needs refresh
        if (!globalLastUpdated) {
          return true;
        }

        // Compare timestamps - refresh if global is newer than user's last fetch
        return globalLastUpdated.getTime() > userLastFetched.getTime();
      },
      () => {
        // Offline fallback - don't refresh if offline
        console.log("shouldRefreshSupplies: Offline mode - skipping refresh");
        return false;
      },
      "Check if supplies need refresh"
    );
  }
}

export default MetadataService;
