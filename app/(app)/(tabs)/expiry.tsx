import ExpiryTabs, { EnumOrderTab } from "@/components/ExpiryTabs";
import { MedicalSupply } from "@/components/MedicalSupplyItem";
import MedicalSupplyList from "@/components/MedicalSupplyList";
import ScreenComponent from "@/components/ScreenComponent";
import Typo from "@/components/Typo";
import colors from "@/config/colors";
import { MedicalSupplies } from "@/config/data";
import { spacingX, spacingY } from "@/config/spacing";
import { useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import PagerView from "react-native-pager-view";

function Expiry() {
  const [selected, setSelected] = useState<EnumOrderTab>(EnumOrderTab.EXPIRED);
  const pagerRef = useRef<PagerView>(null);

  const getIsExpired = (item: MedicalSupply): boolean => {
    const hash = item.ProductCode.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash) % 5 < 2;
  };

  const getIsNearExpiry = (item: MedicalSupply): boolean => {
    const hash = item.ProductDescription.split("").reduce((a, b) => {
      a = (a << 3) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash) % 3 === 0;
  };

  const expiredItems = useMemo(() => {
    return MedicalSupplies.filter((item) => getIsExpired(item));
  }, []);

  const nearExpiryItems = useMemo(() => {
    return MedicalSupplies.filter(
      (item) => !getIsExpired(item) && getIsNearExpiry(item)
    );
  }, []);

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

      <ExpiryTabs selected={selected} setSelected={handleTabChange} />

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
            getIsExpired={() => true}
            emptyTitle="No expired items"
            emptySubtitle="All items are within their expiry dates"
          />
        </View>

        <View key="nearExpiry" style={styles.pageContainer}>
          <MedicalSupplyList
            data={nearExpiryItems}
            onItemPress={handleItemPress}
            showExpiryStatus={true}
            getIsExpired={() => false}
            emptyTitle="No items near expiry"
            emptySubtitle="All items have sufficient time remaining"
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
  pagerView: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
  },
});

export default Expiry;
