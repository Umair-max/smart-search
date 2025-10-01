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
import UserManagementService, {
  UserProfile,
} from "../services/userManagementService";
import { SigninTypes, SignupTypes } from "../types/registerTypes";
import useErrorStore from "./errorStore";
import useToastStore from "./toastStore";

type AuthState = {
  loading: boolean;
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  authInitialized: boolean;
  authUnsubscribe: (() => void) | null;
  OTPCode: string;
  currentEmail: string | null;
  processingAuthChange: boolean;
  authStateChangeTimeout: number | null;

  // Auth methods
  signinUser: (value: SigninTypes, onSuccess?: () => void) => void;
  signupUser: (value: SignupTypes, onSuccess?: () => void) => void;
  logoutUser: () => void;
  cleanupAuth: () => void;
  forgotPassword: (value: { email: string }, onSuccess?: () => void) => void;
  setCurrentEmail: (email: string) => void;
  setOTPCode: (code: string) => void;
  initializeAuth: () => void;

  // User profile methods
  loadUserProfile: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;

  // Permission helpers
  isAdmin: () => boolean;
  canEdit: () => boolean;
  canUpload: () => boolean;
  isBlocked: () => boolean;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  loading: true, // Start with loading true to wait for Firebase
  user: null,
  userProfile: null,
  isAuthenticated: false,
  authInitialized: false,
  authUnsubscribe: null,
  OTPCode: "",
  currentEmail: null,
  processingAuthChange: false,
  authStateChangeTimeout: null,

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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const currentState = get();

      console.log(
        "Firebase auth state changed:",
        user ? `User logged in: ${user.email}` : "User logged out"
      );

      // Clear any existing timeout
      if (currentState.authStateChangeTimeout) {
        clearTimeout(currentState.authStateChangeTimeout);
      }

      // Set processing flag
      set({ processingAuthChange: true });

      // Debounce auth state changes to prevent rapid updates
      const timeout = setTimeout(async () => {
        try {
          if (user) {
            // Load or create user profile
            try {
              console.log("Processing auth state: Loading user profile...");
              const userProfile =
                await UserManagementService.createOrUpdateUser(
                  user.uid,
                  user.email!,
                  user.displayName || undefined
                );

              // Check if user is blocked
              if (userProfile.isBlocked) {
                console.log("User is blocked, signing out...");
                await signOut(auth);
                useToastStore
                  .getState()
                  .showToast("Your account has been blocked", "error");
                return;
              }

              console.log(
                "Auth state processed: User authenticated with profile"
              );
              set({
                user,
                userProfile,
                isAuthenticated: true,
                loading: false,
                authInitialized: true,
                processingAuthChange: false,
                authStateChangeTimeout: null,
              });
            } catch (error) {
              console.error("Error loading user profile:", error);
              set({
                user,
                userProfile: null,
                isAuthenticated: true,
                loading: false,
                authInitialized: true,
                processingAuthChange: false,
                authStateChangeTimeout: null,
              });
            }
          } else {
            console.log("Auth state processed: User logged out");
            set({
              user: null,
              userProfile: null,
              isAuthenticated: false,
              loading: false,
              authInitialized: true,
              processingAuthChange: false,
              authStateChangeTimeout: null,
            });
          }
        } catch (error) {
          console.error("Error processing auth state change:", error);
          set({
            loading: false,
            authInitialized: true,
            processingAuthChange: false,
            authStateChangeTimeout: null,
          });
        }
      }, 500); // 500ms debounce

      set({ authStateChangeTimeout: timeout });
    });

    // Store the unsubscribe function
    set({ authUnsubscribe: unsubscribe });
  },

  signinUser: async (data, onSuccess) => {
    const showToast = useToastStore.getState().showToast;
    const showError = useErrorStore.getState().showError;

    try {
      set({ loading: true });

      console.log("Starting sign in process...");
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      console.log("Sign in successful, waiting for auth state change...");

      // Wait for auth state to be processed before calling onSuccess
      const waitForAuth = () => {
        const checkAuth = () => {
          const currentState = get();
          if (
            currentState.authInitialized &&
            !currentState.processingAuthChange &&
            currentState.isAuthenticated
          ) {
            console.log("Auth state fully processed, calling onSuccess");
            showToast("Signed in successfully!", "success");
            onSuccess?.();
          } else if (
            currentState.authInitialized &&
            !currentState.processingAuthChange &&
            !currentState.isAuthenticated
          ) {
            // Auth failed for some reason
            console.log("Auth failed after sign in");
            set({ loading: false });
          } else {
            // Still processing, wait a bit more
            setTimeout(checkAuth, 100);
          }
        };
        checkAuth();
      };

      waitForAuth();
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
      const currentState = get();

      // Clear any pending timeout
      if (currentState.authStateChangeTimeout) {
        clearTimeout(currentState.authStateChangeTimeout);
      }

      await signOut(auth);
      set({
        user: null,
        userProfile: null,
        isAuthenticated: false,
        currentEmail: null,
        OTPCode: "",
        processingAuthChange: false,
        authStateChangeTimeout: null,
      });
      showToast("You've been logged out!", "success");
    } catch (error) {
      showError(error as Error, "Sign Out");
    }
  },

  cleanupAuth: () => {
    const currentState = get();

    // Clear timeout if exists
    if (currentState.authStateChangeTimeout) {
      clearTimeout(currentState.authStateChangeTimeout);
    }

    // Unsubscribe from auth listener
    if (currentState.authUnsubscribe) {
      currentState.authUnsubscribe();
    }

    // Reset state
    set({
      authUnsubscribe: null,
      authStateChangeTimeout: null,
      processingAuthChange: false,
    });
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

  // User profile methods
  loadUserProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const userProfile = await UserManagementService.getUserProfile(user.uid);
      set({ userProfile });
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  },

  updateUserProfile: async (updates) => {
    const { user, userProfile } = get();
    if (!user || !userProfile) return;

    try {
      // Update specific fields in Firestore
      if (updates.displayName) {
        await UserManagementService.updateDisplayName(
          user.uid,
          updates.displayName
        );
      }
      if (updates.profileImageUrl) {
        await UserManagementService.updateProfileImage(
          user.uid,
          updates.profileImageUrl
        );
      }

      // Update local state
      set({
        userProfile: {
          ...userProfile,
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  // Permission helpers
  isAdmin: () => {
    const { userProfile } = get();
    return userProfile ? UserManagementService.isAdmin(userProfile) : false;
  },

  canEdit: () => {
    const { userProfile } = get();
    return userProfile ? UserManagementService.canEdit(userProfile) : false;
  },

  canUpload: () => {
    const { userProfile } = get();
    return userProfile ? UserManagementService.canUpload(userProfile) : false;
  },

  isBlocked: () => {
    const { userProfile } = get();
    return userProfile ? UserManagementService.isBlocked(userProfile) : false;
  },
}));
