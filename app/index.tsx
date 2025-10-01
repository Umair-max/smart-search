import Typo from "@/components/Typo";
import colors from "@/config/colors";
import { height, isIOS, radius, spacingY, width } from "@/config/spacing";
import { useAuthStore } from "@/store/authStore";
import useSplashStore from "@/store/splashStore";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import ReAnimated, { FadeOut } from "react-native-reanimated";

const SplashScreen = () => {
  const setIsSplashShown = useSplashStore((state) => state.setIsSplashShown);
  const isSplashShown = useSplashStore((state) => state.isSplashShown);

  const { isAuthenticated, loading, authInitialized } = useAuthStore();
  const sizeAnim = useRef(new Animated.Value(width * 0.5)).current;

  useEffect(() => {
    Animated.timing(sizeAnim, {
      toValue: Math.max(width, height * 1.2),
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, []);

  useEffect(() => {
    if (!isSplashShown) {
      const timer = setTimeout(() => {
        setIsSplashShown(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isSplashShown, setIsSplashShown]);

  useEffect(() => {
    if (isSplashShown && authInitialized && !loading) {
      const navigationTimer = setTimeout(() => {
        if (isAuthenticated) {
          console.log("User is authenticated, navigating to home");
          router.replace("/(app)/(tabs)/home");
        } else {
          console.log("User is not authenticated, navigating to login");
          router.replace("/(auth)/login");
        }
      }, 100);

      return () => clearTimeout(navigationTimer);
    }
  }, [isSplashShown, isAuthenticated, loading, authInitialized]);

  return (
    <ReAnimated.View
      style={[StyleSheet.absoluteFillObject, styles.container]}
      exiting={isIOS ? FadeOut.duration(500) : undefined}
    >
      <Animated.View
        style={{
          width: sizeAnim,
          height: sizeAnim,
          borderRadius: sizeAnim.interpolate({
            inputRange: [0, Math.max(width, height)],
            outputRange: [width * 0.25, Math.max(width, height) / 2],
          }),
          backgroundColor: colors.primary,
          position: "absolute",
        }}
      />

      <Image
        source={require("@/assets/images/logo.png")}
        style={styles.logoImg}
      />
      <Typo
        size={21}
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
    </ReAnimated.View>
  );
};
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    backgroundColor: colors.white,
  },
  logoImg: {
    resizeMode: "contain",
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: radius._25,
  },
});

export default SplashScreen;
