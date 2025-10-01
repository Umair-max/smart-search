import { create } from "zustand";

interface SplashStore {
  isSplashShown: boolean;
  setIsSplashShown: (visible: boolean) => void;
}

const useSplashStore = create<SplashStore>((set) => ({
  isSplashShown: false,

  setIsSplashShown: (visible: boolean) => {
    set({ isSplashShown: visible });
  },
}));

export default useSplashStore;
