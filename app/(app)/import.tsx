import AppButton from "@/components/AppButton";
import { MedicalSupply } from "@/components/MedicalSupplyItem";
import MedicalSupplyList from "@/components/MedicalSupplyList";
import ScreenComponent from "@/components/ScreenComponent";
import Typo from "@/components/Typo";
import colors from "@/config/colors";
import { radius, spacingX, spacingY } from "@/config/spacing";
import SuppliesFirestoreService, {
  DuplicateCheckResult,
} from "@/services/suppliesFirestoreService";
import { useAuthStore } from "@/store/authStore";
import useSuppliesStore from "@/store/suppliesStore";
import ExcelImportService from "@/utils/excelImport";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { FileArrowUpIcon, PaperPlaneTiltIcon } from "phosphor-react-native";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface ImportStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export default function ImportScreen() {
  const { user } = useAuthStore();
  const {
    addSupplies,
    isLoading,
    setLoading,
    getTotalCount,
    fetchFromFirestore,
  } = useSuppliesStore();

  const first2Items = [
    {
      Category: "MEDICAL CONSUMABLES",
      ProductCode: "MC04020055",
      ProductDescription: "CANNULA, O2, NASAL, ADULT",
      Store: 75,
      StoreName: "WH. Main medical supplies store",
      UOM: "EACH",
    },
    {
      Category: "MEDICAL CONSUMABLES",
      ProductCode: "MC04030173",
      ProductDescription: "CATHETER, UMBILICAL, PUR 2.5FR, VYGON, 1270-02",
      Store: 75,
      StoreName: "WH. Main medical supplies store",
      UOM: "EACH",
    },
  ];

  const importSteps = [
    {
      id: 1,
      title: "Select File",
      description: "Choose Excel file to import",
      completed: false,
      current: true,
    },
    {
      id: 2,
      title: "Preview Data",
      description: "Review imported items",
      completed: false,
      current: false,
    },
    {
      id: 3,
      title: "Upload",
      description: "Save to database",
      completed: false,
      current: false,
    },
  ];

  const [excelData, setExcelData] = useState<MedicalSupply[]>([]);
  const [duplicateResult, setDuplicateResult] =
    useState<DuplicateCheckResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [fileSelected, setFileSelected] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
    percentage: 0,
  });
  const [isUploading, setIsUploading] = useState(false);

  const progressValue = useSharedValue(0);

  const handleFileSelection = async () => {
    try {
      setLoading(true);

      Alert.alert(
        "Import Excel File",
        `Select an Excel file (.xlsx, .xls) with medical supplies data.\n\nSupported columns:\n${ExcelImportService.getSampleFormat().join(
          "\n"
        )}`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Choose File",
            onPress: async () => {
              const result = await ExcelImportService.importFromExcel();

              if (result.success && result.data) {
                setExcelData(result.data);
                setFileSelected(true);
                await analyzeForDuplicates(result.data);
              } else {
                Alert.alert(
                  "Import Failed",
                  result.error || "Failed to parse Excel file",
                  [{ text: "OK" }]
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to process file selection");
    } finally {
      setLoading(false);
    }
  };

  const analyzeForDuplicates = async (excelData: MedicalSupply[]) => {
    try {
      if (!user?.email) throw new Error("User not authenticated");

      console.log(
        "Analyzing",
        excelData.length,
        "items for duplicates using local store..."
      );

      // Get existing supplies from the store (already fetched)
      const existingSupplies = useSuppliesStore.getState().supplies;
      const existingProductCodes = new Set(
        existingSupplies.map((s) => s.ProductCode)
      );

      console.log("Existing items in store:", existingSupplies.length);

      // Check duplicates against local store data
      const newItems: MedicalSupply[] = [];
      const existingItems: MedicalSupply[] = [];

      excelData.forEach((supply) => {
        if (existingProductCodes.has(supply.ProductCode)) {
          existingItems.push(supply);
        } else {
          newItems.push(supply);
        }
      });

      const duplicateResult: DuplicateCheckResult = {
        newItems,
        existingItems,
        totalNew: newItems.length,
        totalExisting: existingItems.length,
      };

      console.log("Local duplicate analysis result:", {
        newItems: duplicateResult.totalNew,
        existingItems: duplicateResult.totalExisting,
        total: excelData.length,
      });

      setDuplicateResult(duplicateResult);
      setShowPreview(true);
    } catch (error) {
      console.error("Error analyzing duplicates:", error);
      Alert.alert("Error", "Failed to analyze data for duplicates");
    }
  };

  const resetImport = () => {
    setDuplicateResult(null);
    setShowPreview(false);
    setExcelData([]);
    setFileSelected(false);
    setUploadProgress({ current: 0, total: 0, percentage: 0 });
    setIsUploading(false);
    progressValue.value = withTiming(0);
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value}%`,
  }));

  const renderStepItem = ({ item }: { item: ImportStep }) => (
    <View style={styles.stepItem}>
      <View
        style={[
          styles.stepIndicator,
          item.completed && styles.stepCompleted,
          item.current && styles.stepCurrent,
        ]}
      >
        {item.completed ? (
          <Ionicons name="checkmark" size={16} color={colors.white} />
        ) : (
          <Typo
            size={12}
            style={[
              styles.stepNumber,
              { color: item.current ? colors.white : colors.textGray },
            ]}
          >
            {item.id}
          </Typo>
        )}
      </View>
      <View style={styles.stepContent}>
        <Typo
          size={14}
          style={[styles.stepTitle, item.current && styles.currentStepTitle]}
        >
          {item.title}
        </Typo>
        <Typo size={12} style={styles.stepDescription}>
          {item.description}
        </Typo>
      </View>
    </View>
  );

  const handleUploadToFirestore = async () => {
    if (!duplicateResult || !user?.email) return;

    setLoading(true);
    setIsUploading(true);
    const startTime = Date.now();

    try {
      const itemsToUpload = duplicateResult.newItems;
      const totalItems = itemsToUpload.length;

      setUploadProgress({ current: 0, total: totalItems, percentage: 0 });

      console.log("Starting upload of", totalItems, "items");

      const { importSupplies } = SuppliesFirestoreService;
      const result = await importSupplies(
        itemsToUpload,
        user.email,
        true,
        (progress) => {
          setUploadProgress(progress);
          console.log(
            `Upload progress: ${progress.current}/${progress.total} (${progress.percentage}%)`
          );
        }
      );

      const endTime = Date.now();
      const uploadDuration = ((endTime - startTime) / 1000).toFixed(1);

      console.log("Import result:", result);
      console.log(`Upload completed in ${uploadDuration} seconds`);

      if (result.errors.length > 0) {
        Alert.alert(
          "Upload Completed with Warnings",
          `Successfully uploaded ${
            result.newItems + result.updatedItems
          } items in ${uploadDuration}s\n\n${
            result.errors.length
          } items had errors. Check console for details.`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Upload Successful! 🎉",
          `Successfully uploaded ${
            result.newItems + result.updatedItems
          } items to Database in ${uploadDuration} seconds`,
          [
            {
              text: "View Items",
              onPress: () => router.back(),
            },
          ]
        );
      }

      // Fetch updated data from Firebase
      if (result.newItems > 0 || result.updatedItems > 0) {
        console.log("Fetching updated data from Firebase...");
        await fetchFromFirestore();
      }

      // Reset form
      setFileSelected(false);
      setExcelData([]);
      setDuplicateResult(null);
      setUploadProgress({ current: 0, total: 0, percentage: 0 });
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert(
        "Upload Error",
        `Failed to upload items to database: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  return (
    <ScreenComponent style={styles.container}>
      <BlurView
        intensity={100}
        tint="extraLight"
        style={styles.blurContainer}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Typo size={20} style={styles.headerTitle}>
          Import Supplies
        </Typo>
        <TouchableOpacity onPress={resetImport} style={styles.resetButton}>
          <MaterialIcons name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
      </View>

      {!fileSelected && (
        <View style={styles.stepsContainer}>
          <FlatList
            data={importSteps}
            renderItem={renderStepItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>
      )}

      {duplicateResult && (
        <View style={styles.resultsContainer}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: colors.primary + "20" },
                ]}
              >
                <Ionicons name="add-circle" size={24} color={colors.primary} />
              </View>
              <View>
                <Typo size={20} style={styles.statNumber}>
                  {duplicateResult.totalNew}
                </Typo>
                <Typo size={12} style={styles.statLabel}>
                  New Items
                </Typo>
              </View>
            </View>

            <View style={styles.statItem}>
              <View
                style={[
                  styles.statIcon,
                  {
                    backgroundColor:
                      duplicateResult.totalExisting > 0
                        ? "#FF9500" + "20"
                        : colors.lightPrimary + "40",
                  },
                ]}
              >
                <Ionicons
                  name={
                    duplicateResult.totalExisting > 0 ? "duplicate" : "time"
                  }
                  size={24}
                  color={
                    duplicateResult.totalExisting > 0
                      ? "#FF9500"
                      : colors.primary
                  }
                />
              </View>
              <View>
                <Typo size={20} style={styles.statNumber}>
                  {duplicateResult.totalExisting > 0
                    ? duplicateResult.totalExisting
                    : `~${Math.ceil((duplicateResult.totalNew / 500) * 0.5)}m`}
                </Typo>
                <Typo size={12} style={styles.statLabel}>
                  {duplicateResult.totalExisting > 0
                    ? "Duplicates"
                    : "Est. Time"}
                </Typo>
              </View>
            </View>
          </View>
        </View>
      )}

      {duplicateResult && duplicateResult.totalExisting > 0 && (
        <View style={[styles.resultsContainer, { backgroundColor: "#FFF3E0" }]}>
          <View style={styles.duplicateWarning}>
            <Ionicons name="warning" size={20} color="#FF9500" />
            <Typo size={14} style={styles.duplicateText}>
              {duplicateResult.totalExisting} duplicate items found and will be
              skipped
            </Typo>
          </View>
        </View>
      )}
      <>
        {duplicateResult && duplicateResult?.totalNew > 0 && (
          <>
            <View style={styles.previewHeader}>
              <Typo size={16} style={styles.previewTitle}>
                Preview New Items ({duplicateResult?.totalNew} new
                {duplicateResult?.totalExisting > 0
                  ? `, ${duplicateResult.totalExisting} duplicates skipped`
                  : ""}
                )
              </Typo>
            </View>

            <MedicalSupplyList
              data={duplicateResult?.newItems ?? []}
              onItemPress={() => {}}
              emptyTitle="No items to preview"
              emptySubtitle="The Excel file contains no valid items."
            />
          </>
        )}
      </>
      <View style={styles.buttonContainer}>
        {!fileSelected ? (
          <AppButton
            icon={FileArrowUpIcon}
            label="Select Excel File"
            onPress={handleFileSelection}
            loading={isLoading}
            disabled={isLoading}
          />
        ) : (
          <AppButton
            icon={PaperPlaneTiltIcon}
            iconProps={{ color: colors.black }}
            label={
              isUploading
                ? `Uploading ${uploadProgress.current} of ${uploadProgress.total} items (${uploadProgress.percentage}%)`
                : duplicateResult && duplicateResult.totalNew > 0
                ? `Upload ${duplicateResult.totalNew} New Items to Database`
                : "No New Items to Upload"
            }
            onPress={handleUploadToFirestore}
            loading={isLoading}
            disabled={
              isLoading || !duplicateResult || duplicateResult.totalNew === 0
            }
          />
        )}
      </View>
    </ScreenComponent>
  );
}

const styles = StyleSheet.create({
  container: {
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
    marginBottom: spacingY._10,
  },
  backButton: {
    padding: spacingY._10,
  },
  headerTitle: {
    fontWeight: "600",
    color: colors.black,
  },
  resetButton: {
    padding: spacingY._10,
  },
  progressContainer: {
    marginBottom: spacingY._15,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.lightGray,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  stepsContainer: {
    backgroundColor: colors.white,
    borderRadius: radius._20,
    padding: spacingY._20,
    marginBottom: spacingY._20,
    shadowColor: colors.black,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacingY._15,
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.lightGray,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacingX._15,
  },
  stepCompleted: {
    backgroundColor: colors.primary,
  },
  stepCurrent: {
    backgroundColor: colors.primary,
  },
  stepNumber: {
    color: colors.white,
    fontWeight: "600",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontWeight: "600",
    color: colors.black,
    marginBottom: spacingY._5,
  },
  currentStepTitle: {
    color: colors.primary,
  },
  stepDescription: {
    color: colors.textGray,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    padding: spacingX._20,
    shadowColor: colors.black,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._20,
    borderTopRightRadius: radius._20,
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: radius._15,
    paddingVertical: spacingY._15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacingX._10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: "600",
  },
  resultsContainer: {
    backgroundColor: colors.white,
    borderRadius: radius._20,
    padding: spacingY._15,
    marginBottom: spacingY._10,
    shadowColor: colors.black,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  resultsTitle: {
    fontWeight: "600",
    color: colors.black,
    marginBottom: spacingY._10,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    gap: spacingY._10,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  statNumber: {
    fontWeight: "bold",
    color: colors.black,
    textAlign: "center",
  },
  statLabel: {
    color: colors.textGray,
    textAlign: "center",
  },
  previewHeader: {
    marginBottom: spacingY._10,
  },
  previewTitle: {
    fontWeight: "600",
    color: colors.black,
  },
  importButton: {
    backgroundColor: colors.primary,
    borderRadius: radius._15,
    paddingVertical: spacingY._15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacingX._10,
  },
  duplicateWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
  },
  duplicateText: {
    color: "#FF9500",
    flex: 1,
  },
});
