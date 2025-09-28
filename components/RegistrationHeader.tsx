import React from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import colors from "../config/colors";
import { spacingH } from "../config/spacing";
import { Image } from "expo-image";

interface Props {}

function RegistrationHeader({}: Props) {
  return (
    <View style={styles.topImg}>
      <StatusBar barStyle={"light-content"} />
      <Image
        source={require("@/assets/images/logo.png")}
        style={styles.logo}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topImg: {
    height: spacingH.topImg,
    width: "100%",
    position: "absolute",
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    height: "60%",
    width: "60%",
    alignSelf: "center",
  },
});

export default RegistrationHeader;
