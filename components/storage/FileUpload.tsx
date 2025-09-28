import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { storageUtils, UploadProgress } from "../../services/storage";

interface FileUploadProps {
  onUploadComplete?: (downloadURL: string) => void;
  onUploadError?: (error: string) => void;
  uploadType: "avatar" | "document" | "image";
  style?: any;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onUploadError,
  uploadType,
  style,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { user } = useAuth();

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to upload images."
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:
        uploadType === "document"
          ? ImagePicker.MediaTypeOptions.All
          : ImagePicker.MediaTypeOptions.Images,
      allowsEditing: uploadType === "avatar",
      aspect: uploadType === "avatar" ? [1, 1] : undefined,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      await uploadFile(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera permissions to take photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: uploadType === "avatar",
      aspect: uploadType === "avatar" ? [1, 1] : undefined,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      await uploadFile(result.assets[0].uri);
    }
  };

  const uploadFile = async (uri: string) => {
    if (!user) {
      onUploadError?.("User not authenticated");
      return;
    }

    setUploading(true);
    setUploadProgress(null);

    try {
      // Convert URI to blob for upload
      const response = await fetch(uri);
      const blob = await response.blob();

      let result;

      const progressCallback = (progress: UploadProgress) => {
        setUploadProgress(progress);
      };

      switch (uploadType) {
        case "avatar":
          result = await storageUtils.uploadAvatar(
            user.uid,
            blob,
            progressCallback
          );
          break;
        case "image":
          result = await storageUtils.uploadPostImage(
            user.uid,
            `temp_${Date.now()}`, // This should be replaced with actual post ID
            blob,
            progressCallback
          );
          break;
        case "document":
          const fileName = uri.split("/").pop() || "document";
          result = await storageUtils.uploadDocument(
            user.uid,
            blob,
            fileName,
            blob.type || "application/octet-stream",
            progressCallback
          );
          break;
        default:
          throw new Error("Invalid upload type");
      }

      onUploadComplete?.(result.downloadURL);
      Alert.alert("Success", "File uploaded successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      onUploadError?.(errorMessage);
      Alert.alert("Upload Error", errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const showImagePicker = () => {
    Alert.alert("Select Image", "Choose how you want to select an image", [
      { text: "Camera", onPress: takePhoto },
      { text: "Photo Library", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View style={[styles.container, style]}>
      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={styles.preview} />
      )}

      {uploading ? (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.uploadingText}>Uploading...</Text>
          {uploadProgress && (
            <Text style={styles.progressText}>
              {uploadProgress.progress.toFixed(0)}% Complete
            </Text>
          )}
        </View>
      ) : (
        <TouchableOpacity style={styles.uploadButton} onPress={showImagePicker}>
          <Text style={styles.uploadButtonText}>
            {uploadType === "avatar"
              ? "Upload Avatar"
              : uploadType === "image"
              ? "Upload Image"
              : "Upload File"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
  },
  preview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 150,
  },
  uploadButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  uploadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  uploadingText: {
    fontSize: 16,
    marginTop: 10,
    color: "#666",
  },
  progressText: {
    fontSize: 14,
    marginTop: 5,
    color: "#007AFF",
  },
});
