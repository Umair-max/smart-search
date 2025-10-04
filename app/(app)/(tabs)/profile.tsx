import ScreenComponent from "@/components/ScreenComponent";
import Typo from "@/components/Typo";
import colors from "@/config/colors";
import { radius, spacingX, spacingY } from "@/config/spacing";
import ImageCompressionService from "@/services/imageCompressionService";
import useAlertStore from "@/store/alertStore";
import { useAuthStore } from "@/store/authStore";
import { normalizeY } from "@/utils/normalize";
import {
  AntDesign,
  FontAwesome6,
  Ionicons,
  Octicons,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";

interface RowProps {
  icon: any;
  title: string;
  iconColor: string;
  index: number;
  onPress?: () => void;
}

function ProfileScreen() {
  const { setAlertVisible, setOnConfirm } = useAlertStore();
  const {
    user,
    userProfile,
    logoutUser,
    updateUserProfile,
    isAdmin,
    canUpload,
  } = useAuthStore();
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImportSupplies = () => {
    router.push("/(app)/import");
  };

  const handleManagePermissions = () => {
    router.push("/(app)/manage-permissions");
  };

  const handleProfileImagePress = () => {
    Alert.alert(
      "Profile Picture",
      "Choose how you'd like to update your profile picture:",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Take Photo", onPress: handleTakePhoto },
        { text: "Choose from Library", onPress: handleImagePick },
      ]
    );
  };

  const handleImagePick = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to add images.",
          [{ text: "OK" }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        await processAndUploadImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera permissions to take photos.",
          [{ text: "OK" }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        await processAndUploadImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const processAndUploadImage = async (imageUri: string) => {
    try {
      setIsUploadingImage(true);

      const compressedResult = await ImageCompressionService.compressForProfile(
        imageUri
      );

      if (compressedResult.originalSize && compressedResult.compressedSize) {
        const stats = ImageCompressionService.getCompressionStats(
          compressedResult.originalSize,
          compressedResult.compressedSize
        );
        console.log(
          `Image compressed: ${stats.originalSize} → ${stats.compressedSize} (${stats.percentage}% reduction)`
        );
      }

      console.log("Uploading image to Firebase Storage...");
      await updateUserProfile({ profileImageUrl: compressedResult.uri });

      Alert.alert("Success", "Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to update profile picture"
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleLogout = () => {
    setAlertVisible({
      title: "Log out?",
      body: "Are you sure you want to log out?",
      isDanger: true,
    });
    setOnConfirm(async () => {
      await logoutUser();
      router.replace("/(auth)/login");
    });
  };

  return (
    <ScreenComponent style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={handleProfileImagePress}
          style={styles.imageContainer}
        >
          <Image
            source={
              userProfile?.profileImageUrl
                ? {
                    uri: userProfile.profileImageUrl,
                  }
                : require("@/assets/images/logo.png")
            }
            style={styles.img}
          />
          {isUploadingImage && (
            <View style={styles.uploadingOverlay}>
              <View style={styles.uploadingIndicator}>
                <Typo size={12} style={styles.uploadingText}>
                  Uploading...
                </Typo>
              </View>
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={16} color={colors.white} />
          </View>
        </TouchableOpacity>
        <View style={{ gap: spacingY._7, alignItems: "center" }}>
          <Typo size={22} style={styles.name}>
            {userProfile?.displayName || user?.email?.split("@")[0]}
          </Typo>
          <Typo size={16} style={{ color: colors.textGray, fontWeight: "500" }}>
            {user?.email}
          </Typo>
          <View
            style={[
              styles.roleContainer,
              {
                backgroundColor: isAdmin()
                  ? colors.primary
                  : colors.lightPurple,
              },
            ]}
          >
            <Typo
              size={12}
              style={[
                styles.roleText,
                { color: isAdmin() ? colors.white : colors.purple },
              ]}
            >
              {userProfile?.role?.toUpperCase() || "USER"}
            </Typo>
          </View>
        </View>
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          marginBottom: "35%",
        }}
      >
        {canUpload() || isAdmin() ? (
          <View style={styles.bottomContainer}>
            {canUpload() && (
              <Row
                title={"Import Supplies"}
                iconColor={colors.lightPrimary}
                icon={
                  <FontAwesome6 name="file-import" size={24} color="black" />
                }
                index={0}
                onPress={handleImportSupplies}
              />
            )}
            {isAdmin() && (
              <Row
                title={"Manage Permissions"}
                iconColor={colors.lightPrimary}
                icon={<Ionicons name="people" size={24} color={"black"} />}
                index={2}
                onPress={handleManagePermissions}
              />
            )}
          </View>
        ) : (
          <View />
        )}

        <View style={styles.bottomContainer}>
          <Row
            title={"Log out"}
            iconColor={"#fbdbe6"}
            icon={<AntDesign name="logout" size={24} color="black" />}
            index={5}
            onPress={handleLogout}
          />
        </View>
      </View>
    </ScreenComponent>
  );
}

const Row = ({ icon, title, iconColor, onPress }: RowProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Animated.View style={styles.row}>
        <View
          style={{
            backgroundColor: iconColor,
            padding: spacingY._10,
            borderRadius: radius._12,
          }}
        >
          {icon}
        </View>
        <Typo
          size={16}
          style={{
            fontWeight: "500",
            flex: 1,
            color: colors.black,
          }}
        >
          {title}
        </Typo>
        {<Octicons name="chevron-right" size={24} color="black" />}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacingX._20,
    backgroundColor: colors.lightPrimary,
  },
  topRow: {
    marginBottom: normalizeY(25),
    alignItems: "center",
    gap: spacingX._10,
    marginTop: "15%",
  },
  imageContainer: {
    position: "relative",
  },
  img: {
    height: normalizeY(110),
    width: normalizeY(110),
    borderRadius: normalizeY(60),
    borderWidth: normalizeY(3),
    borderColor: colors.primary,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: normalizeY(15),
    width: normalizeY(30),
    height: normalizeY(30),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: normalizeY(60),
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingIndicator: {
    backgroundColor: colors.white,
    paddingHorizontal: spacingX._10,
    paddingVertical: spacingY._5,
    borderRadius: radius._6,
  },
  uploadingText: {
    color: colors.black,
    fontWeight: "600",
  },
  roleContainer: {
    paddingHorizontal: spacingX._10,
    paddingVertical: spacingY._4,
    borderRadius: radius._12,
  },
  roleText: {
    fontWeight: "600",
    fontSize: 10,
  },
  name: {
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
    paddingVertical: spacingY._10,
    paddingRight: spacingX._5,
  },
  disabledRow: {
    opacity: 0.6,
  },
  line: {
    height: 0.8,
    width: "95%",
    backgroundColor: "rgba(0,0,0,0.1)",
    alignSelf: "center",
  },
  bottomContainer: {
    backgroundColor: colors.white,
    borderRadius: spacingY._20,
    shadowColor: colors.black,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    padding: spacingY._15,
    paddingVertical: spacingY._5,
  },
});

export default ProfileScreen;
