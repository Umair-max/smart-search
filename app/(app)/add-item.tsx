import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import AppButton from "@/components/AppButton";
import ScreenComponent from "@/components/ScreenComponent";
import { MedicalSupply } from "@/components/SupplyCard";
import Typo from "@/components/Typo";
import colors from "@/config/colors";
import { radius, spacingX, spacingY, width } from "@/config/spacing";
import SuppliesFirestoreService from "@/services/suppliesFirestoreService";
import { useAuthStore } from "@/store/authStore";
import useSuppliesStore from "@/store/suppliesStore";
import { normalizeY } from "@/utils/normalize";
import { Image } from "expo-image";

const { height } = Dimensions.get("window");

export default function AddItemScreen() {
  const { user } = useAuthStore();
  const { supplies, setSupplies } = useSuppliesStore();

  // State management for new item
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Create new item state with default values
  const [newItem, setNewItem] = useState<MedicalSupply>({
    Store: 0, // Empty store number (0 as placeholder)
    StoreName: "", // Empty store name
    ProductCode: "",
    ProductDescription: "",
    Category: "",
    UOM: "",
    expiryDate: undefined,
    imageUrl: undefined,
  });

  // Check if form is valid (required fields filled)
  const isFormValid =
    newItem.ProductCode.trim() && newItem.ProductDescription.trim();

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

  const handleDateChange = (date: Date) => {
    setShowDatePicker(false);
    setSelectedDate(date);
    setNewItem({ ...newItem, expiryDate: date.toISOString() });
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const hideDatePickerModal = () => {
    setShowDatePicker(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No expiry date set";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const isExpired = (dateString?: string) => {
    if (!dateString) return false;
    const expiryDate = new Date(dateString);
    const today = new Date();
    return expiryDate < today;
  };

  const isNearExpiry = (dateString?: string) => {
    if (!dateString) return false;
    const expiryDate = new Date(dateString);
    const today = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(today.getMonth() + 1);
    return expiryDate > today && expiryDate <= oneMonthFromNow;
  };

  const handleSave = async () => {
    if (!user?.email) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    // Validate required fields
    if (!newItem.ProductCode.trim()) {
      Alert.alert("Validation Error", "Product Code is required");
      return;
    }

    if (!newItem.ProductDescription.trim()) {
      Alert.alert("Validation Error", "Product Description is required");
      return;
    }

    // Check for duplicate product code
    const existingItem = supplies.find(
      (s) => s.ProductCode.toLowerCase() === newItem.ProductCode.toLowerCase()
    );
    if (existingItem) {
      Alert.alert(
        "Duplicate Product Code",
        `Product code "${newItem.ProductCode}" already exists. Please use a different code.`,
        [{ text: "OK" }]
      );
      return;
    }

    setIsSaving(true);

    try {
      // Create the item to save
      const itemToSave = {
        ...newItem,
        ...(imageUri && { imageUrl: imageUri }),
      };

      console.log("Saving new item:", itemToSave);

      // Create new supply in Firestore
      await SuppliesFirestoreService.updateSupply(itemToSave, user.email);

      // Add to local store
      setSupplies([...supplies, itemToSave]);

      Alert.alert("Success! 🎉", "New item added successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error adding new supply:", error);
      Alert.alert(
        "Save Error",
        `Failed to add new item: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      const timeout = setTimeout(() => {
        setIsSaving(false);
      }, 200);
      return () => clearTimeout(timeout);
    }
  };

  const handleBack = () => {
    if (isFormValid || imageUri) {
      Alert.alert(
        "Discard Changes",
        "Are you sure you want to discard this new item?",
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
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Typo size={20} style={styles.headerTitle}>
          Add New Item
        </Typo>
        <View style={styles.headerRight} />
      </View>

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
          <TouchableOpacity
            style={styles.imageEditButton}
            onPress={showImagePicker}
          >
            <Ionicons name="camera" size={16} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={{ height: spacingY._20 }} />
        <ScrollView
          style={styles.detailsScrollView}
          contentContainerStyle={styles.detailsScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Product Code */}
          <View style={styles.fieldContainer}>
            <Typo size={14} style={styles.fieldLabel}>
              Product Code *
            </Typo>
            <TextInput
              style={styles.textInput}
              value={newItem.ProductCode}
              onChangeText={(text) =>
                setNewItem({ ...newItem, ProductCode: text })
              }
              placeholder="Enter product code"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="characters"
            />
          </View>

          {/* Product Description */}
          <View style={styles.fieldContainer}>
            <Typo size={14} style={styles.fieldLabel}>
              Description *
            </Typo>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={newItem.ProductDescription}
              onChangeText={(text) =>
                setNewItem({ ...newItem, ProductDescription: text })
              }
              placeholder="Enter product description"
              placeholderTextColor={colors.placeholder}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Category */}
          <View style={styles.fieldContainer}>
            <Typo size={14} style={styles.fieldLabel}>
              Category
            </Typo>
            <TextInput
              style={styles.textInput}
              value={newItem.Category}
              onChangeText={(text) =>
                setNewItem({ ...newItem, Category: text })
              }
              placeholder="Enter category"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          {/* Store Name */}
          <View style={styles.fieldContainer}>
            <Typo size={14} style={styles.fieldLabel}>
              Store Name
            </Typo>
            <TextInput
              style={styles.textInput}
              value={newItem.StoreName}
              onChangeText={(text) =>
                setNewItem({ ...newItem, StoreName: text })
              }
              placeholder="Enter store name"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          {/* Unit of Measure */}
          <View style={styles.fieldContainer}>
            <Typo size={14} style={styles.fieldLabel}>
              Unit of Measure
            </Typo>
            <TextInput
              style={styles.textInput}
              value={newItem.UOM}
              onChangeText={(text) => setNewItem({ ...newItem, UOM: text })}
              placeholder="Enter unit of measure"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          {/* Expiry Date */}
          <View style={styles.fieldContainer}>
            <Typo size={14} style={styles.fieldLabel}>
              Expiry Date
            </Typo>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={showDatePickerModal}
            >
              <Typo
                size={16}
                style={[
                  styles.datePickerText,
                  !newItem.expiryDate && styles.datePickerPlaceholder,
                  isExpired(newItem.expiryDate) && styles.expiredText,
                  isNearExpiry(newItem.expiryDate) && styles.nearExpiryText,
                ]}
              >
                {formatDate(newItem.expiryDate)}
              </Typo>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Store Number */}
          <View style={styles.fieldContainer}>
            <Typo size={14} style={styles.fieldLabel}>
              Store Number
            </Typo>
            <TextInput
              style={styles.textInput}
              value={newItem.Store.toString()}
              onChangeText={(text) => {
                const numValue = parseInt(text) || 0;
                setNewItem({ ...newItem, Store: numValue });
              }}
              placeholder="Enter store number"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
            />
          </View>
        </ScrollView>
      </View>

      <View style={styles.actionContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.discardButton]}
            onPress={handleBack}
            disabled={isSaving}
          >
            <Typo size={16} style={styles.discardButtonText}>
              Cancel
            </Typo>
          </TouchableOpacity>

          <AppButton
            label={isSaving ? "Saving..." : "Add Item"}
            onPress={handleSave}
            loading={isSaving}
            disabled={!isFormValid || isSaving}
            style={styles.saveButton}
          />
        </View>
      </View>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        date={selectedDate || new Date()}
        onConfirm={handleDateChange}
        onCancel={hideDatePickerModal}
        textColor={colors.black}
        accentColor={colors.primary}
      />
    </ScreenComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._15,
    backgroundColor: colors.lightPrimary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacingY._5,
  },
  backButton: {
    padding: spacingY._10,
  },
  headerTitle: {
    fontWeight: "600",
    color: colors.black,
  },
  headerRight: {
    width: 40, // Same width as back button for centering
  },
  imageSection: {
    alignItems: "center",
    marginBottom: spacingY._15,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: height * 0.25,
    borderRadius: radius._15,
    overflow: "hidden",
    backgroundColor: colors.lightGray,
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius._20,
    shadowColor: colors.black,
    shadowOffset: { height: -3, width: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    width: width,
    alignSelf: "center",
  },
  detailsScrollView: {
    flex: 1,
  },
  detailsScrollContent: {
    paddingBottom: 100,
    paddingHorizontal: spacingY._20,
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
    height: normalizeY(45),
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
    height: normalizeY(45),
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: radius._10,
    padding: spacingY._12,
    backgroundColor: colors.white,
  },
  datePickerText: {
    color: colors.black,
  },
  datePickerPlaceholder: {
    color: colors.placeholder,
  },
  expiredText: {
    color: colors.error,
    fontWeight: "600",
  },
  nearExpiryText: {
    color: colors.warning,
    fontWeight: "600",
  },
  expiryWarning: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacingY._4,
    gap: spacingX._4,
  },
  expiredLabel: {
    color: colors.error,
    fontWeight: "600",
    fontSize: 10,
  },
  nearExpiryLabel: {
    color: colors.warning,
    fontWeight: "600",
    fontSize: 10,
  },
});
