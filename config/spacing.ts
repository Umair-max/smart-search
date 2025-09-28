import {Platform, Dimensions} from 'react-native';
import {normalizeX, normalizeY} from '../utils/normalize';

export const {height, width} = Dimensions.get('screen');

const topImageSpacing = Platform.OS == 'ios' ? height * 0.3 : height * 0.27;
const isIOS = Platform.OS == 'ios';

const spacingX = {
  _3: normalizeX(3),
  _4: normalizeX(4),
  _5: normalizeX(5),
  _7: normalizeX(7),
  _10: normalizeX(10),
  _12: normalizeX(12),
  _15: normalizeX(15),
  _20: normalizeX(20),
  _25: normalizeX(25),
  _30: normalizeX(30),
  _50: normalizeX(50),
};

const spacingY = {
  _4: normalizeY(4),
  _5: normalizeY(5),
  _7: normalizeY(7),
  _8: normalizeY(8),
  _10: normalizeY(10),
  _12: normalizeY(12),
  _15: normalizeY(15),
  _20: normalizeY(20),
  _25: normalizeY(25),
  _30: normalizeY(30),
  _35: normalizeY(35),
  _40: normalizeY(40),
  _50: normalizeY(50),
  _60: normalizeY(60),
};

const spacingH = {
  btn: normalizeY(50),
  notiCard: normalizeY(55),
  icon: normalizeY(40),
  input: normalizeY(45),
  topImg: topImageSpacing,
  registerMarginTop: topImageSpacing - normalizeY(85),
  _10: normalizeY(10),
  _12: normalizeY(12),
  _15: normalizeY(15),
  _20: normalizeY(20),
  _25: normalizeY(25),
  _30: normalizeY(30),
  _40: normalizeY(40),
};

const radius = {
  _3: normalizeY(3),
  _5: normalizeY(5),
  _6: normalizeY(6),
  _10: normalizeY(10),
  _12: normalizeY(12),
  _15: normalizeY(15),
  _20: normalizeY(20),
  _25: normalizeY(25),
  _30: normalizeY(30),
  _35: normalizeY(35),
};

const fontS = {
  _12: normalizeY(12),
  _14: normalizeY(14),
  _15: normalizeY(15),
  _16: normalizeY(16),
  _18: normalizeY(18),
  _20: normalizeY(20),
  _22: normalizeY(22),
  _24: normalizeY(24),
  _26: normalizeY(26),
  _28: normalizeY(28),
  _30: normalizeY(30),
  _32: normalizeY(32),
  _34: normalizeY(34),
  _36: normalizeY(36),
  _38: normalizeY(38),
  _40: normalizeY(40),
};

export {spacingX, spacingY, radius, spacingH, fontS, isIOS};
