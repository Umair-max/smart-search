import colors from "@/config/colors";
import { spacingX, spacingY } from "@/config/spacing";
import useNetworkStore from "@/store/networkStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Typo from "./Typo";

const OfflineIndicator: React.FC = () => {
  const { isOnline, showAlert } = useNetworkStore();
  const { top: safeTop } = useSafeAreaInsets();
  if (isOnline && showAlert) {
    return (
      <View
        style={[styles.container, styles.onlineContainer, { top: safeTop }]}
      >
        <Ionicons name="cloud-done-outline" size={16} color={colors.white} />
        <Typo size={12} style={styles.text}>
          You're back online!
        </Typo>
      </View>
    );
  }

  if (!isOnline) {
    return (
      <View
        style={[styles.container, styles.offlineContainer, { top: safeTop }]}
      >
        <Ionicons name="cloud-offline-outline" size={16} color={colors.white} />
        <Typo size={12} style={styles.text}>
          Offline Mode - Using cached data
        </Typo>
      </View>
    );
  }

  // Don't show anything when online and not showing alert
  return null;
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacingY._8,
    paddingHorizontal: spacingX._15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacingX._7,
    zIndex: 1000,
  },
  offlineContainer: {
    backgroundColor: colors.warning,
  },
  onlineContainer: {
    backgroundColor: colors.green,
  },
  text: {
    color: colors.white,
    fontWeight: "500",
  },
});

export default OfflineIndicator;
