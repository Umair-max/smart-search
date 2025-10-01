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
  const { fetchFromFirestore, supplies, isLoading } = useSuppliesStore();
  const [initialLoadCompleted, setInitialLoadCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) {
        setInitialLoadCompleted(true);
        return;
      }

      try {
        console.log("DataLoader: Fetching fresh data from Firebase...");
        await fetchFromFirestore();
        console.log("DataLoader: Initial data fetch completed");
      } catch (error) {
        console.error("DataLoader: Failed to fetch initial data:", error);
        setError("Failed to load data from server");
      } finally {
        setInitialLoadCompleted(true);
      }
    };

    loadInitialData();
  }, [user, fetchFromFirestore]);

  // Show loading screen only on first app launch with no local data
  if (!initialLoadCompleted && supplies.length === 0 && isLoading) {
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

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorBanner}>
          <Typo size={12} style={styles.errorText}>
            {error}
          </Typo>
        </View>
        {children}
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  errorBanner: {
    backgroundColor: colors.lightRed,
    paddingVertical: spacingY._8,
    paddingHorizontal: spacingY._15,
    alignItems: "center",
  },
  errorText: {
    color: colors.red,
    fontWeight: "500",
  },
});

export default DataLoader;
