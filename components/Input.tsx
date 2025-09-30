import React, { useEffect, useState } from "react";
import {
  Image,
  ImageRequireSource,
  ImageStyle,
  Platform,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import Typo from "../components/Typo";

import {
  EyeIcon,
  EyeSlashIcon,
  WarningCircleIcon,
} from "phosphor-react-native";
import colors from "../config/colors";
import { fontS, radius, spacingX, spacingY } from "../config/spacing";
import { normalizeY } from "../utils/normalize";

interface Props extends TextInputProps {
  index?: number;
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onBlur?: (e: any) => void;
  inputMode?: TextInputProps["inputMode"];
  password?: boolean;
  inputStyle?: TextStyle;
  error?: string;
  onSubmitEditing?: () => void;
  labelStyle?: TextStyle;
  multiline?: boolean;
  image?: ImageRequireSource;
  imageStyle?: ImageStyle;
  inputProps?: TextInputProps;
}

const Input: React.FC<Props> = ({
  index = 1,
  label,
  value,
  onChangeText,
  placeholder,
  onBlur,
  inputMode = "text",
  password = false,
  inputStyle,
  labelStyle = {},
  error,
  onSubmitEditing,
  multiline = false,
  image,
  imageStyle,
  inputProps,
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  useEffect(() => {
    if (password) {
      setPasswordVisible(true);
    }
  }, [password]);
  return (
    <Animated.View
      style={styles.view}
      key={`${label}-${index}`}
      entering={FadeIn.delay(index * 200).duration(600)}
    >
      {label && (
        <Typo size={15} style={[styles.label, labelStyle]}>
          {label}
        </Typo>
      )}
      <TextInput
        secureTextEntry={passwordVisible}
        value={value}
        onChangeText={onChangeText}
        style={[
          styles.input,
          multiline
            ? { minHeight: normalizeY(120) }
            : { height: normalizeY(50) },
          inputStyle,
        ]}
        placeholder={placeholder}
        inputMode={inputMode}
        placeholderTextColor={colors.textGray}
        onBlur={onBlur}
        returnKeyType={multiline ? "default" : "done"}
        onSubmitEditing={onSubmitEditing}
        multiline={multiline}
        numberOfLines={multiline ? 8 : 1}
        {...inputProps}
      />
      {image && (
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.imageIcon,
            label && { marginTop: spacingY._25 },
            imageStyle,
          ]}
          onPress={() => {
            if (placeholder == "Password") setPasswordVisible(!passwordVisible);
          }}
        >
          {placeholder == "Password" ? (
            <View style={styles.image}>
              {passwordVisible ? (
                <EyeSlashIcon weight="fill" />
              ) : (
                <EyeIcon weight="fill" />
              )}
            </View>
          ) : (
            <Image source={image} style={styles.image} />
          )}
        </TouchableOpacity>
      )}
      {error && (
        <Animated.View
          entering={FadeIn.duration(100)}
          exiting={FadeOut.duration(100)}
          style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}
        >
          <WarningCircleIcon
            size={16}
            color={colors.error}
            style={{ marginRight: 8 }}
          />
          <Typo style={styles.error}>{error}</Typo>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  view: {
    width: Platform.OS == "ios" ? "100%" : "99%",
    marginBottom: 16,
  },
  label: {
    marginBottom: spacingY._7,
    fontWeight: "500",
  },
  error: {
    fontSize: 12,
    color: colors.error,
  },
  input: {
    borderRadius: radius._10,
    paddingHorizontal: spacingX._15,
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: colors.black,
    fontSize: fontS._15,
    color: colors.black,
  },
  imageIcon: {
    position: "absolute",
    right: 15,
    top: normalizeY(14),
    height: normalizeY(22),
    width: normalizeY(22),
  },
  image: {
    height: "100%",
    width: "100%",
  },
  errorIcon: {
    position: "absolute",
    right: 24,
    top: normalizeY(12),
  },
});

export default Input;
