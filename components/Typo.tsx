import React from 'react';
import {StyleSheet, Text, TextProps, TextStyle, StyleProp} from 'react-native';
import {normalizeY} from '../utils/normalize';
import colors from '../config/colors';

interface TypoProps extends TextProps {
  size?: number;
  weight?: 'normal' | 'bold';
  style?: StyleProp<TextStyle>;
  props?: TextProps;
}

const Typo: React.FC<TypoProps> = ({
  size,
  weight,
  style,
  children,
  ...props
}) => {
  return (
    <Text
      allowFontScaling={false}
      style={[
        styles.default,
        {
          fontSize: size ? normalizeY(size) : normalizeY(14),
          fontWeight: weight === 'bold' ? 'bold' : 'normal',
          textAlign: 'left',
        },
        style,
      ]}
      {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  default: {
    color: colors.black,
  },
});

export default Typo;
