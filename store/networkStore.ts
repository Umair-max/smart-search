import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { create } from "zustand";

interface NetworkStore {
  // State
  isOnline: boolean;
  showAlert: boolean;

  // Actions
  setShowAlert: (show: boolean) => void;
  setInternetOnline: (online: boolean) => void;
  showOnlineAlert: () => void;
  initializeNetworkListener: () => () => void; // Returns cleanup function
}

const useNetworkStore = create<NetworkStore>((set, get) => {
  let timeoutRef: ReturnType<typeof setTimeout> | undefined = undefined;

  const onlineHandler = () => {
    const currentState = get();

    console.log("Network: Going online - showing alert");
    clearTimeout(timeoutRef);

    set({ isOnline: true, showAlert: true });

    timeoutRef = setTimeout(() => {
      console.log("Network: Hiding online alert");
      set({ showAlert: false });
    }, 3000); // Show for 3 seconds
  };

  const offlineHandler = () => {
    console.log("Network: Going offline - showing alert");
    clearTimeout(timeoutRef);
    set({ isOnline: false, showAlert: true });
  };

  const handleConnectionChange = (state: NetInfoState) => {
    console.log("Network state changed:", {
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
    });

    const reachable = state.isInternetReachable;
    const connected = state.isConnected;

    let isOnline = false;
    if (reachable === null || reachable === undefined) {
      isOnline = !!connected;
    } else {
      isOnline = !!connected && reachable;
    }

    console.log("Determined online status:", isOnline);

    if (isOnline) {
      onlineHandler();
    } else {
      offlineHandler();
    }
  };

  return {
    // Initial state - start offline until we determine actual status
    isOnline: false,
    showAlert: false,

    // Actions
    setShowAlert: (show) => set({ showAlert: show }),

    setInternetOnline: (online) =>
      set({
        isOnline: online,
        showAlert: true,
      }),

    showOnlineAlert: () => {
      const currentState = get();
      if (currentState.isOnline) {
        console.log("Network: Manually showing online alert");
        clearTimeout(timeoutRef);
        set({ showAlert: true });
        timeoutRef = setTimeout(() => {
          console.log("Network: Hiding online alert");
          set({ showAlert: false });
        }, 3000); // Show for 3 seconds
      }
    },

    initializeNetworkListener: () => {
      console.log("Network: Initializing network listener");

      const unsubscribe = NetInfo.addEventListener(handleConnectionChange);

      // Fetch initial state
      NetInfo.fetch().then((state) => {
        console.log("Network: Initial fetch complete");
        handleConnectionChange(state);
      });

      // Return cleanup function
      return () => {
        console.log("Network: Cleaning up network listener");
        clearTimeout(timeoutRef);
        unsubscribe();
      };
    },
  };
});

export default useNetworkStore;
