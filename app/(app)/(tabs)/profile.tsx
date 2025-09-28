import AppButton from "@/components/AppButton";
import ScreenComponent from "@/components/ScreenComponent";
import Typo from "@/components/Typo";
import colors from "@/config/colors";
import { spacingX, spacingY } from "@/config/spacing";
import { useAuthStore } from "@/store/authStore";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

function Profile() {
  const { user, logoutUser, loading } = useAuthStore();

  const handleLogout = async () => {
    await logoutUser();
    router.replace("/(auth)/login");
  };

  return (
    <ScreenComponent style={styles.container}>
      <View style={styles.header}>
        <Typo style={styles.title}>Profile</Typo>
      </View>

      <View style={styles.content}>
        <View style={styles.userInfo}>
          <Typo style={styles.label}>Email:</Typo>
          <Typo style={styles.value}>{user?.email || "No email"}</Typo>

          <Typo style={styles.label}>Display Name:</Typo>
          <Typo style={styles.value}>{user?.displayName || "Not set"}</Typo>

          <Typo style={styles.label}>Email Verified:</Typo>
          <Typo style={styles.value}>{user?.emailVerified ? "Yes" : "No"}</Typo>

          <Typo style={styles.label}>Account Created:</Typo>
          <Typo style={styles.value}>
            {user?.metadata.creationTime
              ? new Date(user.metadata.creationTime).toLocaleDateString()
              : "Unknown"}
          </Typo>
        </View>

        <AppButton
          onPress={handleLogout}
          label="Sign Out"
          loading={loading}
          style={styles.logoutButton}
        />
      </View>
    </ScreenComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.black,
  },
  content: {
    flex: 1,
    padding: spacingX._20,
  },
  userInfo: {
    backgroundColor: colors.lightGray,
    padding: spacingY._20,
    borderRadius: 12,
    marginBottom: spacingY._30,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textGray,
    marginTop: spacingY._15,
    marginBottom: spacingY._5,
  },
  value: {
    fontSize: 16,
    color: colors.black,
    marginBottom: spacingY._5,
  },
  logoutButton: {
    backgroundColor: colors.red || "#FF3B30",
    marginTop: "auto",
    marginBottom: spacingY._20,
  },
});

export default Profile;
