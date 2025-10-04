import useNetworkStore from "@/store/networkStore";
import React, { createContext, useEffect } from "react";

export const AppLayerContext = createContext({});

interface IProps {
  children: React.ReactNode;
}

export default function AppLayerProvider({ children }: IProps) {
  const { initializeNetworkListener } = useNetworkStore();

  useEffect(() => {
    const cleanup = initializeNetworkListener();
    return cleanup;
  }, [initializeNetworkListener]);

  return (
    <AppLayerContext.Provider value={{}}>{children}</AppLayerContext.Provider>
  );
}
