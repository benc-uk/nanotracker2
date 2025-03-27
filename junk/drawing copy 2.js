// ================================================================
// Module: drawing.js
// This module handles all drawing operations for text and shapes.
// ================================================================
// @ts-check

/** @type {CanvasRenderingContext2D} */
let ctx

/** @param canvasContext {CanvasRenderingContext2D} */
export async function init(canvasContext) {
  ctx = canvasContext
  ctx.strokeStyle = 'white'
  ctx.fillStyle = 'white'
  ctx.lineWidth = 1
  ctx.imageSmoothingEnabled = false
}

export function setColour(color) {
  ctx.fillStyle = color
}

export function setPixel(x, y) {
  ctx.fillRect(x, y, 1, 1)
}

export function vertLine(x, y, y2, colour = '') {
  if (colour !== '') setColour(colour)
  ctx.fillRect(x, y, 1, y2 - y + 1)
}

export function horLine(x, y, x2, colour = '') {
  if (colour !== '') setColour(colour)
  ctx.fillRect(x, y, x2 - x + 1, 1)
}

/**
 * Draws a unfilled rectangle.
 * @param {number} x - The x-coordinate of the rectangle's top-left corner.
 * @param {number} y - The y-coordinate of the rectangle's top-left corner.
 * @param {number} x2 - The x-coordinate of the rectangle's bottom-right corner.
 * @param {number} y2 - The y-coordinate of the rectangle's bottom-right corner.
 * @param {string} [colour] - The color of the rectangle. Defaults to null.
 */
export function box(x, y, x2, y2, colour = '') {
  if (colour !== '') setColour(colour)

  // draw the rectangle
  vertLine(x, y, y2)
  vertLine(x2, y, y2)
  horLine(x, y, x2)
  horLine(x, y2, x2)
}

export function boxWH(x, y, w, h, colour = '') {
  if (colour !== '') setColour(colour)

  // draw the rectangle
  vertLine(x, y, y + h)
  vertLine(x + w, y, y + h)
  horLine(x, y, x + w)
  horLine(x, y + h, x + w)
}
