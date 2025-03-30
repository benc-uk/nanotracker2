// ====================================================
// Application entry point
// ====================================================
// @ts-check
import './style.css'

// @ts-ignore
import workletURL from './audio.js?url'
import * as gfx from './drawing.js'
import { Project } from './data.js'

export let ac
try {
  const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'))
  if (!canvas) throw new Error('Canvas element not found')

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to get 2D context, your browser may be from the distant past')

  // Initialize the graphics library
  await gfx.init(ctx)
} catch (error) {
  throw new Error(`Initialization failed: ${error}`)
}

let mode = 'pattern'
let activePattern = 0
let playing = false

const audioCtx = new AudioContext()
ac = audioCtx
await audioCtx.audioWorklet.addModule(workletURL)
const trackerNode = new AudioWorkletNode(audioCtx, 'tracker-processor', {
  numberOfOutputs: 1,
  outputChannelCount: [2],
})
trackerNode.connect(audioCtx.destination)

const project = await Project.load('/projects/test-1.json')

trackerNode.port.postMessage({
  type: 'loadProject',
  project,
})

let row = 0
trackerNode.port.onmessage = (e) => {
  if (e.data.type === 'nextRow') {
    row = e.data.row
    draw()
  }
}

draw()

// === Stuff for UI/UX

window.addEventListener('keydown', (e) => {
  // start audio context on keydown
  if (audioCtx.state === 'suspended') {
    console.log('Audio context suspended, resuming...')
    audioCtx.resume()
  }

  if (e.key === 'Q') {
    if (mode === 'pattern') {
      mode = 'song'
    } else {
      mode = 'pattern'
    }
    draw()
  }

  if (e.key === ' ') {
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

  if (e.key === '1' || e.key === '2' || e.key === '3' || e.key === '4') {
    mode = 'pattern'
    activePattern = parseInt(e.key) - 1
    draw()
  }
})

function draw() {
  gfx.clearAll()

  if (mode === 'pattern') {
    const pattern = project.patterns[activePattern]
    if (!pattern) {
      return
    }
    gfx.text(3, 3, pattern.name || `Pattern ${pattern.id}`, '#ee4455')

    const offset = 20
    gfx.rectWH(0, offset - 2 + row * 10, 128, 10, '#041100')

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
}
