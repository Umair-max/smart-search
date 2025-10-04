import ConfigService from "@/config/appConfig";
import { db } from "@/config/firebase";
import { safeFirestoreOperation } from "@/utils/networkUtils";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import FirebaseStorageService from "./firebaseStorageService";

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  profileImageUrl?: string;
  role: "admin" | "staff";
  permissions: {
    canEdit: boolean;
    canUpload: boolean;
    canDelete: boolean;
  };
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  suppliesLastFetched?: string; // New field for tracking when user last fetched supplies
}

class UserManagementService {
  private static readonly COLLECTION_NAME = "users";

  /**
   * Get the configured admin email from environment
   */
  static getAdminEmail(): string {
    return ConfigService.getAdminEmail();
  }

  /**
   * Check if an email is the admin email
   */
  static isAdminEmail(email: string): boolean {
    return ConfigService.isAdminEmail(email);
  }

  /**
   * Create or update user profile on login
   */
  static async createOrUpdateUser(
    uid: string,
    email: string,
    displayName?: string
  ): Promise<UserProfile> {
    return safeFirestoreOperation(
      async () => {
        const userRef = doc(db, this.COLLECTION_NAME, uid);
        const userSnap = await getDoc(userRef);

        const now = new Date().toISOString();
        const isAdmin = this.isAdminEmail(email);

        if (userSnap.exists()) {
          // Update existing user
          const userData = userSnap.data() as UserProfile;

          const updatedUser: Partial<UserProfile> = {
            lastLoginAt: now,
            updatedAt: now,
          };

          // Update display name if provided
          if (displayName && displayName !== userData.displayName) {
            updatedUser.displayName = displayName;
          }

          await updateDoc(userRef, updatedUser);

          return {
            ...userData,
            ...updatedUser,
          } as UserProfile;
        } else {
          // Create new user
          const newUser: UserProfile = {
            uid,
            email,
            displayName: displayName || email.split("@")[0],
            role: isAdmin ? "admin" : "staff",
            permissions: {
              canEdit: isAdmin, // Admin gets edit permission by default
              canUpload: isAdmin, // Admin gets upload permission by default
              canDelete: isAdmin, // Admin gets delete permission by default
            },
            isBlocked: false,
            createdAt: now,
            updatedAt: now,
            lastLoginAt: now,
          };

          await setDoc(userRef, newUser);
          return newUser;
        }
      },
      () => {
        // Offline fallback - create a basic user profile from provided data
        console.log(
          "createOrUpdateUser: Offline mode - creating basic profile"
        );
        const isAdmin = this.isAdminEmail(email);

        return {
          uid,
          email,
          displayName: displayName || email.split("@")[0],
          role: isAdmin ? "admin" : "staff",
          permissions: {
            canEdit: isAdmin,
            canUpload: isAdmin,
            canDelete: isAdmin,
          },
          isBlocked: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        } as UserProfile;
      },
      "Create or update user profile"
    );
  }

