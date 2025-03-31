// ====================================================
// Application entry point
// ====================================================
// @ts-check
import './style.css'

// @ts-ignore
import workletURL from './audio-worker.js?url'
import * as gfx from './display.js'
import { Project } from './data.js'
import { asHex } from './utils.js'

try {
  const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'))
  if (!canvas) throw new Error('Canvas element not found')

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to get 2D context, your browser may be from the distant past')

  // Initialize the graphics library
  await gfx.init(ctx)

  // Handle tapping on the canvas
  // HACK: This is a workaround for the fact that we can't use touch events in the audio worklet
  canvas.addEventListener('click', () => {
    // Send key event to the window
    const keyEvent = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    })
    window.dispatchEvent(keyEvent)
  })

  // detect if the window is portrait or landscape on resize
  window.addEventListener('resize', resize)
  resize()
} catch (error) {
  throw new Error(`Initialization failed: ${error}`)
}

// Global state

/** @type {'song'|'pattern'|'instrument'|'project'} */
let view = 'song'
let activePattern = 0
let playing = false
let playPatternRow = 0
let playingSongRow = 0
let activeSongRow = 0

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
    playPatternRow = e.data.row
    draw()
  }

  if (e.data.type === 'nextSongRow') {
    playingSongRow = e.data.row
    draw()
  }
}

draw()

// === Stuff for UI/UX
window.addEventListener('keydown', (e) => {
  if (e.key === '0') {
    if (view === 'pattern') {
      view = 'song'
    }

    draw()
  }

  if (e.key === ' ') {
    // Start audio context on keydown
    if (audioCtx.state === 'suspended') {
      audioCtx.resume()
    }

    playing = !playing
    if (playing) {
      trackerNode.port.postMessage({
        type: 'play',
      })
    }

    if (!playing) {
      trackerNode.port.postMessage({
        type: 'stop',
      })
    }

    draw()
  }

  if (e.key === 'ArrowUp') {
    if (view === 'song') {
      activeSongRow--
      if (activeSongRow < 0) {
        activeSongRow = project.song.length - 1
      }
      draw()
    }
  }

  if (e.key === 'ArrowDown') {
    if (view === 'song') {
      activeSongRow++
      if (activeSongRow >= project.song.length) {
        activeSongRow = 0
      }
      draw()
    }
  }

  if (e.key === '1' || e.key === '2' || e.key === '3' || e.key === '4' || e.key === '5' || e.key === '6' || e.key === '7' || e.key === '8') {
    const trackNum = parseInt(e.key) - 1
    const songRow = project.song[activeSongRow]

    if (songRow[trackNum] !== null) {
      activePattern = songRow[trackNum]
      view = 'pattern'
      draw()
    }
  }
})

function draw() {
  gfx.clearAll()

  if (view === 'pattern') {
    const pattern = project.patterns[activePattern]
    if (!pattern) {
      return
    }
    gfx.text(3, 3, pattern.name || `Pattern ${pattern.id}`, '#ee4455')

    const offset = 20
    gfx.rectWH(0, offset - 2 + playPatternRow * 10, 128, 10, '#041100')

    for (let i = 0; i < pattern.length; i++) {
      const row = pattern.rows[i]
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

  if (view === 'song') {
    gfx.text(3, 3, project.name, '#ee4455')

    const offset = 28
    let rowNumColor = '#333355'

    for (let track = 0; track < project.trackCount; track++) {
      gfx.text(26 + track * 23, 15, `T${track + 1}`, '#004499')
    }

    // Draw the bar behing the playing song row
    gfx.rectWH(0, offset - 2 + playingSongRow * 10, 208, 10, '#041100')

    for (let i = 0; i < project.song.length; i++) {
      const patterns = project.song[i]
      gfx.text(2, offset + i * 10, asHex(i), rowNumColor)

      for (let track = 0; track < project.trackCount; track++) {
        const pattNum = patterns[track]
        gfx.text(26 + track * 23, offset + i * 10, asHex(pattNum), '#ffffff')
      }
    }

    // border around the active row
    gfx.boxWH(0, offset - 2 + activeSongRow * 10, 208, 10, '#008800')
  }
}

function resize() {
  const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'))
  if (!canvas) throw new Error('Canvas element not found')

  const isPortrait = window.innerHeight > window.innerWidth
  if (isPortrait) {
    canvas.style.width = '100%'
    canvas.style.height = 'auto'
  } else {
    canvas.style.width = 'auto'
    canvas.style.height = '100%'
  }
}
