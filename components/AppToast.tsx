import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { CheckCircleIcon, WarningCircleIcon } from "phosphor-react-native";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import colors from "../config/colors";
import { radius, spacingX, spacingY } from "../config/spacing";
import useToastStore from "../store/toastStore";
import { normalizeY } from "../utils/normalize";
import Typo from "./Typo";

function AppToast() {
  const { message, type, toastVisible, hideToast } = useToastStore();
  const toastHeight = 120;

  const isCopyMessage = "Copied to clipboard";

  const offsetY = useSharedValue(-toastHeight);
  const opacity = useSharedValue(1);
  const isSuccess = type == "success";

  useEffect(() => {
    if (toastVisible) {
      offsetY.value = withTiming(toastHeight * 0.5, {
        duration: 1000,
        easing: Easing.out(Easing.exp),
      });

      const hideTimeout = setTimeout(() => {
        opacity.value = withTiming(0, {
          duration: 500,
          easing: Easing.in(Easing.exp),
        });

        setTimeout(() => {
          hideToast();
          offsetY.value = -toastHeight;
          opacity.value = 1;
        }, 500);
      }, 2000);
      return () => clearTimeout(hideTimeout);
    }
  }, [toastVisible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: offsetY.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        animatedStyle,
        { backgroundColor: isCopyMessage ? colors.transparent : colors.white },
      ]}
    >
      <BlurView
        style={[
          StyleSheet.absoluteFillObject,
          { borderWidth: 0.5, borderColor: "rgba(255,255,255,0.5)" },
        ]}
      />
      <LinearGradient
        style={StyleSheet.absoluteFillObject}
        colors={["rgba(0,0,0,0.1)", "rgba(255,255,255,0)"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 1 }}
      />
      {isSuccess ? (
        <CheckCircleIcon />
      ) : (
        <WarningCircleIcon color={colors.error} />
      )}
      <Typo
        size={16}
        style={[
          styles.message,
          { color: isSuccess ? colors.black : colors.error },
        ]}
      >
        {message || "Switch successful."}
      </Typo>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    left: spacingX._15,
    right: spacingX._15,
    minHeight: normalizeY(60),
    alignItems: "center",
    borderRadius: radius._35,
    overflow: "hidden",
    backgroundColor: colors.white,
    flexDirection: "row",
    paddingHorizontal: spacingX._20,
    gap: spacingX._10,
    zIndex: 1,
    paddingVertical: spacingY._15,
  },
  message: {
    fontWeight: "500",
    width: "90%",
    textAlign: "left",
  },
  img: {
    height: normalizeY(20),
    width: normalizeY(20),
    resizeMode: "contain",
    tintColor: colors.black,
  },
});

export default AppToast;
