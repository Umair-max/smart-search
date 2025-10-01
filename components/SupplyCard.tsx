import Typo from "@/components/Typo";
import colors from "@/config/colors";
import { radius, spacingX, spacingY } from "@/config/spacing";
import { normalizeY } from "@/utils/normalize";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export interface MedicalSupply {
  Store: number;
  StoreName: string;
  ProductCode: string;
  ProductDescription: string;
  Category: string;
  UOM: string;
  imageUrl?: string; // Optional image URL
  expiryDate?: string; // Optional expiry date (ISO string)
}

interface SupplyCardProps {
  item: MedicalSupply;
  onPress?: (item: MedicalSupply) => void;
  showExpiryStatus?: boolean;
  isExpired?: boolean;
}

const SupplyCard: React.FC<SupplyCardProps> = ({
  item,
  onPress,
  showExpiryStatus = false,
  isExpired = false,
}) => {
  const handlePress = () => {
    onPress?.(item);
  };

  return (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        showExpiryStatus && isExpired && styles.expiredContainer,
        showExpiryStatus && !isExpired && styles.nearExpiryContainer,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.itemHeader}>
        <View style={styles.codeContainer}>
          <Typo size={12} style={styles.codeText}>
            {item.ProductCode}
          </Typo>
        </View>
        <View style={styles.categoryContainer}>
          <Typo size={11} style={styles.categoryText}>
            {item.Category}
          </Typo>
        </View>
        {showExpiryStatus && (
          <View
            style={[
              styles.statusContainer,
              isExpired
                ? styles.expiredStatusContainer
                : styles.nearExpiryStatusContainer,
            ]}
          >
            <Ionicons
              name={isExpired ? "warning" : "time-outline"}
              size={12}
              color={isExpired ? colors.white : colors.red}
            />
            <Typo
              size={10}
              style={[
                styles.statusText,
                isExpired
                  ? styles.expiredStatusText
                  : styles.nearExpiryStatusText,
              ]}
            >
              {isExpired ? "EXPIRED" : "NEAR EXPIRY"}
            </Typo>
          </View>
        )}
      </View>

      <Typo size={15} style={styles.descriptionText} numberOfLines={2}>
        {item.ProductDescription}
      </Typo>

      <View style={styles.itemFooter}>
        <View style={styles.storeInfo}>
          <Ionicons name="location-outline" size={14} color={colors.textGray} />
          <Typo size={12} style={styles.storeText} numberOfLines={1}>
            {item.StoreName}
          </Typo>
        </View>
        <View style={styles.uomContainer}>
          <Typo size={12} style={styles.uomText}>
            {item.UOM}
          </Typo>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: colors.white,
    borderRadius: radius._12,
    padding: spacingX._15,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  expiredContainer: {
    borderLeftWidth: 4,
    borderLeftColor: colors.red,
    backgroundColor: colors.lightRed,
  },
  nearExpiryContainer: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    backgroundColor: colors.lightBlue,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._8,
    flexWrap: "wrap",
    gap: spacingY._10,
  },
  codeContainer: {
    backgroundColor: colors.lightPrimary,
    paddingHorizontal: spacingX._10,
    paddingVertical: spacingY._4,
    borderRadius: radius._6,
  },
  codeText: {
    color: colors.black,
    fontWeight: "600",
  },
  categoryContainer: {
    backgroundColor: colors.lightPurple,
    paddingHorizontal: spacingX._7,
    paddingVertical: spacingY._4,
    borderRadius: radius._6,
  },
  categoryText: {
    color: colors.purple,
    fontWeight: "500",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacingX._7,
    paddingVertical: spacingY._4,
    borderRadius: radius._6,
  },
  expiredStatusContainer: {
    backgroundColor: colors.red,
  },
  nearExpiryStatusContainer: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.red,
  },
  statusText: {
    marginLeft: spacingX._3,
    fontWeight: "600",
  },
  expiredStatusText: {
    color: colors.white,
  },
  nearExpiryStatusText: {
    color: colors.red,
  },
  descriptionText: {
    color: colors.black,
    fontWeight: "500",
    lineHeight: normalizeY(22),
    marginBottom: spacingY._12,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: spacingX._10,
  },
  storeText: {
    color: colors.textGray,
    marginLeft: spacingX._5,
  },
  uomContainer: {
    backgroundColor: colors.buttonGrey,
    paddingHorizontal: spacingX._7,
    paddingVertical: spacingY._4,
    borderRadius: radius._6,
  },
  uomText: {
    color: colors.black,
    fontWeight: "500",
  },
});

export default SupplyCard;
