import { normalizeY } from "@/utils/normalize";
import { Image } from "expo-image";
import React from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import colors from "../config/colors";
import { radius, spacingH, spacingY } from "../config/spacing";
import Typo from "./Typo";

interface Props {}

function RegistrationHeader({}: Props) {
  return (
    <View style={styles.topImg}>
      <StatusBar barStyle={"light-content"} />
      <View
        style={{
          borderRadius: radius._20,
          height: normalizeY(110),
          width: normalizeY(110),
          overflow: "hidden",
        }}
      >
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
          contentFit="contain"
        />
      </View>
      <Typo
        size={18}
        style={{
          fontWeight: "700",
          color: colors.white,
          marginTop: spacingY._7,
          marginBottom: -spacingY._10,
          letterSpacing: 1,
        }}
      >
        Smart Search
      </Typo>
    </View>
  );
}

const styles = StyleSheet.create({
  topImg: {
    height: spacingH.topImg,
    width: "100%",
    position: "absolute",
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    height: "100%",
    width: "100%",
    alignSelf: "center",
  },
});

export default RegistrationHeader;
