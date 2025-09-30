import colors from "@/config/colors";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { radius, spacingX, spacingY } from "../config/spacing";
import { normalizeY } from "../utils/normalize";
import Typo from "./Typo";

const { width } = Dimensions.get("screen");
const containerWidth = width - spacingX._20;

export enum EnumOrderTab {
  EXPIRED = "EXPIRED",
  NEAREXPIRY = "NEAREXPIRY",
}

interface Props {
  selected: EnumOrderTab;
  setSelected: (value: EnumOrderTab) => void;
}

const tabs: EnumOrderTab[] = [EnumOrderTab.EXPIRED, EnumOrderTab.NEAREXPIRY];

const tabPositions: Record<EnumOrderTab, number> = {
  [EnumOrderTab.EXPIRED]: 0,
  [EnumOrderTab.NEAREXPIRY]: containerWidth / 2,
};

function ExpiryTabs({ selected, setSelected }: Props) {
  const translateX = useSharedValue(tabPositions[selected]);

  useEffect(() => {
    translateX.value = withTiming(tabPositions[selected], {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
  }, [selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.selectedView, animatedStyle]} />
      {tabs.map((tab) => {
        const tabText =
          tab === EnumOrderTab.EXPIRED ? "Expired" : "Near Expiry";
        return (
          <TouchableOpacity
            key={tab}
            style={styles.textContainer}
            onPress={() => setSelected(tab)}
          >
            <Typo
              size={15}
              style={[
                styles.tabText,
                { color: selected === tab ? colors.white : colors.black },
              ]}
            >
              {tabText}
            </Typo>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius._30,
    overflow: "hidden",
    backgroundColor: colors.buttonGrey,
    marginTop: spacingY._10,
    marginBottom: spacingY._10,
    width: containerWidth,
    alignSelf: "center",
    height: normalizeY(45),
  },
  selectedView: {
    backgroundColor: colors.primary,
    width: containerWidth / 2,
    height: "100%",
    position: "absolute",
    borderRadius: radius._30,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: normalizeY(10),
  },
  tabText: {
    fontWeight: "500",
  },
});

export default ExpiryTabs;
