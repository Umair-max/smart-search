import colors from "@/config/colors";
import { spacingY } from "@/config/spacing";
import useNetworkStore from "@/store/networkStore";
import React, { useMemo } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Typo from "./Typo";

function NetworkBanner() {
  const { top: safeTop } = useSafeAreaInsets();
  const { isOnline, showAlert, setShowAlert } = useNetworkStore();

  const { show, message, bgColor } = useMemo(() => {
    console.log("NetworkBanner state:", { isOnline, showAlert });

    if (isOnline) {
      return {
        show: showAlert,
        message: "You're back online!",
        bgColor: colors.green,
      };
    } else {
      return {
        show: true,
        message: "No internet connection - Using cached data",
        bgColor: colors.warning,
      };
    }
  }, [isOnline, showAlert]);

  console.log("NetworkBanner render:", { show, message, bgColor });

  if (!show) return null;

  return (
    <TouchableOpacity
      style={[styles.banner, { backgroundColor: bgColor, top: safeTop }]}
      onPress={() => setShowAlert(false)}
      activeOpacity={0.8}
    >
      <Typo size={12} style={styles.text}>
        {message}
      </Typo>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingVertical: spacingY._8,
    paddingHorizontal: spacingY._15,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    flexDirection: "row",
    gap: spacingY._7,
  },
  text: {
    color: "white",
    fontWeight: "bold",
  },
});

export default NetworkBanner;
