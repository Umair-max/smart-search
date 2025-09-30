import colors from "@/config/colors";
import { useAuthStore } from "@/store/authStore";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, loading, authInitialized } = useAuthStore();

  useEffect(() => {
    if (authInitialized && !loading && !isAuthenticated) {
      console.log("AuthGuard: User not authenticated, redirecting to login");
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, loading, authInitialized]);

  // Show loading while Firebase is checking auth state
  if (!authInitialized || loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.white,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  console.log("AuthGuard: User authenticated, rendering protected content");
  return <>{children}</>;
};

export default AuthGuard;