  /**
   * Get user profile by UID
   */
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    return safeFirestoreOperation(
      async () => {
        const userRef = doc(db, this.COLLECTION_NAME, uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data() as any;

          // Ensure permissions object has all required fields
          const permissions = {
            canEdit: userData.permissions?.canEdit ?? false,
            canUpload: userData.permissions?.canUpload ?? false,
            canDelete:
              userData.permissions?.canDelete ?? userData.role === "admin",
          };

          return {
            uid: userData.uid,
            email: userData.email,
            displayName: userData.displayName,
            profileImageUrl: userData.profileImageUrl,
            role: userData.role,
            permissions,
            isBlocked: userData.isBlocked ?? false,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
            lastLoginAt: userData.lastLoginAt,
            suppliesLastFetched: userData.suppliesLastFetched,
          } as UserProfile;
        }

        return null;
      },
      () => {
        // Offline fallback - return null, let auth store handle it
        console.log("getUserProfile: Offline mode - returning null");
        return null;
      },
      "Get user profile"
    );
  }

  /**
   * Get all users (admin only)
   */
  static async getAllUsers(): Promise<UserProfile[]> {
    try {
      const usersRef = collection(db, this.COLLECTION_NAME);
      const q = query(usersRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const users: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as any; // Use any to handle migration

        // Ensure permissions object has all required fields (migration for existing users)
        const permissions = {
          canEdit: userData.permissions?.canEdit ?? false,
          canUpload: userData.permissions?.canUpload ?? false,
          canDelete:
            userData.permissions?.canDelete ?? userData.role === "admin", // Default to true for admins
        };

        const user: UserProfile = {
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName,
          profileImageUrl: userData.profileImageUrl,
          role: userData.role,
          permissions,
          isBlocked: userData.isBlocked ?? false,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
          lastLoginAt: userData.lastLoginAt,
        };
        users.push(user);
      });

      return users;
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw new Error("Failed to fetch users");
    }
  }

  /**
   * Update user permissions (admin only)
   */
  static async updateUserPermissions(
    uid: string,
    permissions: { canEdit: boolean; canUpload: boolean; canDelete: boolean }
  ): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, uid);
      await updateDoc(userRef, {
        permissions,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating user permissions:", error);
      throw new Error("Failed to update user permissions");
    }
  }

  /**
   * Block/unblock user (admin only)
   */
  static async updateUserBlockStatus(
    uid: string,
    isBlocked: boolean
  ): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, uid);
      await updateDoc(userRef, {
        isBlocked,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating user block status:", error);
      throw new Error("Failed to update user block status");
    }
  }

  /**
   * Update user profile picture
   */
  static async updateProfileImage(
    uid: string,
    imageUri: string
  ): Promise<void> {
    try {
      console.log(`Starting profile image update for user ${uid}`);
      console.log(`Image URI: ${imageUri}`);

      // First, get the current user profile to check for existing image
      const userRef = doc(db, this.COLLECTION_NAME, uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("User profile not found");
      }

      const currentUserData = userSnap.data() as UserProfile;
      console.log(`Current user profile:`, {
        hasProfileImage: !!currentUserData.profileImageUrl,
        profileImageUrl: currentUserData.profileImageUrl,
      });

      // Upload new image to Firebase Storage
      console.log(`Uploading new image to Firebase Storage...`);
      const downloadURL = await FirebaseStorageService.uploadProfileImage(
        uid,
        imageUri
      );
      console.log(`New image uploaded, download URL: ${downloadURL}`);

      // Delete old image from storage if it exists
      if (currentUserData.profileImageUrl) {
        console.log(
          `Attempting to delete old image: ${currentUserData.profileImageUrl}`
        );
        try {
          await FirebaseStorageService.deleteProfileImage(
            currentUserData.profileImageUrl
          );
          console.log("Old profile image deleted from storage");
        } catch (deleteError) {
          console.warn("Failed to delete old profile image:", deleteError);
          // Don't fail the update if old image deletion fails
        }
      } else {
        console.log("No old image to delete");
      }

      // Update Firestore with the new download URL
      console.log(`Updating Firestore with new image URL...`);
      await updateDoc(userRef, {
        profileImageUrl: downloadURL,
        updatedAt: new Date().toISOString(),
      });

      console.log(`Profile image updated successfully for user ${uid}`);
    } catch (error) {
      console.error("Error updating profile image:", error);
      throw new Error("Failed to update profile image");
    }
  }

  /**
   * Update user display name
   */
  static async updateDisplayName(
    uid: string,
    displayName: string
  ): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, uid);
      await updateDoc(userRef, {
        displayName,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating display name:", error);
      throw new Error("Failed to update display name");
    }
  }

  /**
   * Check if user is admin
   */
  static isAdmin(userProfile: UserProfile): boolean {
    return userProfile.role === "admin";
  }

  /**
   * Check if user has edit permissions
   */
  static canEdit(userProfile: UserProfile): boolean {
    return !userProfile.isBlocked && userProfile.permissions.canEdit;
  }

  /**
   * Check if user has upload permissions
   */
  static canUpload(userProfile: UserProfile): boolean {
    return !userProfile.isBlocked && userProfile.permissions.canUpload;
  }

  /**
   * Check if user has delete permissions
   */
  static canDelete(userProfile: UserProfile): boolean {
    return !userProfile.isBlocked && userProfile.permissions.canDelete;
  }

  /**
   * Check if user is blocked
   */
  static isBlocked(userProfile: UserProfile): boolean {
    return userProfile.isBlocked;
  }

  /**
   * Update user's supplies last fetched timestamp
   */
  static async updateSuppliesLastFetched(uid: string): Promise<void> {
    return safeFirestoreOperation(
      async () => {
        const userRef = doc(db, this.COLLECTION_NAME, uid);
        await updateDoc(userRef, {
          suppliesLastFetched: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      },
      () => {
        // Offline fallback - do nothing, will sync when online
        console.log(
          "updateSuppliesLastFetched: Offline mode - skipping update"
        );
      },
      "Update supplies last fetched timestamp"
    );
  }

  /**
   * Get user's supplies last fetched timestamp
   */
  static async getSuppliesLastFetched(uid: string): Promise<Date | null> {
    return safeFirestoreOperation(
      async () => {
        const userProfile = await this.getUserProfile(uid);
        if (userProfile?.suppliesLastFetched) {
          return new Date(userProfile.suppliesLastFetched);
        }
        return null;
      },
      () => {
        // Offline fallback - return null to indicate no timestamp
        console.log("getSuppliesLastFetched: Offline mode - returning null");
        return null;
      },
      "Get supplies last fetched timestamp"
    );
  }
}

export default UserManagementService;
