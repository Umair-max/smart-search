import React, { useState, useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import useAlertStore from "../store/alertStore";
import colors from "../config/colors";
import { radius, spacingX, spacingY, width } from "../config/spacing";
import Typo from "./Typo";
import AppButton from "./AppButton";
import { normalizeY } from "../utils/normalize";
import Animated, { FadeIn, FadeOut, runOnJS } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Warning } from "phosphor-react-native";

function AppAlert() {
  const { title, body, alertVisible, onConfirm, hideAlert } = useAlertStore();
  const [isVisible, setIsVisible] = useState(alertVisible);
  const [shadowVisible, setShadowVisible] = useState(false);

  useEffect(() => {
    if (alertVisible) {
      setIsVisible(true);
    }
  }, [alertVisible]);

  const handleClose = () => {
    setShadowVisible(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(800).withCallback((finished) => {
        if (finished) runOnJS(setShadowVisible)(true);
      })}
      exiting={FadeOut.duration(500).withCallback((finished) => {
        if (finished) {
          runOnJS(hideAlert)();
        }
      })}
      style={[StyleSheet.absoluteFillObject, styles.animatedContainer]}
    >
      <View style={styles.blurContainer}>
        <BlurView style={StyleSheet.absoluteFillObject} />
        <View style={[styles.container, { elevation: shadowVisible ? 10 : 0 }]}>
          <View style={styles.iconView}>
            <Warning size={40} weight="duotone" color={colors.red} />
          </View>
          <Typo size={22} style={styles.title}>
            {title}
          </Typo>
          <Typo size={16} style={styles.body}>
            {body}
          </Typo>
          <View style={styles.buttonsContainer}>
            <AppButton
              label={"Cancel"}
              onPress={() => {
                setShadowVisible(false);
                setTimeout(() => {
                  handleClose();
                }, 100);
              }}
              style={[styles.button, { backgroundColor: colors.buttonGrey }]}
              textStyle={{ color: colors.black }}
              isGradient={false}
            />
            <AppButton
              label={"Delete"}
              onPress={() => {
                setShadowVisible(false);
                setTimeout(() => {
                  if (onConfirm) {
                    onConfirm();
                  }
                  handleClose();
                }, 100);
              }}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animatedContainer: {
    zIndex: 9999,
    position: "absolute",
  },
  blurContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    backgroundColor: colors.white,
    width: width * 0.9,
    padding: 20,
    zIndex: 1,
    shadowColor: colors.black,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    borderRadius: radius._30,
    alignItems: "center",
    justifyContent: "center",
  },
  iconView: {
    height: normalizeY(70),
    width: normalizeY(70),
    borderRadius: normalizeY(40),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacingY._15,
    borderWidth: 1,
    borderColor: colors.red,
  },
  title: {
    fontWeight: "500",
    color: colors.black,
    marginBottom: spacingY._10,
  },
  body: {
    color: colors.black,
    marginBottom: spacingY._10,
    textAlign: "center",
    opacity: 0.7,
  },
  buttonsContainer: {
    gap: spacingX._10,
    marginTop: spacingY._10,
    flexDirection: "row",
  },
  button: {
    flex: 1,
    backgroundColor: colors.red,
    borderRadius: normalizeY(50),
  },
});

export default AppAlert;
