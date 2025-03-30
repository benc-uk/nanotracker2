// @ts-check
import './style.css'

// @ts-ignore
import workletURL from './audio.js?url'
import * as gfx from './drawing.js'
import { Instrument, Note, Pattern } from './data.js'
import { loadProject, loadSample } from './loading.js'

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

const audioCtx = new AudioContext()
ac = audioCtx
await audioCtx.audioWorklet.addModule(workletURL)
const trackerNode = new AudioWorkletNode(audioCtx, 'tracker-processor', {
  numberOfOutputs: 1,
  outputChannelCount: [2],
})
trackerNode.connect(audioCtx.destination)

const project = await loadProject('/project.json')

const sample1 = await loadSample('/samples/DnB23.wav', audioCtx)
const sample2 = await loadSample('/samples/Kit 4/BD Propa 01.wav', audioCtx)
const sample3 = await loadSample('/samples/Kit 7/SD Sane 02.wav', audioCtx)
const sample4 = await loadSample('/samples/Kit 7/TM Room 03.wav', audioCtx)
const sample5 = await loadSample('/samples/Mini/HH Mini 3.wav', audioCtx)
const drumLoop = new Instrument(0, sample1)
drumLoop.loop = true

const snare = new Instrument(1, sample3)
const kick = new Instrument(2, sample2)
const bass = new Instrument(2, sample4)
const hat = new Instrument(3, sample5)

project.instruments.push(drumLoop)
project.instruments.push(snare)
project.instruments.push(kick)
project.instruments.push(bass)
project.instruments.push(hat)

project.addSongRow()
project.song[0] = [0, 1, 2, 3, -1, -1, -1, -1]

project.patterns[0] = new Pattern(0)
project.patterns[0].rows[0].note = new Note(60, kick, 1.0)
project.patterns[0].rows[8].note = new Note(60, kick, 1.0)
project.patterns[0].rows[2].note = new Note(60, kick, 1.0)
project.patterns[0].rows[11].note = new Note(60, kick, 1.0)
project.patterns[0].rows[15].note = new Note(60, kick, 1.0)

project.patterns[1] = new Pattern(1)
project.patterns[1].rows[4].note = new Note(60, snare, 1.0)
project.patterns[1].rows[12].note = new Note(60, snare, 1.0)

project.patterns[2] = new Pattern(2)
project.patterns[2].rows[2].note = new Note(60, bass, 1.0)
project.patterns[2].rows[6].note = new Note(60, bass, 1.0)

project.patterns[3] = new Pattern(3)
project.patterns[3].rows.forEach((row) => {
  row.note = new Note(60, hat, 1.0)
})

let activePattern = 0

trackerNode.port.postMessage({
  type: 'loadProject',
  project,
})

let row = 0
trackerNode.port.onmessage = (e) => {
  if (e.data.type === 'nextRow') {
    draw()
    row = e.data.row
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
    trackerNode.port.postMessage({
      type: 'playStop',
    })
    row = 0
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
    gfx.text(3, 3, `Pattern ${activePattern}`, '#ee4455')

    const offset = 30
    gfx.rectWH(0, offset - 2 + row * 10, 128, 10, '#041100')

    for (let i = 0; i < pattern.length; i++) {
      const row = pattern.rows[i]
      let rowNumColor = '#333355'
      if (i % 4 === 0) {
        rowNumColor = '#8888aa'
      }
      gfx.text(2, offset + i * 10, `${i.toString(16)}`, rowNumColor)

      if (row.note) {
        gfx.text(12, offset + +i * 10, `${row.note.noteName()} ${row.note.inst.id}  ${row.note.volume}`, '#ffffff')
      } else {
        gfx.text(12, offset + i * 10, `--- -- --`, '#444444')
      }
    }
  }
}
