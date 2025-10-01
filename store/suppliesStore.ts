import { MedicalSupply } from "@/components/SupplyCard";
import SuppliesFirestoreService from "@/services/suppliesFirestoreService";
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
        set((state) => ({
          supplies: state.supplies.filter(
            (supply) => supply.ProductCode !== productCode
          ),
          lastSyncDate: new Date().toISOString(),
        }));
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
            supply.ProductDescription.toLowerCase().includes(searchTerm) ||
            supply.Category.toLowerCase().includes(searchTerm) ||
            supply.StoreName.toLowerCase().includes(searchTerm)
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
