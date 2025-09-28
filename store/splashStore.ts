import { create } from "zustand";

interface SplashStore {
  isSplashShown: boolean;
  fadeOutComplete: boolean;
  setIsSplashShown: (visible: boolean) => void;
  setFadeOutComplete: (complete: boolean) => void;
}

const useSplashStore = create<SplashStore>((set) => ({
  isSplashShown: false,
  fadeOutComplete: false,

  setIsSplashShown: (visible: boolean) => {
    set({ isSplashShown: visible });
  },

  setFadeOutComplete: (complete: boolean) => {
    set({ fadeOutComplete: complete });
  },
}));

export default useSplashStore;
