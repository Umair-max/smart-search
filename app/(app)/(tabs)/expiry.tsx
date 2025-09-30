import ExpiryTabs, { EnumOrderTab } from "@/components/ExpiryTabs";
import { MedicalSupply } from "@/components/MedicalSupplyItem";
import MedicalSupplyList from "@/components/MedicalSupplyList";
import ScreenComponent from "@/components/ScreenComponent";
import Typo from "@/components/Typo";
import colors from "@/config/colors";
import { MedicalSupplies } from "@/config/data";
import { spacingX, spacingY } from "@/config/spacing";
import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

function Expiry() {
  const [selected, setSelected] = useState<EnumOrderTab>(EnumOrderTab.EXPIRED);

  const getIsExpired = (
    item: MedicalSupply,
    checkExpired: boolean = true
  ): boolean => {
    const hash =
      item.ProductCode.charCodeAt(0) + item.ProductCode.charCodeAt(1);
    return checkExpired ? hash % 3 === 0 : hash % 3 === 1;
  };

  const expiredItems = useMemo(() => {
    return MedicalSupplies.filter((item) => getIsExpired(item, true));
  }, []);

  const nearExpiryItems = useMemo(() => {
    return MedicalSupplies.filter((item) => getIsExpired(item, false));
  }, []);

  const currentData =
    selected === EnumOrderTab.EXPIRED ? expiredItems : nearExpiryItems;
  const isExpired = selected === EnumOrderTab.EXPIRED;

  const handleItemPress = (item: MedicalSupply) => {
    console.log("Expiry item pressed:", item.ProductCode);
  };

  return (
    <ScreenComponent style={styles.container}>
      <View style={styles.header}>
        <Typo size={24} style={styles.headerTitle}>
          Expiry Management
        </Typo>
        <Typo size={14} style={styles.headerSubtitle}>
          Monitor expired and near-expiry items
        </Typo>
      </View>

      <ExpiryTabs selected={selected} setSelected={setSelected} />

      <View style={styles.statsContainer}>
        <View
          style={[
            styles.statCard,
            selected === EnumOrderTab.EXPIRED && styles.activeStatCard,
          ]}
        >
          <Typo size={20} style={[styles.statNumber, { color: colors.red }]}>
            {expiredItems.length}
          </Typo>
          <Typo size={12} style={styles.statLabel}>
            Expired Items
          </Typo>
        </View>
        <View
          style={[
            styles.statCard,
            selected === EnumOrderTab.NEAREXPIRY && styles.activeStatCard,
          ]}
        >
          <Typo
            size={20}
            style={[styles.statNumber, { color: colors.primary }]}
          >
            {nearExpiryItems.length}
          </Typo>
          <Typo size={12} style={styles.statLabel}>
            Near Expiry
          </Typo>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <MedicalSupplyList
          data={currentData}
          onItemPress={handleItemPress}
          showExpiryStatus={true}
          getIsExpired={() => isExpired}
          emptyTitle={isExpired ? "No expired items" : "No items near expiry"}
          emptySubtitle={
            isExpired
              ? "All items are within their expiry dates"
              : "All items have sufficient time remaining"
          }
        />
      </View>
    </ScreenComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacingX._20,
  },
  header: {
    marginBottom: spacingY._5,
  },
  headerTitle: {
    fontWeight: "bold",
    color: colors.black,
    marginBottom: spacingY._5,
  },
  headerSubtitle: {
    color: colors.textGray,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacingY._15,
    marginTop: spacingY._5,
  },
  statCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacingX._15,
    alignItems: "center",
    flex: 1,
    marginHorizontal: spacingX._5,
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
  activeStatCard: {
    borderColor: colors.primary,
    borderWidth: 2,
    shadowOpacity: 0.1,
  },
  statNumber: {
    fontWeight: "bold",
    marginBottom: spacingY._5,
  },
  statLabel: {
    color: colors.textGray,
    textAlign: "center",
  },
  contentContainer: {
    flex: 1,
  },
});

export default Expiry;
