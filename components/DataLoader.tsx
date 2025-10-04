import Typo from "@/components/Typo";
import colors from "@/config/colors";
import { spacingY } from "@/config/spacing";
import { useAuthStore } from "@/store/authStore";
import useSuppliesStore from "@/store/suppliesStore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface DataLoaderProps {
  children: React.ReactNode;
}

const DataLoader: React.FC<DataLoaderProps> = ({ children }) => {
  const { user } = useAuthStore();
  const { smartFetchSupplies, isLoading } = useSuppliesStore();
  const [initialLoadCompleted, setInitialLoadCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { top: safeTop } = useSafeAreaInsets();

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
        setError("Failed to load data from server");
      } finally {
        setInitialLoadCompleted(true);
      }
    };

    loadInitialData();
  }, [user?.uid, smartFetchSupplies]);

  // Show loading screen only during initial load
  // Don't depend on supplies.length to prevent re-renders during data changes
  if (!initialLoadCompleted && isLoading) {
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
    return <View style={styles.container}>{children}</View>;
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
    position: "absolute",
    width: "100%",
    zIndex: 1,
  },
  errorText: {
    color: colors.red,
    fontWeight: "500",
  },
});

export default DataLoader;
