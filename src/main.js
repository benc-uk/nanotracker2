// @ts-check
import './style.css'

// @ts-ignore
import workletURL from './audio.js?url'
import * as gfx from './drawing.js'
import { metrics } from './font.js'
import { Project } from './project.js'

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

let cursor = 0
draw()

const audioCtx = new AudioContext()

await audioCtx.audioWorklet.addModule(workletURL)

const trackerNode = new AudioWorkletNode(audioCtx, 'tracker-processor', {
  numberOfOutputs: 2,
  outputChannelCount: [2, 2],
})
trackerNode.connect(audioCtx.destination)

const proj = new Project(audioCtx)
await proj.loadSample('/samples/cw_amen03_167.wav')
await proj.loadSample('/samples/cw_amen05_158.wav')
await proj.loadSample('/samples/loop.wav')

trackerNode.port.postMessage({
  type: 'addSample',
  sample: proj.samples[1].getChannelData(0),
})

window.addEventListener('keydown', (e) => {
  // start audio context on keydown
  if (audioCtx.state === 'suspended') {
    console.log('Audio context suspended, resuming...')
    audioCtx.resume()
  }

  if (e.key === 'ArrowDown') {
    cursor = (cursor + 1) % 16
    draw()
  }

  if (e.key === 'ArrowUp') {
    cursor = (cursor - 1 + 16) % 16
    draw()
  }

  if (e.key === ' ') {
    trackerNode.port.postMessage({
      type: 'playStop',
    })
  }
})

function draw() {
  gfx.clearAll()

  gfx.rectWH(4, 3 + cursor * (metrics.height + 3), 90, metrics.height + 1, '#003311')

  gfx.setColour('#ffffff')
  for (let i = 0; i < 16; i++) {
    const text = `» 0${i.toString(16)} A-5 64 A2`
    gfx.text(4, 4 + i * (metrics.height + 3), text)
  }
}
