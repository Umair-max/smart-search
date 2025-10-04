import ExpiryTabs, { EnumOrderTab } from "@/components/ExpiryTabs";
import MedicalSupplyList from "@/components/MedicalSupplyList";
import ScreenComponent from "@/components/ScreenComponent";
import { MedicalSupply } from "@/components/SupplyCard";
import Typo from "@/components/Typo";
import colors from "@/config/colors";
import { spacingX, spacingY } from "@/config/spacing";
import { useAuthStore } from "@/store/authStore";
import useSuppliesStore from "@/store/suppliesStore";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";

function Expiry() {
  const [selected, setSelected] = useState<EnumOrderTab>(EnumOrderTab.EXPIRED);
  const [refreshing, setRefreshing] = useState(false);
  const pagerRef = useRef<PagerView>(null);
  const { supplies, fetchFromFirestore, isOnline, smartFetchSupplies } =
    useSuppliesStore();
  const { user } = useAuthStore();

  /**
   * Check if an item is expired
   */
  const isExpired = (item: MedicalSupply): boolean => {
    if (!item.expiryDate) return false;
    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    return expiryDate < today;
  };

  /**
   * Check if an item is near expiry (within 1 month)
   */
  const isNearExpiry = (item: MedicalSupply): boolean => {
    if (!item.expiryDate) return false;
    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(today.getMonth() + 1);

    // Item is near expiry if it expires within 1 month but is not yet expired
    return expiryDate > today && expiryDate <= oneMonthFromNow;
  };

  const expiredItems = useMemo(() => {
    return supplies.filter((item) => isExpired(item));
  }, [supplies]);

  const nearExpiryItems = useMemo(() => {
    return supplies.filter((item) => isNearExpiry(item));
  }, [supplies]);

  const handleTabChange = (tab: EnumOrderTab) => {
    const pageIndex = tab === EnumOrderTab.EXPIRED ? 0 : 1;
    setSelected(tab);
    pagerRef.current?.setPage(pageIndex);
  };

  const handlePageSelected = (e: any) => {
    const { position } = e.nativeEvent;
    const newTab =
      position === 0 ? EnumOrderTab.EXPIRED : EnumOrderTab.NEAREXPIRY;
    setSelected(newTab);
  };

  const handleItemPress = (item: MedicalSupply) => {
    router.push({
      pathname: "/(app)/details",
      params: {
        productCode: item.ProductCode,
      },
    });
  };

  const onRefresh = async () => {
    if (!isOnline) {
      // In offline mode, just refresh the UI without network call
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 500);
      return;
    }

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

      <ExpiryTabs selected={selected} setSelected={handleTabChange} />

      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={[
            styles.statCard,
            selected === EnumOrderTab.EXPIRED && styles.activeStatCard,
          ]}
          onPress={() => handleTabChange(EnumOrderTab.EXPIRED)}
          activeOpacity={0.7}
        >
          <Typo size={20} style={[styles.statNumber, { color: colors.red }]}>
            {expiredItems.length}
          </Typo>
          <Typo size={12} style={styles.statLabel}>
            Expired Items
          </Typo>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.statCard,
            selected === EnumOrderTab.NEAREXPIRY && styles.activeStatCard,
          ]}
          onPress={() => handleTabChange(EnumOrderTab.NEAREXPIRY)}
          activeOpacity={0.7}
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
        </TouchableOpacity>
      </View>

      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={handlePageSelected}
        scrollEnabled={true}
      >
        <View key="expired" style={styles.pageContainer}>
          <MedicalSupplyList
            data={expiredItems}
            onItemPress={handleItemPress}
            showExpiryStatus={true}
            getIsExpired={isExpired}
            emptyTitle="No expired items"
            emptySubtitle="All items are within their expiry dates"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </View>

        <View key="nearExpiry" style={styles.pageContainer}>
          <MedicalSupplyList
            data={nearExpiryItems}
            onItemPress={handleItemPress}
            showExpiryStatus={true}
            getIsExpired={isExpired}
            emptyTitle="No items near expiry"
            emptySubtitle="All items have sufficient time remaining"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </View>
      </PagerView>
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
    padding: spacingX._7,
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
  pagerView: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
  },
});

export default Expiry;
