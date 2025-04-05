// ====================================================
// Application entry point
// ====================================================
// @ts-check
import './style.css'

// @ts-ignore
import workletURL from './audio-worker.js?url'
import { Project } from './data.js'
import { initDisplay, renderDisplay } from './display.js'

/** @import { Pattern } from "./data.js" */

/**
 * @typedef {Object} UIState
 * @property {'song'|'pattern'|'instrument'|'project'} mode
 * @property {Pattern | null} patt
 * @property {number} trackNum
 * @property {number} songRow
 */

/**
 * @typedef {Object} PlayingState
 * @property {boolean} playing
 * @property {number} pattRow
 * @property {number} songRow
 */

// Global state

/** @type {UIState} */
let uiState = {
  mode: 'song',
  patt: null,
  trackNum: -1,
  songRow: 0,
}

/** @type {PlayingState} */
let playingState = {
  playing: false,
  pattRow: 0,
  songRow: 0,
}

const audioCtx = new AudioContext()
await audioCtx.audioWorklet.addModule(workletURL)
const trackerNode = new AudioWorkletNode(audioCtx, 'tracker-processor', {
  numberOfOutputs: 1,
  outputChannelCount: [2],
})
trackerNode.connect(audioCtx.destination)

const project = await Project.load('./projects/test-1.json')

trackerNode.port.postMessage({
  type: 'loadProject',
  project,
})

trackerNode.port.onmessage = (e) => {
  // Message from the audio worklet when the row changes
  if (e.data.type === 'nextRow') {
    playingState.pattRow = e.data.row
    renderDisplay(project, uiState, playingState)
  }

  if (e.data.type === 'nextSongRow') {
    playingState.songRow = e.data.row
    renderDisplay(project, uiState, playingState)
  }
}

initDisplay()
renderDisplay(project, uiState, playingState)

// === Stuff for UI/UX
window.addEventListener('keydown', (e) => {
  if (e.key === '0') {
    if (uiState.mode === 'pattern') {
      uiState.mode = 'song'
    }
  }

  if (e.key === ' ') {
    // Start audio context on keydown
    if (audioCtx.state === 'suspended') {
      audioCtx.resume()
    }

    playingState.playing = !playingState.playing
    if (playingState.playing) {
      trackerNode.port.postMessage({
        type: 'play',
      })
    }

    if (!playingState.playing) {
      trackerNode.port.postMessage({
        type: 'stop',
      })
    }
  }

  if (e.key === 'ArrowUp') {
    if (uiState.mode === 'song') {
      uiState.songRow--
      if (uiState.songRow < 0) {
        uiState.songRow = project.song.length - 1
      }
    }
  }

  if (e.key === 'ArrowDown') {
    if (uiState.mode === 'song') {
      uiState.songRow++
      if (uiState.songRow >= project.song.length) {
        uiState.songRow = 0
      }
    }
  }

  if (e.key === '1' || e.key === '2' || e.key === '3' || e.key === '4' || e.key === '5' || e.key === '6' || e.key === '7' || e.key === '8') {
    const trackNum = parseInt(e.key) - 1
    const songRow = project.song[uiState.songRow]

    if (songRow[trackNum] !== null) {
      uiState.patt = project.patterns[songRow[trackNum]]
      uiState.trackNum = trackNum
      uiState.mode = 'pattern'
    }
  }

  renderDisplay(project, uiState, playingState)
})
