import ScreenComponent from "@/components/ScreenComponent";
import Typo from "@/components/Typo";
import colors from "@/config/colors";
import { radius, spacingX, spacingY } from "@/config/spacing";
import useAlertStore from "@/store/alertStore";
import { useAuthStore } from "@/store/authStore";
import useSuppliesStore from "@/store/suppliesStore";
import ExcelImportService from "@/utils/excelImport";
import { normalizeY } from "@/utils/normalize";
import {
  AntDesign,
  FontAwesome6,
  Ionicons,
  Octicons,
} from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React from "react";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";

interface RowProps {
  icon: any;
  title: string;
  iconColor: string;
  index: number;
  onPress?: () => void;
  isLoading?: boolean;
}

function ProfileScreen() {
  const { setAlertVisible, setOnConfirm } = useAlertStore();
  const { user, logoutUser, loading } = useAuthStore();
  const { addSupplies, setLoading, isLoading, getTotalCount } =
    useSuppliesStore();

  const handleImportSupplies = async () => {
    try {
      setLoading(true);

      Alert.alert(
        "Import Excel File",
        `Please select an Excel file (.xlsx, .xls) with columns:\n\n${ExcelImportService.getSampleFormat().join(
          "\n"
        )}\n\nRequired fields are marked with *`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Choose File",
            onPress: async () => {
              const result = await ExcelImportService.importFromExcel();
              console.log("Import result:", result);
              if (result.success && result.data) {
                addSupplies(result.data);
                Alert.alert(
                  "Import Successful!",
                  `Successfully imported ${
                    result.count
                  } supplies.\n\nTotal supplies in store: ${
                    getTotalCount() + (result.count || 0)
                  }`,
                  [{ text: "OK" }]
                );
              } else {
                Alert.alert(
                  "Import Failed",
                  result.error || "Unknown error occurred",
                  [{ text: "OK" }]
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Import Error",
        "An unexpected error occurred during import",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
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
      <BlurView
        intensity={100}
        tint="extraLight"
        style={styles.blurContainer}
      />

      <View style={styles.topRow}>
        <Image
          source={{
            uri: "https://img.freepik.com/free-photo/handsome-smiling-man-looking-with-disbelief_176420-19591.jpg?t=st=1723641040~exp=1723644640~hmac=aef27975e23ff9df20ea1f41d340106576264a0d6c9400a220ad615579e1340b&w=740",
          }}
          style={styles.img}
        />
        <View style={{ gap: spacingY._7, alignItems: "center" }}>
          <Typo size={22} style={styles.name}>
            {user?.email?.split("@")[0]}
          </Typo>
          <Typo size={16} style={{ color: colors.textGray, fontWeight: "500" }}>
            {user?.email}
          </Typo>
        </View>
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          marginBottom: "35%",
        }}
      >
        <View style={styles.bottomContainer}>
          <Row
            title={`Import Supplies ${
              getTotalCount() > 0 ? `(${getTotalCount()} imported)` : ""
            }`}
            iconColor={colors.lightPrimary}
            icon={<FontAwesome6 name="file-import" size={24} color="black" />}
            index={0}
            onPress={handleImportSupplies}
            isLoading={isLoading}
          />
          <Row
            title={"Manage Permissions"}
            iconColor={colors.lightPrimary}
            icon={<Ionicons name="people" size={24} color={"black"} />}
            index={2}
          />
        </View>
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

const Row = ({
  icon,
  title,
  iconColor,
  onPress,
  isLoading = false,
}: RowProps) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={isLoading}>
      <Animated.View style={[styles.row, isLoading && styles.disabledRow]}>
        <View
          style={{
            backgroundColor: iconColor,
            padding: spacingY._10,
            borderRadius: radius._12,
          }}
        >
          {isLoading ? (
            <Ionicons name="hourglass-outline" size={24} color="gray" />
          ) : (
            icon
          )}
        </View>
        <Typo
          size={16}
          style={{
            fontWeight: "500",
            flex: 1,
            color: isLoading ? colors.textGray : colors.black,
          }}
        >
          {title}
        </Typo>
        {isLoading ? (
          <Ionicons
            name="hourglass-outline"
            size={24}
            color={colors.textGray}
          />
        ) : (
          <Octicons name="chevron-right" size={24} color="black" />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

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
  topRow: {
    marginBottom: normalizeY(25),
    alignItems: "center",
    gap: spacingX._10,
    marginTop: "15%",
  },
  img: {
    height: normalizeY(110),
    width: normalizeY(110),
    borderRadius: normalizeY(60),
    borderWidth: normalizeY(3),
    borderColor: colors.primary,
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
