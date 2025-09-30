import Typo from "@/components/Typo";
import colors from "@/config/colors";
import { spacingY } from "@/config/spacing";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import MedicalSupplyItem, { MedicalSupply } from "./MedicalSupplyItem";

interface MedicalSupplyListProps {
  data: MedicalSupply[];
  onItemPress?: (item: MedicalSupply) => void;
  showExpiryStatus?: boolean;
  getIsExpired?: (item: MedicalSupply) => boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
  contentContainerStyle?: any;
}

const MedicalSupplyList: React.FC<MedicalSupplyListProps> = ({
  data,
  onItemPress,
  showExpiryStatus = false,
  getIsExpired = () => false,
  emptyTitle = "No items found",
  emptySubtitle = "Try adjusting your search terms",
  contentContainerStyle,
}) => {
  const renderItem = ({ item }: { item: MedicalSupply }) => (
    <MedicalSupplyItem
      item={item}
      onPress={onItemPress}
      showExpiryStatus={showExpiryStatus}
      isExpired={getIsExpired(item)}
    />
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={64} color={colors.midGray} />
      <Typo size={18} style={styles.emptyTitle}>
        {emptyTitle}
      </Typo>
      <Typo size={14} style={styles.emptySubtitle}>
        {emptySubtitle}
      </Typo>
    </View>
  );

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.ProductCode}-${index}`}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.listContainer, contentContainerStyle]}
      ItemSeparatorComponent={renderSeparator}
      ListEmptyComponent={renderEmptyComponent}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: spacingY._20,
  },
  separator: {
    height: spacingY._12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacingY._60,
  },
  emptyTitle: {
    color: colors.black,
    fontWeight: "600",
    marginTop: spacingY._15,
    marginBottom: spacingY._5,
  },
  emptySubtitle: {
    color: colors.textGray,
  },
});

export default MedicalSupplyList;
