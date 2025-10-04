import { MedicalSupply } from "@/components/SupplyCard";
import MetadataService from "@/services/metadataService";
import SuppliesFirestoreService from "@/services/suppliesFirestoreService";
import UserManagementService from "@/services/userManagementService";
import { isOfflineError } from "@/utils/networkUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SuppliesStore {
  // State
  supplies: MedicalSupply[];
  isLoading: boolean;
  lastSyncDate: string | null;
  isOnline: boolean;

  // Actions
  setSupplies: (supplies: MedicalSupply[]) => void;
  addSupplies: (supplies: MedicalSupply[]) => void;
  updateSupply: (supply: MedicalSupply) => void;
  removeSupply: (productCode: string) => void;
  clearAllSupplies: () => void;
  setLoading: (loading: boolean) => void;
  setOnlineStatus: (online: boolean) => void;

  // Firestore sync
  fetchFromFirestore: () => Promise<void>;
  smartFetchSupplies: (userId: string) => Promise<void>; // New smart fetch method
  syncToFirestore: (
    supplies: MedicalSupply[],
    userEmail: string
  ) => Promise<any>;

  // Search and filters
  searchSupplies: (query: string) => MedicalSupply[];
  getSuppliesByCategory: (category: string) => MedicalSupply[];
  getTotalCount: () => number;
}

