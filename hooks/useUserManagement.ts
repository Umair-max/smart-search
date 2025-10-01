import { useAuthStore } from "@/store/authStore";
import { useUserManagementStore } from "@/store/userManagementStore";
import { useEffect } from "react";

/**
 * Hook to ensure user management data is loaded and fresh
 * Use this in any component that needs access to user management data
 */
export const useUserManagement = () => {
  const { isAdmin } = useAuthStore();
  const { users, loading, lastUpdated, loadUsers, refreshUsers, ...store } =
    useUserManagementStore();

  useEffect(() => {
    // Only load users if user is admin and data hasn't been loaded
    if (isAdmin() && users.length === 0 && !loading) {
      loadUsers();
    }
  }, [isAdmin(), users.length, loading]);

  // Auto-refresh data if it's older than 5 minutes
  useEffect(() => {
    if (!isAdmin() || !lastUpdated) return;

    const lastUpdateTime = new Date(lastUpdated).getTime();
    const now = new Date().getTime();
    const fiveMinutes = 5 * 60 * 1000;

    if (now - lastUpdateTime > fiveMinutes) {
      refreshUsers();
    }
  }, [isAdmin(), lastUpdated]);

  return {
    users,
    loading,
    lastUpdated,
    loadUsers,
    refreshUsers,
    ...store,
  };
};

/**
 * Hook for real-time user data with automatic refresh
 * Useful for admin screens that need the most up-to-date user information
 */
export const useRealtimeUserManagement = (autoRefreshInterval = 30000) => {
  const userManagement = useUserManagement();
  const { isAdmin } = useAuthStore();

  useEffect(() => {
    if (!isAdmin()) return;

    const interval = setInterval(() => {
      userManagement.refreshUsers();
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [isAdmin(), autoRefreshInterval]);

  return userManagement;
};
