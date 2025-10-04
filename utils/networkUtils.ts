import { FirebaseError } from "firebase/app";

/**
 * Check if an error is related to network/offline issues
 */
export const isOfflineError = (error: any): boolean => {
  if (error instanceof FirebaseError) {
    return (
      error.code === "unavailable" ||
      error.code === "deadline-exceeded" ||
      error.code === "failed-precondition" ||
      error.message.includes("offline") ||
      error.message.includes("network") ||
      error.message.includes("internet connection")
    );
  }

  if (error instanceof Error) {
    return (
      error.message.includes("offline") ||
      error.message.includes("network") ||
      error.message.includes("internet connection") ||
      error.message.includes(
        "Failed to get document because the client is offline"
      )
    );
  }

  return false;
};

/**
 * Check if the app should operate in offline mode
 */
export const shouldUseOfflineMode = (error?: any): boolean => {
  return error ? isOfflineError(error) : false;
};

/**
 * Create a safe wrapper for Firestore operations that handle offline gracefully
 */
export const safeFirestoreOperation = async <T>(
  operation: () => Promise<T>,
  offlineFallback: () => T | Promise<T>,
  operationName: string = "Firestore operation"
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (isOfflineError(error)) {
      console.log(
        `${operationName}: Operating in offline mode, using fallback`
      );
      return await offlineFallback();
    }
    throw error;
  }
};
