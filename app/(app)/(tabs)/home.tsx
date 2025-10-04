import MedicalSupplyList from "@/components/MedicalSupplyList";
import ScreenComponent from "@/components/ScreenComponent";
import { MedicalSupply } from "@/components/SupplyCard";
import Typo from "@/components/Typo";
import colors from "@/config/colors";
import { height, radius, spacingX, spacingY } from "@/config/spacing";
import { useAuthStore } from "@/store/authStore";
import useSuppliesStore from "@/store/suppliesStore";
import { normalizeY } from "@/utils/normalize";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuthStore();

  const {
    supplies,
    isLoading,
    isOnline,
    searchSupplies,
    fetchFromFirestore,
    smartFetchSupplies,
    getTotalCount,
    lastSyncDate,
    clearAllSupplies,
  } = useSuppliesStore();

  // No need for useFocusEffect here since DataLoader handles initial fetch

  const allSupplies = useMemo(() => {
    return supplies;
  }, [supplies]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return allSupplies;
    }

    const results = searchSupplies(searchQuery);
    return results;
  }, [searchQuery, allSupplies, searchSupplies]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (user?.uid) {
        await smartFetchSupplies(user.uid);
      } else {
        await fetchFromFirestore();
      }
    } catch (error) {
      console.log("Refresh failed");
    } finally {
      setRefreshing(false);
    }
  }, [user?.uid, smartFetchSupplies, fetchFromFirestore]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  const handleItemPress = (item: MedicalSupply) => {
    // Navigate to details screen with only product code
    router.push({
      pathname: "/(app)/details",
      params: {
        productCode: item.ProductCode,
      },
    });
  };

  const renderContent = () => {
    // Only show loading on initial app launch, not during operations
    if (isLoading && allSupplies.length === 0 && !lastSyncDate) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Typo size={16} style={styles.loadingText}>
            Loading medical supplies...
          </Typo>
        </View>
      );
    }

    return (
      <MedicalSupplyList
        data={filteredData}
        onItemPress={handleItemPress}
        emptyTitle={searchQuery ? "No results found" : "No supplies available"}
        emptySubtitle={
          searchQuery
            ? `No supplies match "${searchQuery}". Try different keywords.`
            : ""
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    );
  };

  return (
    <ScreenComponent style={styles.container}>
      <View style={styles.header}>
        <Typo size={24} style={styles.headerTitle}>
          Medical Supplies
        </Typo>
        <View style={styles.headerInfo}>
          <Typo size={14} style={styles.headerSubtitle}>
            Search through {getTotalCount()} medical items
          </Typo>
          {lastSyncDate && (
            <Typo size={12} style={styles.syncText}>
              Last updated: {new Date(lastSyncDate).toLocaleDateString()}
            </Typo>
          )}
        </View>
      </View>

      {/* Enhanced Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color={searchQuery.length > 0 ? colors.primary : colors.textGray}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by product code, description..."
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results Info */}
      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <View style={styles.resultsInfo}>
            <Typo size={14} style={styles.resultsText}>
              {filteredData.length}{" "}
              {filteredData.length === 1 ? "item" : "items"}
              {searchQuery.length > 0 && (
                <Typo size={14} style={styles.searchTermText}>
                  {" "}
                  for "{searchQuery}"
                </Typo>
              )}
            </Typo>
            {searchQuery.length > 0 && filteredData.length > 0 && (
              <Typo size={12} style={styles.foundText}>
                Found in product codes and descriptions
              </Typo>
            )}
          </View>

          {isLoading && isOnline && (
            <ActivityIndicator size="small" color={colors.primary} />
          )}
        </View>
      </View>

      {renderContent()}
    </ScreenComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacingX._20,
  },
  header: {
    marginBottom: spacingY._20,
  },
  headerTitle: {
    fontWeight: "bold",
    color: colors.black,
    marginBottom: spacingY._5,
  },
  headerInfo: {
    gap: spacingY._4,
  },
  headerSubtitle: {
    color: colors.textGray,
  },
  syncText: {
    color: colors.textGray,
    fontStyle: "italic",
  },
  searchContainer: {
    marginBottom: spacingY._15,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: radius._12,
    paddingHorizontal: spacingX._15,
    height: normalizeY(50),
    borderWidth: 1,
    borderColor: colors.transparent,
  },
  searchInputActive: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
    shadowColor: colors.primary,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  searchIcon: {
    marginRight: spacingX._10,
  },
  searchInput: {
    flex: 1,
    fontSize: normalizeY(16),
    color: colors.black,
    paddingVertical: 0,
  },
  clearButton: {
    padding: spacingX._5,
  },
  resultsContainer: {
    marginBottom: spacingY._15,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultsInfo: {
    flex: 1,
  },
  resultsText: {
    color: colors.textGray,
    fontWeight: "500",
  },
  searchTermText: {
    color: colors.primary,
    fontWeight: "600",
  },
  foundText: {
    color: colors.textGray,
    marginTop: spacingY._4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacingY._50,
    gap: spacingY._15,
    paddingTop: height * 0.15,
  },
  loadingText: {
    color: colors.textGray,
  },
});

export default Home;
