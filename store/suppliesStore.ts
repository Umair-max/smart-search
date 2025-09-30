import { MedicalSupply } from "@/components/MedicalSupplyItem";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ImportedSupply extends MedicalSupply {
  id: string;
  importDate: string;
  isImported: boolean;
}

interface SuppliesStore {
  // State
  importedSupplies: ImportedSupply[];
  isLoading: boolean;
  lastImportDate: string | null;

  // Actions
  addSupplies: (
    supplies: Omit<ImportedSupply, "id" | "importDate" | "isImported">[]
  ) => void;
  removeSupply: (id: string) => void;
  clearAllSupplies: () => void;
  updateSupply: (id: string, updates: Partial<ImportedSupply>) => void;
  setLoading: (loading: boolean) => void;

  // Getters
  getTotalCount: () => number;
  getSuppliesByCategory: (category: string) => ImportedSupply[];
  searchSupplies: (query: string) => ImportedSupply[];
}

const useSuppliesStore = create<SuppliesStore>()(
  persist(
    (set, get) => ({
      // Initial state
      importedSupplies: [],
      isLoading: false,
      lastImportDate: null,

      // Actions
      addSupplies: (supplies) => {
        const now = new Date().toISOString();
        const suppliesWithMeta = supplies.map((supply, index) => ({
          ...supply,
          id: `imported_${Date.now()}_${index}`,
          importDate: now,
          isImported: true,
        }));

        set((state) => ({
          importedSupplies: [...state.importedSupplies, ...suppliesWithMeta],
          lastImportDate: now,
        }));
      },

      removeSupply: (id) => {
        set((state) => ({
          importedSupplies: state.importedSupplies.filter(
            (supply) => supply.id !== id
          ),
        }));
      },

      clearAllSupplies: () => {
        set({
          importedSupplies: [],
          lastImportDate: null,
        });
      },

      updateSupply: (id, updates) => {
        set((state) => ({
          importedSupplies: state.importedSupplies.map((supply) =>
            supply.id === id ? { ...supply, ...updates } : supply
          ),
        }));
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      // Getters
      getTotalCount: () => get().importedSupplies.length,

      getSuppliesByCategory: (category) =>
        get().importedSupplies.filter((supply) =>
          supply.Category.toLowerCase().includes(category.toLowerCase())
        ),

      searchSupplies: (query) => {
        const supplies = get().importedSupplies;
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
    }),
    {
      name: "supplies-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        importedSupplies: state.importedSupplies,
        lastImportDate: state.lastImportDate,
      }),
    }
  )
);

export default useSuppliesStore;
