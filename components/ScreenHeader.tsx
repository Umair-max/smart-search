import React from "react";
import { StyleSheet, TextStyle, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import colors from "../config/colors";
import Typo from "./Typo";
import AppIcon from "./AppIcon";
import { ArrowLeftIcon } from "phosphor-react-native";
import { radius, spacingX, spacingY } from "../config/spacing";
import Animated, { FadeIn } from "react-native-reanimated";

interface Props {
  heading: string;
  isBack?: boolean;
  headingStyle?: TextStyle;
  onPress?: () => void;
}
function ScreenHeader({
  heading,
  isBack = true,
  headingStyle,
  onPress,
}: Props) {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      {isBack && (
        <AppIcon
          style={styles.icon}
          icon={ArrowLeftIcon}
          onPress={() => {
            if (onPress) onPress();
            else navigation.goBack();
          }}
          iconProps={{ color: colors.white, size: 25 }}
          size={18}
        />
      )}

      <Animated.View entering={FadeIn.duration(500)}>
        <Typo size={22} style={[styles.heading, headingStyle]}>
          {heading}
        </Typo>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingHorizontal: spacingX._15,
    marginBottom: spacingY._10,
    flexDirection: "row",
    gap: spacingX._10,
    zIndex: 1,
  },
  heading: {
    fontWeight: "600",
  },
  icon: {
    borderRadius: radius._10,
    backgroundColor: colors.primary,
  },
  iconImage: {
    tintColor: colors.white,
  },
});

export default ScreenHeader;
