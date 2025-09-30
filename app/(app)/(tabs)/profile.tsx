import ScreenComponent from "@/components/ScreenComponent";
import Typo from "@/components/Typo";
import colors from "@/config/colors";
import { radius, spacingX, spacingY } from "@/config/spacing";
import useAlertStore from "@/store/alertStore";
import { useAuthStore } from "@/store/authStore";
import { normalizeY } from "@/utils/normalize";
import { Octicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { Icon, SignOutIcon } from "phosphor-react-native";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";

interface RowProps {
  icon: Icon;
  title: string;
  iconColor: string;
  index: number;
  onPress?: () => void;
}

function ProfileScreen() {
  const { setAlertVisible, setOnConfirm } = useAlertStore();
  const { user, logoutUser, loading } = useAuthStore();

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

  const Row = ({ icon: Icon, title, iconColor, index, onPress }: RowProps) => {
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
            <Icon />
          </View>
          <Typo size={16} style={{ fontWeight: "500", flex: 1 }}>
            {title}
          </Typo>
          <Octicons name="chevron-right" size={24} color="black" />
        </Animated.View>
      </TouchableOpacity>
    );
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
      <View style={{ flex: 1 }}></View>
      <View style={[styles.bottomContainer, { marginBottom: "35%" }]}>
        <Row
          title={"Log out"}
          iconColor={"#d1d1d1"}
          icon={SignOutIcon}
          index={5}
          onPress={handleLogout}
        />
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
  topRow: {
    marginBottom: normalizeY(25),
    alignItems: "center",
    gap: spacingX._10,
    marginTop: "20%",
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
