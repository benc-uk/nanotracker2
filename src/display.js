// ====================================================
// UI output
// ====================================================
// @ts-check

import * as gfx from './gfx.js'
import { theme } from './theme.js'
import { asHex } from './utils.js'

/** @import { Project } from "./data.js" */

export function initDisplay() {
  const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'))
  if (!canvas) throw new Error('Canvas element not found')

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to get 2D context, your browser may be from the distant past')

  // Initialize the graphics library
  gfx.init(ctx)

  // Apply theme to page elements
  document.body.style.backgroundColor = theme.body
  canvas.style.backgroundColor = theme.background

  window.addEventListener('resize', resize)
  resize()
}

/**
 * Draws the UI elements on the canvas.
 * @param {Project} project
 * @param {import('./main.js').UIState} uiState
 * @param {import('./main.js').PlayingState} playingState
 */
export function renderDisplay(project, uiState, playingState) {
  gfx.clearAll()

  if (uiState.mode === 'pattern') {
    if (!uiState.patt) return

    // Pattern title
    gfx.text(3, 3, uiState.patt.name || `Pattern ${uiState.patt.id}`, theme.title)

    for (let trackNum = 0; trackNum < project.trackCount; trackNum++) {
      const patNum = project.song[uiState.songRow][trackNum]

      let boxColour = '#444444'
      if (trackNum === uiState.trackNum) {
        boxColour = '#ffffff'
      }

      if (patNum !== null) {
        gfx.rectWH(200 + trackNum * 5, 5, 3, 3, boxColour)
      } else {
        gfx.boxWH(200 + trackNum * 5, 5, 3, 3, boxColour)
      }
    }

    const offset = 20
    gfx.rectWH(0, offset - 2 + playingState.pattRow * 10, 128, 10, '#041100')

    for (let i = 0; i < uiState.patt.length; i++) {
      const row = uiState.patt.rows[i]
      let rowNumColor = '#333355'
      if (i % 4 === 0) {
        rowNumColor = '#8888aa'
      }
      gfx.text(2, offset + i * 10, `${i.toString(16)}`, rowNumColor)

      if (row.note) {
        gfx.text(12, offset + +i * 10, `${row.note.noteString()} ${row.note.inst.toString()} ${row.note.volumeString()}`, '#ffffff')
      } else {
        gfx.text(12, offset + i * 10, `--- -- --`, '#444444')
      }
    }
  }

  if (uiState.mode === 'song') {
    gfx.text(3, 3, project.name, theme.title)
    // bpm
    gfx.text(200, 3, `BPM: ${project.bpm}`, theme.title)

    const offset = 28
    let rowNumColor = '#333355'

    for (let track = 0; track < project.trackCount; track++) {
      gfx.text(26 + track * 23, 15, `T${track + 1}`, '#004499')
    }

    // Draw the bar behind the playing song row
    gfx.rectWH(0, offset - 2 + playingState.songRow * 10, 208, 10, '#003322')

    for (let i = 0; i < project.song.length; i++) {
      const patterns = project.song[i]
      gfx.text(2, offset + i * 10, asHex(i), rowNumColor)

      for (let track = 0; track < project.trackCount; track++) {
        const pattNum = patterns[track]
        gfx.text(26 + track * 23, offset + i * 10, asHex(pattNum), '#ffffff')
      }
    }

    // border around the active row
    gfx.boxWH(0, offset - 2 + uiState.songRow * 10, 208, 10, '#008800')
  }
}

function resize() {
  const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'))
  if (!canvas) return

  const isPortrait = window.innerHeight > window.innerWidth * (canvas.height / canvas.width)
  if (isPortrait) {
    canvas.style.width = '100%'
    canvas.style.height = 'auto'
  } else {
    canvas.style.width = 'auto'
    canvas.style.height = '100%'
  }
}
