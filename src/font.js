// ====================================================================================
// Module: drawing.js
// This is a 5x7 pixel bitmap font, each character is represented by a grid of pixels.
// ====================================================================================
// @ts-check

export const metrics = {
  width: 5,
  height: 7,
  spacing: 1,
}

export function getWidth(text) {
  return text.length * (metrics.width + metrics.spacing) - 2
}

// prettier-ignore
export const font = {
  0: [0b00001110, 0b00011011, 0b00011011, 0b00011011, 0b00011011, 0b00011011, 0b00001110, 0b0],
  1: [0b00000110, 0b00001110, 0b00000110, 0b00000110, 0b00000110, 0b00000110, 0b00000110, 0b0],
  2: [0b00011110, 0b00000011, 0b00000011, 0b00001110, 0b00011000, 0b00011000, 0b00011111, 0b0],
  3: [0b00011110, 0b00000011, 0b00000011, 0b00001110, 0b00000011, 0b00000011, 0b00011110, 0b0],
  4: [0b00000011, 0b00000111, 0b00001011, 0b00010011, 0b00011111, 0b00000011, 0b00000011, 0b0],
  5: [0b00011110, 0b00010000, 0b00011110, 0b00000011, 0b00000011, 0b00000011, 0b00011110, 0b0],
  6: [0b00001110, 0b00011000, 0b00011110, 0b00011011, 0b00011011, 0b00011011, 0b00001110, 0b0],
  7: [0b00011111, 0b00000011, 0b00000110, 0b00000110, 0b00001100, 0b00001100, 0b00001100, 0b0],
  8: [0b00001110, 0b00011011, 0b00011011, 0b00001110, 0b00011011, 0b00011011, 0b00001110, 0b0],
  9: [0b00001110, 0b00011011, 0b00011011, 0b00001111, 0b00000011, 0b00000011, 0b00001110, 0b0],
  A: [0b00001110, 0b00011011, 0b00011011, 0b00011011, 0b00011111, 0b00011011, 0b00011011, 0b0],
  B: [0b00011110, 0b00011011, 0b00011110, 0b00011011, 0b00011011, 0b00011011, 0b00011110, 0b0],
  C: [0b00001111, 0b00011000, 0b00011000, 0b00011000, 0b00011000, 0b00011000, 0b00001111, 0b0],
  D: [0b00011110, 0b00011011, 0b00011011, 0b00011011, 0b00011011, 0b00011011, 0b00011110, 0b0],
  E: [0b00011111, 0b00011000, 0b00011110, 0b00011000, 0b00011000, 0b00011000, 0b00011111, 0b0],
  F: [0b00011111, 0b00011000, 0b00011110, 0b00011000, 0b00011000, 0b00011000, 0b00011000, 0b0],
  G: [0b00001110, 0b00011000, 0b00011000, 0b00011011, 0b00011011, 0b00011011, 0b00001110, 0b0],
  H: [0b00011011, 0b00011011, 0b00011111, 0b00011011, 0b00011011, 0b00011011, 0b00011011, 0b0],
  I: [0b00001100, 0b00001100, 0b00001100, 0b00001100, 0b00001100, 0b00001100, 0b00001100, 0b0],
  J: [0b00000110, 0b00000110, 0b00000110, 0b00000110, 0b00000110, 0b00000110, 0b00111100, 0b0],
  K: [0b00011001, 0b00011011, 0b00011110, 0b00011100, 0b00011110, 0b00011011, 0b00011001, 0b0],
  L: [0b00011000, 0b00011000, 0b00011000, 0b00011000, 0b00011000, 0b00011000, 0b00011111, 0b0],
  M: [0b00010001, 0b00011011, 0b00011111, 0b00011101, 0b00011001, 0b00011001, 0b00011001, 0b0],
  N: [0b00010001, 0b00011001, 0b00011101, 0b00011111, 0b00011011, 0b00011001, 0b00011001, 0b0],
  O: [0b00001110, 0b00011011, 0b00011011, 0b00011011, 0b00011011, 0b00011011, 0b00001110, 0b0],
  P: [0b00011110, 0b00011011, 0b00011011, 0b00011011, 0b00011110, 0b00011000, 0b00011000, 0b0],
  Q: [0b00001110, 0b00011011, 0b00011011, 0b00011011, 0b00011011, 0b00011010, 0b00001101, 0b0],
  R: [0b00011110, 0b00011011, 0b00011011, 0b00011011, 0b00011110, 0b00011011, 0b00011001, 0b0],
  S: [0b00001110, 0b00011000, 0b00011000, 0b00001100, 0b00000110, 0b00000110, 0b00011100, 0b0],
  T: [0b00011111, 0b00001100, 0b00001100, 0b00001100, 0b00001100, 0b00001100, 0b00001100, 0b0],
  U: [0b00011011, 0b00011011, 0b00011011, 0b00011011, 0b00011011, 0b00011011, 0b00001110, 0b0],
  V: [0b00011011, 0b00011011, 0b00011011, 0b00011011, 0b00001110, 0b00001110, 0b00000100, 0b0],
  W: [0b00011001, 0b00011001, 0b00011001, 0b00011101, 0b00011111, 0b00011011, 0b00010001, 0b0],
  X: [0b00010001, 0b00011011, 0b00011111, 0b00001110, 0b00011111, 0b00011011, 0b00010001, 0b0],
  Y: [0b00010001, 0b00011011, 0b00011111, 0b00001110, 0b00000110, 0b00000110, 0b00000110, 0b0],
  Z: [0b00011111, 0b00000011, 0b00000110, 0b00001100, 0b00011000, 0b00011000, 0b00011111, 0b0],
  '!': [0b00001100, 0b00001100, 0b00001100, 0b00001100, 0b00001100, 0b0, 0b00001100, 0b0],
  '"': [0b00001010, 0b00001010, 0b0, 0b0, 0b0, 0b0, 0b0, 0b0],
  '#': [0b00001010, 0b00011111, 0b00011111, 0b00001010, 0b00011111, 0b00011111, 0b00001010, 0b0],
  '$': [0b00000100, 0b00001111, 0b00011100, 0b00011111, 0b00000111, 0b00011110, 0b00000100, 0b0],
  '%': [0b00011010, 0b00011010, 0b00000110, 0b00000100, 0b00001100, 0b00001011, 0b00001011, 0b0],
  '&': [0b00001100, 0b00011010, 0b00011010, 0b00001100, 0b00011101, 0b00011010, 0b00001101, 0b0],
  "'": [0b00000100, 0b00000100, 0b0, 0b0, 0b0, 0b0, 0b0, 0b0],
  '*': [0b00000100, 0b00010101, 0b00011111, 0b00001110, 0b00011111, 0b00010101, 0b00000100, 0b0],
  '^': [0b00000100, 0b00001110, 0b00001010, 0b0, 0b0, 0b0, 0b0, 0b0],
  '@': [0b00001110, 0b00011011, 0b00011111, 0b00011101, 0b00011111, 0b00011000, 0b00001110, 0b0],
  '?': [0b00011110, 0b00000011, 0b00000110, 0b00001100, 0b00001100, 0b0, 0b00001100, 0b0],
  '(': [0b00000011, 0b00000110, 0b00000110, 0b000001110, 0b00000110, 0b00000110, 0b00000011, 0b0],
  ')': [0b00011000, 0b00001100, 0b00001100, 0b00001110, 0b00001100, 0b00001100, 0b00011000, 0b0],
  '[': [0b00001110, 0b00001100, 0b00001100, 0b00001100, 0b00001100, 0b00001100, 0b00001110, 0b0],
  ']': [0b00001110, 0b00000110, 0b00000110, 0b00000110, 0b00000110, 0b00000110, 0b00001110, 0b0],
  '_': [0b0, 0b0, 0b0, 0b0, 0b0, 0b0, 0b00011111, 0b0],
  '-': [0b0, 0b0, 0b0, 0b00011111, 0b0, 0b0, 0b0, 0b0],
  '=': [0b0, 0b0, 0b00011111, 0b0, 0b00011111, 0b0, 0b0, 0b0],
  ';': [0b0, 0b0001100, 0b0001100, 0b0, 0b0000100, 0b0001100, 0b00001000, 0b0],
  ':': [0b0, 0b0001100, 0b0001100, 0b0, 0b0001100, 0b0001100, 0b0, 0b0],
  ',': [0b0, 0b0, 0b0, 0b0, 0b00000010, 0b00000110, 0b00000100, 0b0],
  '.': [0b0, 0b0, 0b0, 0b0, 0b0, 0b00001100, 0b00001100, 0b0],
  '|': [0b00000100, 0b00000100, 0b00000100, 0b00000100, 0b00000100, 0b00000100, 0b00000100, 0b0],
  '<': [0b00000011, 0b00000110, 0b00001100, 0b00011000, 0b00001100, 0b00000110, 0b00000011, 0b0],
  '>': [0b00011000, 0b00001100, 0b00000110, 0b00000011, 0b00000110, 0b00001100, 0b00011000, 0b0],
  '+': [0b0, 0b00000100, 0b00000100, 0b00011111, 0b00000100, 0b00000100, 0b0, 0b0],
  '/': [0b00000010, 0b00000010, 0b00000110, 0b00000100, 0b00001100, 0b00001000, 0b00001000, 0b0],
  '\\': [0b00001000, 0b00001000, 0b00001100, 0b00000100, 0b00000110, 0b00000010, 0b00000010, 0b0],
  '~': [0b0, 0b0, 0b00001101, 0b00011111, 0b000011010, 0b0, 0b0, 0b0],
  '»': [0b0, 0b00001000, 0b00001100, 0b0001110, 0b00001100, 0b00001000, 0b0, 0b0],
}
