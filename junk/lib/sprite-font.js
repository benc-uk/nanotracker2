// ==========================================================================================
// A module for rendering a sprite sheet font in a canvas context.
// This module provides functions to load a sprite sheet font, render text using the font
// ==========================================================================================
// @ts-check

export class SpriteFont {
  /**
   * @param {CanvasRenderingContext2D} ctx - The canvas context to use for rendering.
   * @param {HTMLImageElement} image - The image containing the sprite sheet font.
   * @param {number} charWidth - The width of each character in the sprite sheet.
   * @param {number} charHeight - The height of each character in the sprite sheet.
   * @param {number} charsPerRow - The number of characters per row in the sprite sheet.
   */
  constructor(ctx, image, charWidth, charHeight, charsPerRow) {
    this.ctx = ctx
    this.image = image
    this.charWidth = charWidth
    this.charHeight = charHeight
    this.charsPerRow = charsPerRow
    this.spacingWidth = charWidth
    this.offset = 0 // ASCII offset for printable characters

    // // offscreen canvas for rendering
    // this.oc = new OffscreenCanvas(image.width, image.height)
    // this.ocCtx = this.oc.getContext('2d')
    // if (!this.ocCtx) {
    //   throw new Error('Failed to create OffscreenCanvas context')
    // }
    // this.ocCtx.filter = 'hue-rotate(30deg)'
    // this.ocCtx.drawImage(image, 0, 0)
    // this.image = this.oc.transferToImageBitmap()
  }

  /**
   * Renders a string of text at the specified position.
   * @param {number} x - The x-coordinate to render the text at.
   * @param {number} y - The y-coordinate to render the text at.
   * @param {string} text - The text to render.
   */
  renderText(x, y, text) {
    for (let i = 0; i < text.length; i++) {
      const charIndex = text.charCodeAt(i) - this.offset

      const sx = (charIndex % this.charsPerRow) * this.charWidth
      const sy = Math.floor(charIndex / this.charsPerRow) * this.charHeight

      this.ctx.drawImage(this.image, sx, sy, this.charWidth, this.charHeight, x + i * this.spacingWidth, y, this.charWidth, this.charHeight)
    }

    this.ctx.textRendering = 'geometricPrecision'
    this.ctx.imageSmoothingEnabled = false
    this.ctx.imageSmoothingQuality = 'low'
    this.ctx.textAlign = 'start'
    this.ctx.textBaseline = 'alphabetic'
    this.ctx.direction = 'inherit'
    this.ctx.fillStyle = 'white'
    this.ctx.strokeStyle = 'white'
    this.ctx.lineWidth = 1
    this.ctx.lineJoin = 'round'
    this.ctx.lineCap = 'round'
    // this.ctx.font = `${this.charHeight}px sans-serif`
    this.ctx.fillText(text, x, y)
    // this.ctx.strokeText(text, x, y)
  }

  /**
   * Measures the width of a string of text rendered with this font.
   * @param {string} text - The text to measure.
   * @returns {number} The width of the rendered text.
   */
  measureText(text) {
    return text.length * this.charWidth
  }
}