const useSuppliesStore = create<SuppliesStore>()(
  persist(
    (set, get) => ({
      // Initial state
      supplies: [],
      isLoading: false,
      lastSyncDate: null,
      isOnline: true,

      // Basic actions
      setSupplies: (newSupplies) => {
        console.log(
          `Setting supplies: ${newSupplies.length} items (replacing all previous data)`
        );
        set({
          supplies: newSupplies, // Always replace, never append
          lastSyncDate: new Date().toISOString(),
        });
      },

      addSupplies: (newSupplies) => {
        set((state) => {
          // Remove duplicates based on ProductCode
          const existingCodes = new Set(
            state.supplies.map((s) => s.ProductCode)
          );
          const uniqueSupplies = newSupplies.filter(
            (s) => !existingCodes.has(s.ProductCode)
          );

          return {
            supplies: [...state.supplies, ...uniqueSupplies],
            lastSyncDate: new Date().toISOString(),
          };
        });
      },

      updateSupply: (updatedSupply) => {
        set((state) => ({
          supplies: state.supplies.map((supply) =>
            supply.ProductCode === updatedSupply.ProductCode
              ? updatedSupply
              : supply
          ),
          lastSyncDate: new Date().toISOString(),
        }));
      },

      removeSupply: (productCode) => {
        console.log(`SuppliesStore: Removing supply ${productCode}`);
        set((state) => {
          const newSupplies = state.supplies.filter(
            (supply) => supply.ProductCode !== productCode
          );
          console.log(
            `SuppliesStore: Removed supply, ${newSupplies.length} supplies remaining`
          );
          return {
            supplies: newSupplies,
            lastSyncDate: new Date().toISOString(),
          };
        });
      },

      clearAllSupplies: () => {
        set({
          supplies: [],
          lastSyncDate: null,
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setOnlineStatus: (online) => {
        set({ isOnline: online });
      },

      // Firestore operations
      fetchFromFirestore: async () => {
        const { setLoading, setSupplies, setOnlineStatus } = get();

        try {
          setLoading(true);
          setOnlineStatus(true);

          const supplies = await SuppliesFirestoreService.fetchAllSupplies();

          // Always replace local data with Firebase data (even if empty)
          setSupplies(supplies);

          if (supplies.length === 0) {
            console.log(
              "Fetched 0 supplies from Firestore - cleared local data"
            );
          } else {
            console.log(
              `Fetched ${supplies.length} supplies from Firestore - replaced local data`
            );
          }
        } catch (error) {
          console.error("Failed to fetch from Firestore:", error);
          setOnlineStatus(false);
          // Don't clear data on error, keep existing data
          throw error;
        } finally {
          setLoading(false);
        }
      },

      smartFetchSupplies: async (userId: string) => {
        const { setLoading, setSupplies, setOnlineStatus, supplies } = get();

        try {
          setLoading(true);
          setOnlineStatus(true);

          // Get user's last fetched timestamp
          const userLastFetched =
            await UserManagementService.getSuppliesLastFetched(userId);
          console.log(`User last fetched supplies at:`, userLastFetched);

          // Check current local data count
          const hasLocalData = supplies.length > 0;
          console.log(
            `Has local persisted data: ${hasLocalData} (${supplies.length} items)`
          );

          // If user has never fetched AND we have local data, they probably have persisted data
          if (!userLastFetched && hasLocalData) {
            console.log(
              "First launch but have persisted data - initializing metadata"
            );

            // Try to initialize metadata, but don't fail if offline
            try {
              await MetadataService.initializeSuppliesMetadata();
              await UserManagementService.updateSuppliesLastFetched(userId);
              console.log("Metadata initialized successfully");
            } catch (metadataError) {
              if (isOfflineError(metadataError)) {
                console.log(
                  "Offline mode: Skipping metadata initialization, using local data"
                );
              } else {
                console.warn("Failed to initialize metadata:", metadataError);
              }
            }

            console.log("Using persisted data - no fetch needed");
            setLoading(false); // Ensure loading is stopped when using cached data
            return;
          }

          // Check if refresh is needed by comparing timestamps
          const needsRefresh = await MetadataService.shouldRefreshSupplies(
            userLastFetched
          );
          console.log(`Supplies need refresh:`, needsRefresh);

          // Only fetch if we need refresh OR have no local data
          if (needsRefresh || !hasLocalData) {
            try {
              console.log("Fetching fresh supplies data from Firestore...");

              // Fetch fresh data from Firestore
              const freshSupplies =
                await SuppliesFirestoreService.fetchAllSupplies();

              // Update local data
              setSupplies(freshSupplies);

              // Update user's last fetched timestamp
              await UserManagementService.updateSuppliesLastFetched(userId);

              console.log(
                `Fetched ${freshSupplies.length} supplies from Firestore - data refreshed`
              );
            } catch (fetchError) {
              if (isOfflineError(fetchError)) {
                console.log(
                  "Offline mode: Cannot fetch, using local data if available"
                );
                setOnlineStatus(false);

                if (hasLocalData) {
                  console.log("Using cached data in offline mode");
                  setLoading(false); // Stop loading before return
                  return; // Keep existing local data
                } else {
                  console.log("No local data available in offline mode");
                  // Let it continue to show empty state
                }
              } else {
                throw fetchError; // Re-throw non-offline errors
              }
            }
          } else {
            console.log("Using cached supplies data - no refresh needed");
            // Data is already loaded from persistence, no need to fetch
            setLoading(false); // Ensure loading is stopped when using cached data
          }
        } catch (error) {
          console.error("Failed to smart fetch supplies:", error);

          if (isOfflineError(error)) {
            console.log("Smart fetch failed due to offline mode");
            setOnlineStatus(false);

            // If we have local data, use it; otherwise show empty state
            if (supplies.length > 0) {
              console.log("Using existing local data in offline mode");
            } else {
              console.log("No local data available for offline mode");
            }
            // Important: Stop loading when in offline mode with local data
            setLoading(false);
          } else {
            // For non-offline errors, try fallback
            setOnlineStatus(false);
            console.log(
              "Smart fetch failed with non-offline error, trying fallback..."
            );

            try {
              const fallbackSupplies =
                await SuppliesFirestoreService.fetchAllSupplies();
              setSupplies(fallbackSupplies);
              console.log("Fallback fetch succeeded");
            } catch (fallbackError) {
              console.error("Fallback fetch also failed:", fallbackError);
              if (isOfflineError(fallbackError)) {
                console.log(
                  "Fallback also failed due to offline - using local data"
                );
              } else {
                throw fallbackError;
              }
            }
          }
        } finally {
          setLoading(false);
        }
      },

      syncToFirestore: async (supplies, userEmail) => {
        const { setLoading } = get();

        try {
          setLoading(true);

          const stats = await SuppliesFirestoreService.importSupplies(
            supplies,
            userEmail,
            true // overwrite existing
          );

          // Refresh local data after sync
          await get().fetchFromFirestore();

          console.log("Sync stats:", stats);
          return stats;
        } catch (error) {
          console.error("Failed to sync to Firestore:", error);
          throw error;
        } finally {
          setLoading(false);
        }
      },

      // Search and filter methods
      searchSupplies: (query) => {
        const supplies = get().supplies;
        if (!query.trim()) return supplies;

        const searchTerm = query.toLowerCase();
        return supplies.filter(
          (supply) =>
            supply.ProductCode.toLowerCase().includes(searchTerm) ||
            supply.ProductDescription.toLowerCase().includes(searchTerm)
        );
      },

      getSuppliesByCategory: (category) => {
        const supplies = get().supplies;
        return supplies.filter((supply) =>
          supply.Category.toLowerCase().includes(category.toLowerCase())
        );
      },

      getTotalCount: () => get().supplies.length,
    }),
    {
      name: "supplies-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        supplies: state.supplies,
        lastSyncDate: state.lastSyncDate,
      }),
    }
  )
);

export default useSuppliesStore;
