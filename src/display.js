// ==========================================================================
// Module: display.js
// This module handles all display & drawing operations for text and shapes.
// ==========================================================================
// @ts-check

import { font, metrics } from './font.js'

/** @type {CanvasRenderingContext2D} */
let ctx

/** @type {ImageData} */
let imageData

/** @type {[number, number, number]} */
let colour = [255, 255, 255]

/** @typedef {string | [number, number, number]} ColourParam */

/**
 * Initializes the drawing module with a canvas context.
 * @param {CanvasRenderingContext2D | null} canvasContext - The 2D rendering context of the canvas.
 * @throws {Error} If the context is undefined or null.
 */
export async function init(canvasContext) {
  if (!canvasContext) {
    throw new Error('Context is undefined or null')
  }

  ctx = canvasContext
  ctx.strokeStyle = 'white'
  ctx.fillStyle = 'white'
  ctx.lineWidth = 1
  ctx.imageSmoothingEnabled = false

  // Create a new ImageData object with the same dimensions as the canvas
  imageData = ctx.createImageData(ctx.canvas.width, ctx.canvas.height)

  requestAnimationFrame(drawImageData)
}

/**
 * Sets the colour for drawing.
 * @param {ColourParam} newColour - The colour to set, can be a hex string or an RGB array.
 */
export function setColour(newColour) {
  if (typeof newColour === 'string') {
    const rgb = hexToRgb(newColour)
    if (rgb) {
      colour = rgb
    }
  }

  if (Array.isArray(newColour)) {
    colour = newColour
  }
}

/**
 * Sets a single pixel, uses the current colour.
 * @param {number} x - The x-coordinate of the pixel.
 * @param {number} y - The y-coordinate of the pixel.
 */
export function setPixel(x, y) {
  // Set the pixel colour in the image data array
  const index = (y * imageData.width + x) * 4
  imageData.data[index] = colour[0] // Red
  imageData.data[index + 1] = colour[1] // Green
  imageData.data[index + 2] = colour[2] // Blue
  imageData.data[index + 3] = 255 // Alpha (fully opaque)
}

/**
 * Draws a vertical line from (x, y) to (x, y2).
 * @param {number} x - The x-coordinate of the line.
 * @param {number} y - The starting y-coordinate of the line.
 * @param {number} y2 - The ending y-coordinate of the line.
 * @param {ColourParam} [colour] - The colour of the line. Defaults to current colour.
 */
export function vertLine(x, y, y2, colour = '') {
  if (colour !== '') setColour(colour)
  for (let i = y; i <= y2; i++) {
    setPixel(x, i)
  }
}

/**
 * Draws a horizontal line from (x, y) to (x2, y).
 * @param {number} x - The starting x-coordinate of the line.
 * @param {number} y - The y-coordinate of the line.
 * @param {number} x2 - The ending x-coordinate of the line.
 * @param {ColourParam} [colour] - The colour of the line. Defaults to current colour.
 */
export function horLine(x, y, x2, colour = '') {
  if (colour !== '') setColour(colour)

  for (let i = x; i <= x2; i++) {
    setPixel(i, y)
  }
}

/**
 * Draws a unfilled rectangle using top-left and bottom-right coordinates.
 * @param {number} x - The x-coordinate of the rectangle's top-left corner.
 * @param {number} y - The y-coordinate of the rectangle's top-left corner.
 * @param {number} x2 - The x-coordinate of the rectangle's bottom-right corner.
 * @param {number} y2 - The y-coordinate of the rectangle's bottom-right corner.
 * @param {ColourParam} colour - The colour of the rectangle. Defaults to current colour.
 */
export function box(x, y, x2, y2, colour = '') {
  if (colour !== '') setColour(colour)

  vertLine(x, y, y2)
  vertLine(x2, y, y2)
  horLine(x, y, x2)
  horLine(x, y2, x2)
}

/**
 * Draws a unfilled rectangle using width and height.
 * @param {number} x - The x-coordinate of the rectangle's top-left corner.
 * @param {number} y - The y-coordinate of the rectangle's top-left corner.
 * @param {number} w - The width of the rectangle.
 * @param {number} h - The height of the rectangle.
 * @param {string} colour - The colour of the rectangle. Defaults to current colour.
 */
