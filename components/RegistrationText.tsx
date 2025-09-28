import React from 'react';
import {StyleSheet, View} from 'react-native';
import Typo from './Typo';
import {spacingY} from '../config/spacing';
import {normalizeY} from '../utils/normalize';

interface Props {
  title: string;
  body: string;
}

function RegistrationText({title, body}: Props) {
  return (
    <View style={styles.container}>
      <Typo size={20} style={styles.title}>
        {title}
      </Typo>
      <Typo style={styles.body}>{body}</Typo>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacingY._10,
    marginBottom: normalizeY(40),
  },
  title: {
    fontWeight: '600',
  },
  body: {
    width: '70%',
    textAlign: 'center',
  },
});

export default RegistrationText;
