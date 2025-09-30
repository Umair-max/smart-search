import {
  AuthError,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { create } from "zustand";
import { auth } from "../config/firebase";
import { SigninTypes, SignupTypes } from "../types/registerTypes";
import useErrorStore from "./errorStore";
import useToastStore from "./toastStore";

type AuthState = {
  loading: boolean;
  user: User | null;
  isAuthenticated: boolean;
  authInitialized: boolean;
  authUnsubscribe: (() => void) | null;
  OTPCode: string;
  currentEmail: string | null;
  signinUser: (value: SigninTypes, onSuccess?: () => void) => void;
  signupUser: (value: SignupTypes, onSuccess?: () => void) => void;
  logoutUser: () => void;
  forgotPassword: (value: { email: string }, onSuccess?: () => void) => void;
  setCurrentEmail: (email: string) => void;
  setOTPCode: (code: string) => void;
  initializeAuth: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  loading: true, // Start with loading true to wait for Firebase
  user: null,
  isAuthenticated: false,
  authInitialized: false,
  authUnsubscribe: null,
  OTPCode: "",
  currentEmail: null,

  initializeAuth: () => {
    // Prevent multiple initializations
    const currentState = get();
    if (currentState.authInitialized && currentState.authUnsubscribe) {
      console.log("Auth already initialized, skipping...");
      return;
    }

    // Clean up existing listener if any
    if (currentState.authUnsubscribe) {
      currentState.authUnsubscribe();
    }

    console.log("Setting up Firebase auth state listener...");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log(
        "Firebase auth state changed:",
        user ? `User logged in: ${user.email}` : "User logged out"
      );
      set({
        user,
        isAuthenticated: !!user,
        loading: false,
        authInitialized: true,
      });
    });

    // Store the unsubscribe function
    set({ authUnsubscribe: unsubscribe });
  },

  signinUser: async (data, onSuccess) => {
    const showToast = useToastStore.getState().showToast;
    const showError = useErrorStore.getState().showError;

    try {
      set({ loading: true });

      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Don't set state here - let onAuthStateChanged handle it
      console.log("Sign in successful, waiting for auth state change...");

      showToast("Signed in successfully!", "success");
      onSuccess?.();
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "Sign in failed";

      switch (authError.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        case "auth/user-disabled":
          errorMessage = "Account has been disabled";
          break;
        case "auth/invalid-credential":
          errorMessage = "Invalid email or password";
          break;
        default:
          errorMessage = authError.message || "Sign in failed";
      }

      showError(new Error(errorMessage), "Sign In");
    } finally {
      set({ loading: false });
    }
  },

  signupUser: async (data, onSuccess) => {
    const showToast = useToastStore.getState().showToast;
    const showError = useErrorStore.getState().showError;

    try {
      set({ loading: true });

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Don't set state here - let onAuthStateChanged handle it
      console.log("Sign up successful, waiting for auth state change...");

      showToast("Account created successfully!", "success");
      onSuccess?.();
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "Sign up failed";

      switch (authError.code) {
        case "auth/email-already-in-use":
          errorMessage = "An account with this email already exists";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Email/password accounts are not enabled";
          break;
        case "auth/weak-password":
          errorMessage = "Password is too weak";
          break;
        default:
          errorMessage = authError.message || "Sign up failed";
      }

      showError(new Error(errorMessage), "Sign Up");
    } finally {
      set({ loading: false });
    }
  },

  logoutUser: async () => {
    const showToast = useToastStore.getState().showToast;
    const showError = useErrorStore.getState().showError;

    try {
      await signOut(auth);
      set({
        user: null,
        isAuthenticated: false,
        currentEmail: null,
        OTPCode: "",
      });
      showToast("You've been logged out!", "success");
    } catch (error) {
      showError(error as Error, "Sign Out");
    }
  },

  forgotPassword: async (data, onSuccess) => {
    const showToast = useToastStore.getState().showToast;
    const showError = useErrorStore.getState().showError;

    try {
      set({ loading: true });

      await sendPasswordResetEmail(auth, data.email);

      showToast("Password reset email sent!", "success");
      onSuccess?.();
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "Failed to send reset email";

      switch (authError.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        default:
          errorMessage = authError.message || "Failed to send reset email";
      }

      showError(new Error(errorMessage), "Forgot Password");
    } finally {
      set({ loading: false });
    }
  },

  setCurrentEmail: (email) => {
    set({ currentEmail: email });
  },

  setOTPCode: (code) => {
    set({ OTPCode: code });
  },
}));
