import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";

/**
 * Hook to safely handle authentication state for sign-in flows
 * Returns a stable authentication state that accounts for processing delays
 */
export const useAuthState = () => {
  const {
    isAuthenticated,
    loading,
    authInitialized,
    processingAuthChange,
    user,
    userProfile,
  } = useAuthStore();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Consider auth ready when:
    // 1. Firebase auth is initialized
    // 2. Not currently loading
    // 3. Not processing auth changes
    const ready = authInitialized && !loading && !processingAuthChange;
    setIsReady(ready);
  }, [authInitialized, loading, processingAuthChange]);

  return {
    isAuthenticated,
    isReady,
    loading: loading || processingAuthChange,
    user,
    userProfile,
    // Helper to check if user is fully authenticated and ready
    isFullyAuthenticated: isReady && isAuthenticated && !!userProfile,
  };
};

/**
 * Hook for sign-in forms that need to wait for complete authentication
 */
export const useSignInFlow = () => {
  const authState = useAuthState();
  const { signinUser } = useAuthStore();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async (
    data: { email: string; password: string },
    onSuccess?: () => void
  ) => {
    setIsSigningIn(true);

    try {
      await new Promise<void>((resolve, reject) => {
        signinUser(data, () => {
          resolve();
        });

        // Add timeout to prevent hanging
        setTimeout(() => {
          reject(new Error("Sign in timeout"));
        }, 10000);
      });

      // Wait for auth to be fully ready
      const waitForAuth = () => {
        return new Promise<void>((resolve) => {
          const checkAuth = () => {
            if (authState.isFullyAuthenticated) {
              resolve();
            } else {
              setTimeout(checkAuth, 100);
            }
          };
          checkAuth();
        });
      };

      await waitForAuth();
      onSuccess?.();
    } catch (error) {
      console.error("Sign in flow error:", error);
    } finally {
      setIsSigningIn(false);
    }
  };

  return {
    ...authState,
    isSigningIn,
    handleSignIn,
  };
};