export function boxWH(x, y, w, h, colour = '') {
  if (colour !== '') setColour(colour)

  vertLine(x, y, y + h)
  vertLine(x + w, y, y + h)
  horLine(x, y, x + w)
  horLine(x, y + h, x + w)
}

/**
 * Clears the entire canvas by unsetting all pixels.
 */
export function clearAll() {
  imageData.data.fill(0)
}

/**
 * Draws a filled rectangle using top-left and bottom-right coordinates.
 * @param {number} x - The x-coordinate of the rectangle's top-left corner.
 * @param {number} y - The y-coordinate of the rectangle's top-left corner.
 * @param {number} x2 - The x-coordinate of the rectangle's bottom-right corner.
 * @param {number} y2 - The y-coordinate of the rectangle's bottom-right corner.
 * @param {ColourParam} colour - The colour of the rectangle. Defaults to current colour.
 */
export function rect(x, y, x2, y2, colour = '') {
  if (colour !== '') setColour(colour)

  for (let i = x; i <= x2; i++) {
    for (let j = y; j <= y2; j++) {
      setPixel(i, j)
    }
  }
}

/**
 * Draws a filled rectangle using width and height.
 * @param {number} x - The x-coordinate of the rectangle's top-left corner.
 * @param {number} y - The y-coordinate of the rectangle's top-left corner.
 * @param {number} w - The width of the rectangle.
 * @param {number} h - The height of the rectangle.
 * @param {ColourParam} colour - The colour of the rectangle. Defaults to current colour.
 */
export function rectWH(x, y, w, h, colour = '') {
  if (colour !== '') setColour(colour)
  for (let i = x; i <= x + w; i++) {
    for (let j = y; j <= y + h; j++) {
      setPixel(i, j)
    }
  }
}

/**
 * Clears a single pixel at the specified coordinates.
 * @param {number} x - The x-coordinate of the pixel.
 * @param {number} y - The y-coordinate of the pixel.
 */
export function clearPixel(x, y) {
  const index = (y * imageData.width + x) * 4
  imageData.data[index] = 0 // Red
  imageData.data[index + 1] = 0 // Green
  imageData.data[index + 2] = 0 // Blue
}

/**
 * Draws text at the specified coordinates.
 * @param {number} x - The x-coordinate to draw the text.
 * @param {number} y - The y-coordinate to draw the text.
 * @param {string} str - The text to draw.
 * @param {ColourParam} colour - The colour of the text. Defaults to current colour.
 */
export function text(x, y, str, colour = '') {
  if (colour !== '') setColour(colour)

  for (let i = 0; i < str.length; i++) {
    const char = str[i].toUpperCase()
    drawChar(x + i * (metrics.width + metrics.spacing), y, char)
  }
}

// =================================================
// Private functions
// =================================================

/**
 * Draws a character at the specified coordinates.
 * @param {number} x - The x-coordinate to draw the character.
 * @param {number} y - The y-coordinate to draw the character.
 * @param {string} char - The character to draw.
 */
function drawChar(x, y, char) {
  const charData = font[char]
  if (!charData) return

  for (let i = 0; i < charData.length; i++) {
    const row = charData[i]
    for (let j = 0; j < 5; j++) {
      if ((row & (1 << (4 - j))) !== 0) {
        setPixel(x + j, y + i)
      }
    }
  }
}

/**
 * Draws the image data to the canvas.
 * This function is called repeatedly using requestAnimationFrame.
 */
function drawImageData() {
  // Draw the image data to the canvas
  ctx.putImageData(imageData, 0, 0)
  requestAnimationFrame(drawImageData)
}

/**
 * Converts a hex colour string to an RGB object.
 * @param {string} hex - The hex colour string (e.g., '#ff00ff').
 * @returns {[number, number, number] | null} The RGB array or null if the input is invalid.
 */
function hexToRgb(hex) {
  // Remove the '#' character if present
  hex = hex.replace('#', '')

  // Check if the hex string is valid
  if (hex.length !== 6) {
    console.error('Invalid hex colour:', hex)
    return null
  }

  // Convert hex to RGB
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)

  return [r, g, b]
}
