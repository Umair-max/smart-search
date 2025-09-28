import { normalizeX } from "@/utils/normalize";
import React from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import colors from "../config/colors";
import { radius, spacingH, spacingX } from "../config/spacing";
import Typo from "./Typo";

interface AppButtonProps {
  label?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  loading?: boolean;
  varient?: "primary" | "secondary";
  isGradient?: boolean;
  disabled?: boolean;
}

const AppButton: React.FC<AppButtonProps> = ({
  label = "",
  onPress,
  style,
  textStyle = {},
  loading = false,
  varient = "primary",
  disabled = false,
}) => {
  const isPrimary = varient == "primary";
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      activeOpacity={isDisabled ? 1 : 0.5}
      style={[
        styles.container,
        {
          backgroundColor: isDisabled
            ? colors.buttonGrey
            : isPrimary
            ? colors.primary
            : colors.buttonGrey,
          opacity: isDisabled ? 0.6 : 1,
        },
        style,
      ]}
      onPressIn={() => {
        if (!isDisabled) {
          onPress();
        }
      }}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Typo
          size={16}
          style={[
            styles.label,
            {
              color: colors.white,
            },
            textStyle,
          ]}
        >
          {label}
        </Typo>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    borderRadius: radius._10,
    alignSelf: "center",
    overflow: "hidden",
    height: spacingH.btn,
  },
  label: {
    marginHorizontal: spacingX._10,
    fontWeight: "600",
    color: colors.white,
  },
  poingImg: {
    height: "100%",
    width: normalizeX(70),
    marginStart: -spacingX._5,
  },
});

export default AppButton;
