import { normalizeX } from "@/utils/normalize";
import { Icon, IconProps } from "phosphor-react-native";
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
  icon?: Icon;
  iconProps?: IconProps;
}

const AppButton: React.FC<AppButtonProps> = ({
  label = "",
  onPress,
  style,
  textStyle = {},
  loading = false,
  varient = "primary",
  disabled = false,
  icon: Icon,
  iconProps,
}) => {
  const isPrimary = varient == "primary";
  const isDisabled = loading || disabled;
  const textColor = isDisabled ? colors.black : colors.white;

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
        },
        style,
      ]}
      onPressIn={() => {
        if (!isDisabled) {
          onPress();
        }
      }}
    >
      {Icon && (
        <Icon size={22} color={colors.white} weight="bold" {...iconProps} />
      )}
      <Typo
        size={16}
        style={[
          styles.label,
          {
            color: textColor,
          },
          textStyle,
        ]}
      >
        {label}
      </Typo>
      {loading && <ActivityIndicator color={textColor} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    borderRadius: radius._12,
    alignSelf: "center",
    overflow: "hidden",
    height: spacingH.btn,
    flexDirection: "row",
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
