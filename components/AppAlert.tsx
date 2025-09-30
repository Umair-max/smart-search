import { BlurView } from "expo-blur";
import { WarningIcon } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut, runOnJS } from "react-native-reanimated";
import colors from "../config/colors";
import { radius, spacingX, spacingY, width } from "../config/spacing";
import useAlertStore from "../store/alertStore";
import { normalizeY } from "../utils/normalize";
import AppButton from "./AppButton";
import Typo from "./Typo";

function AppAlert() {
  const {
    button1,
    button2,
    title,
    body,
    alertVisible,
    onConfirm,
    hideAlert,
    setOnConfirm,
  } = useAlertStore();
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
    setOnConfirm(null);
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
            <WarningIcon size={40} weight="duotone" color={colors.red} />
          </View>
          <Typo size={20} style={styles.title}>
            {title}
          </Typo>
          <Typo size={16} style={styles.body}>
            {body}
          </Typo>
          <View style={styles.buttonsContainer}>
            <AppButton
              label={button1}
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
              label={button2}
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
    marginBottom: spacingY._12,
    borderWidth: 1,
    borderColor: colors.red,
  },
  title: {
    fontWeight: "500",
    color: colors.black,
    marginBottom: spacingY._7,
  },
  body: {
    color: colors.black,
    marginBottom: spacingY._7,
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
