// ================================================================
// Module: drawing.js
// This module handles all drawing operations for text and shapes.
// ================================================================
// @ts-check

/** @type {CanvasRenderingContext2D} */
let ctx

const SCALE = 6

/** @param canvasContext {CanvasRenderingContext2D} */
export async function init(canvasContext) {
  ctx = canvasContext
  ctx.translate(SCALE / 2, SCALE / 2)
  ctx.scale(SCALE, SCALE)
  ctx.strokeStyle = 'white'
  ctx.fillStyle = 'white'
  ctx.lineWidth = 1
  ctx.imageSmoothingEnabled = false

  await document.fonts.load('32px pixel')

  ctx.font = '6px pixel'
  ctx.textRendering = 'geometricPrecision'
  ctx.fillStyle = '#11ff55'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.lineWidth = 1
}

/**
 * Draws a unfilled rectangle.
 * @param {number} x - The x-coordinate of the rectangle's top-left corner.
 * @param {number} y - The y-coordinate of the rectangle's top-left corner.
 * @param {number} x2 - The x-coordinate of the rectangle's bottom-right corner.
 * @param {number} y2 - The y-coordinate of the rectangle's bottom-right corner.
 */
export function boxTo(x, y, x2, y2, color = 'white') {
  const width = x2 - x
  const height = y2 - y

  ctx.strokeStyle = color
  ctx.strokeRect(x + 1.5, y, width, height)
}

export function text(x, y, text, color = 'white') {
  ctx.fillStyle = color
  ctx.fillText(text, x - 0.5, y - 0.5)
}

/**
 * Loads an image from the specified source URL.
 * @param {string} src - The source URL of the image to load.
 * @returns {Promise<HTMLImageElement>} - A promise that resolves to the loaded image.
 */
export async function getImage(src) {
  const image = new Image()
  image.src = src
  return new Promise((resolve, reject) => {
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`))
  })
}
