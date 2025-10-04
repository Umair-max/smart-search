import Typo from "@/components/Typo";
import colors from "@/config/colors";
import { spacingY } from "@/config/spacing";
import { useAuthStore } from "@/store/authStore";
import useSuppliesStore from "@/store/suppliesStore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

interface DataLoaderProps {
  children: React.ReactNode;
}

const DataLoader: React.FC<DataLoaderProps> = ({ children }) => {
  const { user } = useAuthStore();
  const { smartFetchSupplies, isLoading, isOnline } = useSuppliesStore();
  const [initialLoadCompleted, setInitialLoadCompleted] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      if (!user?.uid) {
        setInitialLoadCompleted(true);
        return;
      }

      try {
        console.log("DataLoader: Using smart fetch for data optimization...");
        await smartFetchSupplies(user.uid);
        console.log("DataLoader: Smart fetch completed");
      } catch (error) {
        console.error("DataLoader: Failed to fetch initial data:", error);
        // Don't set error state for offline mode - just complete the load
        // The app will use cached data
      } finally {
        // Always mark as completed, even on error, so offline users can proceed
        setInitialLoadCompleted(true);
      }
    };

    loadInitialData();
  }, [user?.uid, smartFetchSupplies]);

  // Show loading screen only during initial load AND when online
  // If offline, skip loading and use cached data
  if (!initialLoadCompleted && isLoading && isOnline) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Typo size={16} style={styles.loadingText}>
          Loading medical supplies...
        </Typo>
        <Typo size={14} style={styles.loadingSubtext}>
          Syncing with database
        </Typo>
      </View>
    );
  }

  // If initial load is completed or user is offline, show children
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
    gap: spacingY._15,
  },
  loadingText: {
    color: colors.black,
    fontWeight: "500",
  },
  loadingSubtext: {
    color: colors.textGray,
  },
});

export default DataLoader;
