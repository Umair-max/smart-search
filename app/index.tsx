import colors from "@/config/colors";
import { useAuthStore } from "@/store/authStore";
import useSplashStore from "@/store/splashStore";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const SplashScreen = () => {
  const setIsSplashShown = useSplashStore((state) => state.setIsSplashShown);
  const setFadeOutComplete = useSplashStore(
    (state) => state.setFadeOutComplete
  );
  const fadeOutComplete = useSplashStore((state) => state.fadeOutComplete);
  const isSplashShown = useSplashStore((state) => state.isSplashShown);

  const { isAuthenticated, loading, authInitialized } = useAuthStore();

  useEffect(() => {
    if (!isSplashShown) {
      const timer = setTimeout(() => {
        setFadeOutComplete(true);
        setIsSplashShown(true);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isSplashShown, setIsSplashShown, setFadeOutComplete]);

  useEffect(() => {
    if (fadeOutComplete && authInitialized && !loading) {
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
  }, [fadeOutComplete, isAuthenticated, loading, authInitialized]);

  const fadeOutStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(fadeOutComplete ? 0 : 1, {
        duration: 1000,
        easing: Easing.ease,
      }),
      zIndex: fadeOutComplete ? -1 : 100,
    };
  });

  return (
    <Animated.View style={[styles.container, fadeOutStyle]}>
      <Image
        source={require("@/assets/images/splash.png")}
        style={StyleSheet.absoluteFillObject}
        contentFit="contain"
      />
    </Animated.View>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
});

export default SplashScreen;
