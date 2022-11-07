import { Theme } from './types';

export const generateTheme = (cssColor: string): Theme => {
  // TODO: simplify this
  const hex = cssColor.slice(1, 7);
  const r = hex.slice(0, 2);
  const g = hex.slice(2, 4);
  const b = hex.slice(4, 6);

  const shiftedR = shift(r);
  const shiftedG = shift(g);
  const shiftedB = shift(b);

  return {
    light: '#' + `${shiftedR.light}${shiftedG.light}${shiftedB.light}`.padStart(6, '0'),
    main: cssColor,
    dark: '#' + `${shiftedR.dark}${shiftedG.dark}${shiftedB.dark}`.padStart(6, '0'),
  };
};

const shift = (hex: string): Theme => {
  const UPPER = 255;
  const main = Number.parseInt(hex, 16);
  const light = Math.floor((UPPER - main) / 2 + main).toString(16);
  const dark = Math.floor((main + 1) / 2).toString(16);
  return {
    light,
    main: hex,
    dark,
  };
};
