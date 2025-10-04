import colors from "@/config/colors";
import { spacingX, spacingY } from "@/config/spacing";
import useSuppliesStore from "@/store/suppliesStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Typo from "./Typo";

const OfflineIndicator: React.FC = () => {
  const { isOnline } = useSuppliesStore();
  const { top: safeTop } = useSafeAreaInsets();

  if (isOnline) {
    return null; // Don't show anything when online
  }

  return (
    <View style={[styles.container, { top: safeTop }]}>
      <Ionicons name="cloud-offline-outline" size={16} color={colors.white} />
      <Typo size={12} style={styles.text}>
        Offline Mode - Using cached data
      </Typo>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: colors.warning,
    paddingVertical: spacingY._8,
    paddingHorizontal: spacingX._15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacingX._7,
    zIndex: 1000,
  },
  text: {
    color: colors.white,
    fontWeight: "500",
  },
});

export default OfflineIndicator;
