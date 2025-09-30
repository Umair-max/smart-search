import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

/**
 * Hook to ensure Firebase auth state is properly initialized
 * This should be used in the root of your app
 */
export const useFirebaseAuth = () => {
  const { initializeAuth, authInitialized, loading } = useAuthStore();

  useEffect(() => {
    console.log("Initializing Firebase auth...");
    initializeAuth();
  }, []);

  return {
    authInitialized,
    loading,
  };
};

export default useFirebaseAuth;
