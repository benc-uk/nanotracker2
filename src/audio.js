// ====================================================================================
// Module: audio.js
// An audio worklet processor that generates a simple sine wave.
// ====================================================================================
// @ts-check
/*eslint no-unused-vars: "off"*/

import { Track } from './track.js'

/** @import { Project } from "./data.js" */

export class TrackerProcessor extends AudioWorkletProcessor {
  /** @type {number} */
  samplesOffset

  /** @type {boolean} */
  playing

  /** @type {Project | null} */
  project

  /** @type {Track[]} */
  tracks = []

  constructor() {
    super()

    console.log(`TrackerProcessor created, sample rate: ${sampleRate}`)

    this.port.onmessage = this.messageHandler.bind(this)
    this.playing = false
    this.samples = 0 // Counts the number of samples processed in the current tick
    this.ticks = 0 // Counts the number of ticks processed in the current row
    this.row = 0 // Counts the number of rows processed in the current pattern

    this.bpm = 142
    this.ticksPerRow = 6
    this.samplesPerTick = (sampleRate * 60) / this.bpm / 4 / 6
  }

  /**
   * Handler for incoming messages
   * @param {MessageEvent} event
   */
  async messageHandler(event) {
    if (event.data.type === 'loadProject') {
      this.project = event.data.project
      if (!this.project) return

      this.tracks = []
      for (let i = 0; i < this.project.trackCount; i++) {
        const t = new Track(i)
        this.tracks.push(t)
      }
    }

    if (event.data.type === 'play') {
      this.playing = true
      this.ticks = 0

      // Read the first row
      this.row = -1
      this.nextRow()
    }

    if (event.data.type === 'stop') {
      this.playing = false
    }
  }

  nextTick() {
    this.ticks++
    if (this.ticks >= this.ticksPerRow) {
      this.ticks = 0
      this.nextRow()
    }
  }

  nextRow() {
    if (!this.project) return

    // HACK: This is temporary, we need to get the song row from the project
    const songRow = this.project.song[0]

    for (const track of this.tracks) {
      const patternId = songRow[track.trackNum]
      if (patternId === null) continue

      const pattern = this.project.patterns[patternId]

      const row = pattern.rows[this.row]
      if (!row) continue

      track.playRow(row)
    }

    this.row++

    if (this.row >= this.project.patterns[0].length) {
      this.row = 0
    }

    this.port.postMessage({
      type: 'nextRow',
      row: this.row,
    })
  }

  /**
   * Audio processing loop
   * @param {Float32Array[][]} inputs - Input audio data
   * @param {Float32Array[][]} outputs - Output audio data
   */
  process(inputs, outputs) {
    if (!this.playing) return true
    if (!this.project) return true

    const channelL = outputs[0][0]
    const channelR = outputs[0][1]
    const bufferLen = channelL.length

    for (let i = 0; i < bufferLen; i++) {
      for (const track of this.tracks) {
        const sample = track.getSample()
        if (!sample) continue

        channelL[i] += sample[0]
        channelR[i] += sample[1]
      }

      this.samples++
      if (this.samples >= this.samplesPerTick) {
        this.samples = 0
        this.nextTick()
      }
    }

    return true
  }
}

registerProcessor('tracker-processor', TrackerProcessor)
