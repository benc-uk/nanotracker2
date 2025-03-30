// ====================================================================================
// Module: audio.js
// An audio worklet processor that generates a simple sine wave.
// ====================================================================================
// @ts-check
/*eslint no-unused-vars: "off"*/

/** @import { Row, Instrument, Note, Project } from "./data.js" */

class Track {
  /** @type {number} */
  sampleIndex = 0

  /** @type {Note | null} */
  activeNote

  /** @type {number} */
  trackNum

  stopped = false

  constructor(trackNum) {
    this.trackNum = trackNum
  }

  /** @param {Row} row */
  processRow(row) {
    if (row.note) {
      this.activeNote = row.note
      this.sampleIndex = 0
      this.stopped = false
    }
  }

  getSample() {
    if (!this.activeNote) return null
    if (this.stopped) return null

    const inst = this.activeNote.inst
    if (!inst) return null

    const sample = inst.sample
    if (!sample) return null

    if (this.sampleIndex >= sample.leftData.length) {
      this.stopped = true
      this.sampleIndex = 0
    }

    const leftData = sample.leftData[this.sampleIndex]
    const rightData = sample.rightData[this.sampleIndex]

    this.sampleIndex++

    return {
      left: leftData,
      right: rightData,
    }
  }
}

export class TrackerProcessor extends AudioWorkletProcessor {
  /** @type {number} */
  samplesOffset

  /** @type {boolean} */
  playing

  /** @type {Project | null} */
  project

  /** @type {Track[]} */
  tracks = []

  constructor(number) {
    super()

    console.log(`TrackerProcessor created, sample rate: ${sampleRate}`)

    this.port.onmessage = this.messageHandler.bind(this)
    this.playing = false
    this.samples = 0
    this.ticks = 0
    this.row = 0
    this.number = number

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
        this.tracks.push(new Track(i))
      }
    }

    if (event.data.type === 'playStop') {
      this.playing = !this.playing
      this.row = 0
      this.ticks = 0
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

    const songRow = this.project.song[0]

    for (const track of this.tracks) {
      const patternId = songRow[track.trackNum]
      if (patternId === undefined || patternId === -1) continue

      const pattern = this.project.patterns[patternId]

      const row = pattern.rows[this.row]
      track.processRow(row)
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

        channelL[i] += sample.left
        channelR[i] += sample.right
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
