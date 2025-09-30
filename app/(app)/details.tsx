import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AppButton from "@/components/AppButton";
import { MedicalSupply } from "@/components/MedicalSupplyItem";
import ScreenComponent from "@/components/ScreenComponent";
import Typo from "@/components/Typo";
import colors from "@/config/colors";
import { radius, spacingX, spacingY } from "@/config/spacing";
import SuppliesFirestoreService from "@/services/suppliesFirestoreService";
import { useAuthStore } from "@/store/authStore";
import useSuppliesStore from "@/store/suppliesStore";

export default function DetailsScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  const { updateSupply, supplies } = useSuppliesStore();

  // Parse the item from params
  const initialItem: MedicalSupply = {
    ProductCode: (params.productCode as string) || "",
    ProductDescription: (params.productDescription as string) || "",
    Category: (params.category as string) || "",
    Store: Number(params.store) || 0,
    StoreName: (params.storeName as string) || "",
    UOM: (params.uom as string) || "",
    imageUrl: (params.imageUrl as string) || undefined,
  };

  // State management
  const [item, setItem] = useState<MedicalSupply>(initialItem);
  const [imageUri, setImageUri] = useState<string | null>(
    initialItem.imageUrl || null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Track changes
  useEffect(() => {
    const hasItemChanges =
      item.ProductCode !== initialItem.ProductCode ||
      item.ProductDescription !== initialItem.ProductDescription ||
      item.Category !== initialItem.Category ||
      item.StoreName !== initialItem.StoreName ||
      item.UOM !== initialItem.UOM ||
      imageUri !== (initialItem.imageUrl || null);

    setHasChanges(hasItemChanges);
  }, [item, imageUri, initialItem]);

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
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
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
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const showImagePicker = () => {
    Alert.alert("Select Image", "Choose how you'd like to add an image:", [
      { text: "Cancel", style: "cancel" },
      { text: "Take Photo", onPress: handleTakePhoto },
      { text: "Choose from Library", onPress: handleImagePick },
    ]);
  };

  const handleSave = async () => {
    if (!user?.email) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    // Validate required fields
    if (!item.ProductCode.trim()) {
      Alert.alert("Validation Error", "Product Code is required");
      return;
    }

    if (!item.ProductDescription.trim()) {
      Alert.alert("Validation Error", "Product Description is required");
      return;
    }

    setIsSaving(true);

    try {
      // Check if ProductCode changed
      const productCodeChanged = item.ProductCode !== initialItem.ProductCode;

      if (productCodeChanged) {
        // Check if new ProductCode already exists
        const existingItem = supplies.find(
          (s) => s.ProductCode === item.ProductCode
        );
        if (existingItem) {
          Alert.alert(
            "Duplicate Product Code",
            `Product code "${item.ProductCode}" already exists. Please use a different code.`,
            [{ text: "OK" }]
          );
          setIsSaving(false);
          return;
        }

        // Delete old document and create new one
        await SuppliesFirestoreService.deleteSupply(initialItem.ProductCode);
        const updatedItem = { ...item, imageUrl: imageUri || undefined };
        await SuppliesFirestoreService.updateSupply(updatedItem, user.email);
      } else {
        // Just update the existing document
        const updatedItem = { ...item, imageUrl: imageUri || undefined };
        await SuppliesFirestoreService.updateSupply(updatedItem, user.email);
      }

      // Update local store
      updateSupply(item);

      Alert.alert("Success! 🎉", "Item details updated successfully", [
        {
          text: "OK",
          onPress: () => {
            setIsEditing(false);
            setHasChanges(false);
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error("Error updating supply:", error);
      Alert.alert(
        "Save Error",
        `Failed to update item: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    Alert.alert(
      "Discard Changes",
      "Are you sure you want to discard all changes?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            setItem(initialItem);
            setImageUri(initialItem.imageUrl || null);
            setIsEditing(false);
            setHasChanges(false);
          },
        },
      ]
    );
  };

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. What would you like to do?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
          { text: "Save", onPress: handleSave },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <ScreenComponent style={styles.container}>
      <BlurView
        intensity={100}
        tint="extraLight"
        style={styles.blurContainer}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Typo size={20} style={styles.headerTitle}>
          Item Details
        </Typo>
        <TouchableOpacity
          onPress={() => setIsEditing(!isEditing)}
          style={styles.editButton}
        >
          <Ionicons
            name={isEditing ? "close" : "pencil"}
            size={20}
            color={isEditing ? colors.error : colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Section */}
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.itemImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="image" size={40} color={colors.midGray} />
                <Typo size={12} style={styles.placeholderText}>
                  No Image
                </Typo>
              </View>
            )}
            {isEditing && (
              <TouchableOpacity
                style={styles.imageEditButton}
                onPress={showImagePicker}
              >
                <Ionicons name="camera" size={16} color={colors.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          {/* Product Code */}
          <View style={styles.fieldContainer}>
            <Typo size={14} style={styles.fieldLabel}>
              Product Code *
            </Typo>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={item.ProductCode}
                onChangeText={(text) => setItem({ ...item, ProductCode: text })}
                placeholder="Enter product code"
                placeholderTextColor={colors.placeholder}
              />
            ) : (
              <View style={styles.fieldValue}>
                <Typo size={16} style={styles.valueText}>
                  {item.ProductCode}
                </Typo>
              </View>
            )}
          </View>

          {/* Product Description */}
          <View style={styles.fieldContainer}>
            <Typo size={14} style={styles.fieldLabel}>
              Description *
            </Typo>
            {isEditing ? (
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={item.ProductDescription}
                onChangeText={(text) =>
                  setItem({ ...item, ProductDescription: text })
                }
                placeholder="Enter product description"
                placeholderTextColor={colors.placeholder}
                multiline
                numberOfLines={3}
              />
            ) : (
              <View style={styles.fieldValue}>
                <Typo size={16} style={styles.valueText}>
                  {item.ProductDescription}
                </Typo>
              </View>
            )}
          </View>

          {/* Category */}
          <View style={styles.fieldContainer}>
            <Typo size={14} style={styles.fieldLabel}>
              Category
            </Typo>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={item.Category}
                onChangeText={(text) => setItem({ ...item, Category: text })}
                placeholder="Enter category"
                placeholderTextColor={colors.placeholder}
              />
            ) : (
              <View style={styles.fieldValue}>
                <Typo size={16} style={styles.valueText}>
                  {item.Category}
                </Typo>
              </View>
            )}
          </View>

          {/* Store Location */}
          <View style={styles.fieldContainer}>
            <Typo size={14} style={styles.fieldLabel}>
              Store Location
            </Typo>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={item.StoreName}
                onChangeText={(text) => setItem({ ...item, StoreName: text })}
                placeholder="Enter store location"
                placeholderTextColor={colors.placeholder}
              />
            ) : (
              <View style={styles.fieldValue}>
                <Typo size={16} style={styles.valueText}>
                  {item.StoreName}
                </Typo>
              </View>
            )}
          </View>

          {/* Unit of Measure */}
          <View style={styles.fieldContainer}>
            <Typo size={14} style={styles.fieldLabel}>
              Unit of Measure
            </Typo>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={item.UOM}
                onChangeText={(text) => setItem({ ...item, UOM: text })}
                placeholder="Enter unit of measure"
                placeholderTextColor={colors.placeholder}
              />
            ) : (
              <View style={styles.fieldValue}>
                <Typo size={16} style={styles.valueText}>
                  {item.UOM}
                </Typo>
              </View>
            )}
          </View>

          {/* Store Number (Read-only) */}
          <View style={styles.fieldContainer}>
            <Typo size={14} style={styles.fieldLabel}>
              Store Number
            </Typo>
            <View style={[styles.fieldValue, styles.readOnlyField]}>
              <Typo size={16} style={[styles.valueText, styles.readOnlyText]}>
                {item.Store}
              </Typo>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {isEditing && (
        <View style={styles.actionContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.discardButton]}
              onPress={handleDiscard}
              disabled={isSaving}
            >
              <Typo size={16} style={styles.discardButtonText}>
                Discard
              </Typo>
            </TouchableOpacity>

            <AppButton
              label={isSaving ? "Saving..." : "Save Changes"}
              onPress={handleSave}
              loading={isSaving}
              disabled={!hasChanges || isSaving}
              style={styles.saveButton}
            />
          </View>
        </View>
      )}
    </ScreenComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
  },
  blurContainer: {
    paddingTop: 0,
    padding: spacingY._20,
    paddingBottom: "10%",
    textAlign: "center",
    overflow: "hidden",
    borderRadius: radius._20,
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacingY._20,
  },
  backButton: {
    padding: spacingY._10,
  },
  headerTitle: {
    fontWeight: "600",
    color: colors.black,
  },
  editButton: {
    padding: spacingY._10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageSection: {
    alignItems: "center",
    marginBottom: spacingY._30,
  },
  imageContainer: {
    position: "relative",
    width: 200,
    height: 150,
    borderRadius: radius._15,
    overflow: "hidden",
    backgroundColor: colors.lightGray,
  },
  itemImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.buttonGrey,
  },
  placeholderText: {
    color: colors.midGray,
    marginTop: spacingY._5,
  },
  imageEditButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsSection: {
    backgroundColor: colors.white,
    borderRadius: radius._20,
    padding: spacingY._20,
    shadowColor: colors.black,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  fieldContainer: {
    marginBottom: spacingY._20,
  },
  fieldLabel: {
    fontWeight: "600",
    color: colors.black,
    marginBottom: spacingY._8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: radius._10,
    padding: spacingY._12,
    fontSize: 16,
    color: colors.black,
    backgroundColor: colors.white,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  fieldValue: {
    backgroundColor: colors.buttonGrey,
    borderRadius: radius._10,
    padding: spacingY._12,
    minHeight: 44,
    justifyContent: "center",
  },
  valueText: {
    color: colors.black,
  },
  readOnlyField: {
    backgroundColor: colors.lightGray,
  },
  readOnlyText: {
    color: colors.textGray,
  },
  actionContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._20,
    borderTopRightRadius: radius._20,
    padding: spacingX._20,
    shadowColor: colors.black,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacingX._15,
  },
  actionButton: {
    flex: 1,
    height: 50,
    borderRadius: radius._15,
    alignItems: "center",
    justifyContent: "center",
  },
  discardButton: {
    backgroundColor: colors.buttonGrey,
    borderWidth: 1,
    borderColor: colors.midGray,
  },
  discardButtonText: {
    color: colors.textGray,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
  },
});
