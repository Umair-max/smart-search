import UserManagementService, {
  UserProfile,
} from "@/services/userManagementService";
import { create } from "zustand";
import useToastStore from "./toastStore";

interface UserManagementState {
  users: UserProfile[];
  loading: boolean;
  lastUpdated: string | null;

  // Actions
  loadUsers: () => Promise<void>;
  updateUserPermissions: (
    uid: string,
    permissions: { canEdit: boolean; canUpload: boolean }
  ) => Promise<void>;
  updateUserBlockStatus: (uid: string, isBlocked: boolean) => Promise<void>;
  refreshUsers: () => Promise<void>;

  // Selectors
  getUserByUid: (uid: string) => UserProfile | undefined;
  getNonAdminUsers: (excludeUid?: string) => UserProfile[];
  searchUsers: (query: string, excludeUid?: string) => UserProfile[];
}

export const useUserManagementStore = create<UserManagementState>(
  (set, get) => ({
    users: [],
    loading: false,
    lastUpdated: null,

    loadUsers: async () => {
      const currentState = get();

      // Avoid duplicate loading if already in progress
      if (currentState.loading) {
        return;
      }

      try {
        set({ loading: true });
        const allUsers = await UserManagementService.getAllUsers();
        set({
          users: allUsers,
          loading: false,
          lastUpdated: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error loading users:", error);
        set({ loading: false });
        useToastStore.getState().showToast("Failed to load users", "error");
        throw error;
      }
    },

    updateUserPermissions: async (
      uid: string,
      permissions: { canEdit: boolean; canUpload: boolean }
    ) => {
      try {
        // Update in Firestore
        await UserManagementService.updateUserPermissions(uid, permissions);

        // Update local state immediately for responsive UI
        const currentUsers = get().users;
        const updatedUsers = currentUsers.map((user) =>
          user.uid === uid
            ? {
                ...user,
                permissions,
                updatedAt: new Date().toISOString(),
              }
            : user
        );

        set({
          users: updatedUsers,
          lastUpdated: new Date().toISOString(),
        });

        useToastStore
          .getState()
          .showToast("Permissions updated successfully", "success");
      } catch (error) {
        console.error("Error updating permissions:", error);
        useToastStore
          .getState()
          .showToast("Failed to update permissions", "error");
        throw error;
      }
    },

    updateUserBlockStatus: async (uid: string, isBlocked: boolean) => {
      try {
        // Update in Firestore
        await UserManagementService.updateUserBlockStatus(uid, isBlocked);

        // Update local state immediately for responsive UI
        const currentUsers = get().users;
        const updatedUsers = currentUsers.map((user) =>
          user.uid === uid
            ? {
                ...user,
                isBlocked,
                updatedAt: new Date().toISOString(),
              }
            : user
        );

        set({
          users: updatedUsers,
          lastUpdated: new Date().toISOString(),
        });

        useToastStore
          .getState()
          .showToast(
            `User ${isBlocked ? "blocked" : "unblocked"} successfully`,
            "success"
          );
      } catch (error) {
        console.error("Error updating block status:", error);
        useToastStore
          .getState()
          .showToast("Failed to update user status", "error");
        throw error;
      }
    },

    refreshUsers: async () => {
      // Force refresh even if loading
      set({ loading: true });
      try {
        const allUsers = await UserManagementService.getAllUsers();
        set({
          users: allUsers,
          loading: false,
          lastUpdated: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error refreshing users:", error);
        set({ loading: false });
        useToastStore.getState().showToast("Failed to refresh users", "error");
        throw error;
      }
    },

    // Selectors
    getUserByUid: (uid: string) => {
      const { users } = get();
      return users.find((user) => user.uid === uid);
    },

    getNonAdminUsers: (excludeUid?: string) => {
      const { users } = get();
      return users.filter((user) => {
        if (excludeUid && user.uid === excludeUid) return false;
        return user.role !== "admin";
      });
    },

    searchUsers: (query: string, excludeUid?: string) => {
      const { users } = get();

      let filteredUsers = users;

      // Exclude specific user if provided
      if (excludeUid) {
        filteredUsers = filteredUsers.filter((user) => user.uid !== excludeUid);
      }

      // Apply search filter
      if (query.trim() === "") {
        return filteredUsers;
      }

      const searchTerm = query.toLowerCase();
      return filteredUsers.filter((user) => {
        const displayName = user.displayName || "";
        const email = user.email || "";

        return (
          displayName.toLowerCase().includes(searchTerm) ||
          email.toLowerCase().includes(searchTerm)
        );
      });
    },
  })
);
