import AppAlert from "@/components/AppAlert";
import AppLayerProvider from "@/components/AppLayerProvider";
import AppToast from "@/components/AppToast";
import { useAuthStore } from "@/store/authStore";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

export default function RootLayout() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppLayerProvider>
        <ThemeProvider value={DefaultTheme}>
          <BottomSheetModalProvider>
            <Stack screenOptions={{ headerShown: false, animation: "none" }} />
            <StatusBar style="auto" />
            <AppToast />
            <AppAlert />
          </BottomSheetModalProvider>
        </ThemeProvider>
      </AppLayerProvider>
    </GestureHandlerRootView>
  );
}
