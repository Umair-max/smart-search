import { create } from "zustand";
import useToastStore from "./toastStore";

export interface ErrorResponse {
  detail?: string;
  errors?: string[];
}

interface Props {
  showError: (error: ErrorResponse | unknown, name: string) => void;
}

const useErrorStore = create<Props>((set, get) => ({
  showError: (error, name) => {
    const showToast = useToastStore.getState().showToast;
    console.log(`${name} Error:`, error);

    let errorMessage = "An unexpected error occurred";

    // Handle different error types
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (error && typeof error === "object") {
      const errorObj = error as ErrorResponse;
      if (errorObj.detail) {
        errorMessage = errorObj.detail;
      } else if (errorObj.errors && errorObj.errors.length > 0) {
        errorMessage = errorObj.errors[0];
      } else if (
        "message" in errorObj &&
        typeof errorObj.message === "string"
      ) {
        errorMessage = errorObj.message;
      }
    }

    // Clean up Firebase error messages
    if (errorMessage.includes("Firebase:")) {
      errorMessage = errorMessage
        .replace("Firebase: ", "")
        .replace(/\(auth\/.*?\)\./g, "");
    }

    showToast(errorMessage, "error");
  },
}));

export default useErrorStore;
