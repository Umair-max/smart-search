import colors from "@/config/colors";
import { useAuthStore } from "@/store/authStore";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import Typo from "./Typo";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const {
    isAuthenticated,
    loading,
    authInitialized,
    processingAuthChange,
    isBlocked,
    logoutUser,
  } = useAuthStore();

  useEffect(() => {
    // Only check auth state when fully initialized and not processing
    if (authInitialized && !loading && !processingAuthChange) {
      if (!isAuthenticated) {
        console.log("AuthGuard: User not authenticated, redirecting to login");
        router.replace("/(auth)/login");
      } else if (isBlocked()) {
        console.log("AuthGuard: User is blocked, signing out");
        Alert.alert(
          "Account Blocked",
          "Your account has been blocked. Please contact an administrator.",
          [
            {
              text: "OK",
              onPress: async () => {
                await logoutUser();
                router.replace("/(auth)/login");
              },
            },
          ]
        );
      }
    }
  }, [
    isAuthenticated,
    loading,
    authInitialized,
    processingAuthChange,
    isBlocked,
  ]);

  // Show loading while Firebase is checking auth state or processing changes
  if (!authInitialized || loading || processingAuthChange) {
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

  // Check if user is blocked
  if (isBlocked()) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.white,
          padding: 20,
        }}
      >
        <Typo
          size={18}
          style={{ textAlign: "center", marginBottom: 10, color: colors.error }}
        >
          Account Blocked
        </Typo>
        <Typo size={14} style={{ textAlign: "center", color: colors.textGray }}>
          Your account has been blocked. Please contact an administrator.
        </Typo>
      </View>
    );
  }

  console.log(
    "AuthGuard: User authenticated and not blocked, rendering protected content"
  );
  return <>{children}</>;
};

export default AuthGuard;
