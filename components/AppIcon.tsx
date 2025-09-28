import { Icon, IconProps } from "phosphor-react-native";
import React from "react";
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import colors from "../config/colors";
import { radius, spacingY } from "../config/spacing";
import { normalizeY } from "../utils/normalize";

type Props = {
  icon: Icon;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  iconProps?: IconProps;
  size?: number;
};

function AppIcon({ icon: Icon, onPress, style, iconProps, size }: Props) {
  const imageSize = size || spacingY._20;
  const iconSize = size ? size * 2 : spacingY._40;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.iconContainer,
        { height: iconSize, width: iconSize },
        style,
      ]}
    >
      <Icon
        size={imageSize}
        color={colors.black}
        weight="bold"
        {...iconProps}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    height: normalizeY(40),
    width: normalizeY(40),
    borderRadius: radius._12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.37)",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AppIcon;
