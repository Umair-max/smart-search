import { MedicalSupply } from "@/components/MedicalSupplyItem";
import MedicalSupplyList from "@/components/MedicalSupplyList";
import ScreenComponent from "@/components/ScreenComponent";
import Typo from "@/components/Typo";
import colors from "@/config/colors";
import { MedicalSupplies } from "@/config/data";
import { radius, spacingX, spacingY } from "@/config/spacing";
import useSuppliesStore from "@/store/suppliesStore";
import { normalizeY } from "@/utils/normalize";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const { importedSupplies } = useSuppliesStore();

  // Combine default data with imported supplies
  const allSupplies = useMemo(() => {
    const convertedImported = importedSupplies.map((supply) => ({
      Store: supply.Store,
      StoreName: supply.StoreName,
      ProductCode: supply.ProductCode,
      ProductDescription: supply.ProductDescription,
      Category: supply.Category,
      UOM: supply.UOM,
    }));
    return [...MedicalSupplies, ...convertedImported];
  }, [importedSupplies]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return allSupplies;
    }

    const query = searchQuery.toLowerCase();
    return allSupplies.filter(
      (item) =>
        item.ProductCode.toLowerCase().includes(query) ||
        item.ProductDescription.toLowerCase().includes(query) ||
        item.Category.toLowerCase().includes(query) ||
        item.StoreName.toLowerCase().includes(query)
    );
  }, [searchQuery, allSupplies]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  const handleItemPress = (item: MedicalSupply) => {
    console.log("Item pressed:", item.ProductCode);
  };

  return (
    <ScreenComponent style={styles.container}>
      <View style={styles.header}>
        <Typo size={24} style={styles.headerTitle}>
          Medical Supplies
        </Typo>
        <Typo size={14} style={styles.headerSubtitle}>
          Search and browse medical inventory
        </Typo>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.textGray}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by code, description, or category..."
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={colors.textGray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.resultsContainer}>
        <Typo size={14} style={styles.resultsText}>
          {filteredData.length} items found
          {searchQuery.length > 0 && (
            <Typo size={14} style={styles.searchTermText}>
              {" "}
              for "{searchQuery}"
            </Typo>
          )}
        </Typo>
      </View>

      <MedicalSupplyList data={filteredData} onItemPress={handleItemPress} />
    </ScreenComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacingX._20,
  },
  header: {
    marginBottom: spacingY._15,
  },
  headerTitle: {
    fontWeight: "bold",
    color: colors.black,
    marginBottom: spacingY._5,
  },
  headerSubtitle: {
    color: colors.textGray,
  },
  searchContainer: {
    marginBottom: spacingY._10,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: radius._12,
    paddingHorizontal: spacingX._15,
    height: normalizeY(45),
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
  resultsText: {
    color: colors.textGray,
  },
  searchTermText: {
    color: colors.primary,
    fontWeight: "500",
  },
});

export default Home;
