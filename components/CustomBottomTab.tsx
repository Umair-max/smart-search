import colors from "@/config/colors";
import { spacingX, spacingY } from "@/config/spacing";
import { normalizeY } from "@/utils/normalize";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { Keyboard, StyleSheet, TouchableOpacity } from "react-native";
import Animated, { FadeIn, ReduceMotion } from "react-native-reanimated";
import Typo from "./Typo";

type TabTypes = "map" | "inbox" | "media" | "settings";

interface Props {
  state: any;
  navigation: any;
}

const CustomBottomTab = ({ state, navigation }: Props) => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const tabs = [
    {
      name: "home",
      file: require("@/assets/images/email.png"),
    },
    {
      name: "expiry",
      file: require("@/assets/images/email.png"),
    },
    {
      name: "profile",
      file: require("@/assets/images/email.png"),
    },
  ];

  const activeNavigatorTab = state.routes[state.index].name;

  const handleSelect = (routeName: TabTypes) => {
    navigation.navigate(routeName);
  };

  if (isKeyboardVisible) return;

  return (
    <Animated.View
      entering={FadeIn.duration(1000).reduceMotion(ReduceMotion.System)}
      style={styles.container}
    >
      {tabs.map((tab, index) => {
        const routeName = state.routes[index].name;
        const isFocused = activeNavigatorTab === routeName;
        const focusColor = isFocused ? colors.primary : colors.black;

        return (
          <TouchableOpacity
            activeOpacity={1}
            key={tab.name}
            style={styles.tabContent}
            onPress={() => handleSelect(routeName)}
          >
            <Image
              source={tab.file}
              style={{
                height: normalizeY(25),
                width: normalizeY(25),
                tintColor: focusColor,
              }}
            />
            <Typo
              size={12}
              style={{
                color: focusColor,
                fontWeight: "500",
                textTransform: "capitalize",
              }}
            >
              {tab.name}
            </Typo>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "90%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    bottom: 0,
    height: normalizeY(60),
    justifyContent: "space-around",
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 7,
    elevation: 5,
    position: "absolute",
    paddingHorizontal: spacingX._15,
    borderRadius: normalizeY(40),
    marginBottom: spacingY._20,
    backgroundColor: colors.white,
  },
  tabContent: {
    alignItems: "center",
    gap: normalizeY(3),
  },
});

export default CustomBottomTab;
