// ====================================================================================
// Module: audio-worker.js
// Core audio processing module for the tracker implemented as an audio worklet
// ====================================================================================
// @ts-check

/** @import { Project, Row, Note } from "./data.js" */

class Track {
  /** @type {number} */
  sampleIndex = 0

  /** @type {Note | null} */
  activeNote

  /** @type {number} */
  trackNum

  stopped = true

  /** @type {number} */
  sampleInc = 1

  constructor(trackNum) {
    this.trackNum = trackNum
  }

  /** @param {Row} row */
  playRow(row) {
    if (row.note) {
      this.activeNote = row.note
      this.sampleIndex = 0
      this.stopped = false

      // HACK: This is almost definitely wrong, but it works for now
      this.sampleInc = this.activeNote.value / 60
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
      console.log(`Looping sample ${this.activeNote.inst.loop}`)
      if (this.activeNote.inst.loop) {
        this.sampleIndex = 0
      } else {
        this.stopped = true
        this.sampleIndex = 0
      }
    }

    // sampleIndex is a float we crudely convert to an int
    // TODO: Aliasing here?
    const index = Math.floor(this.sampleIndex)
    const leftData = (sample.leftData[index] || 0) * this.activeNote.volume
    const rightData = (sample.rightData[index] || 0) * this.activeNote.volume

    // Move the sample index forward, but it might be a fractional va lue
    this.sampleIndex += this.sampleInc

    return [leftData, rightData]
  }
}

// =====================================================================================

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
    this.playingSongRow = 0 // Which row of the song are we playing
    this.songPatterns = [] // The patterns of the current song row
    this.tracks = [] // The tracks of the current song row

    this.bpm = 138
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

      this.songPatterns = this.project.song[this.playingSongRow]
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

    for (const track of this.tracks) {
      const patternId = this.songPatterns[track.trackNum]
      if (patternId === null) continue

      const pattern = this.project.patterns[patternId]

      const row = pattern.rows[this.row]
      if (!row) continue

      track.playRow(row)
    }

    this.row++

    // End of pattern, go to next song row
    if (this.row >= this.project.patterns[0].length) {
      this.row = 0
      this.playingSongRow++
      if (this.playingSongRow >= this.project.song.length) {
        this.playingSongRow = 0
      }

      this.port.postMessage({
        type: 'nextSongRow',
        row: this.playingSongRow,
      })

      this.songPatterns = this.project.song[this.playingSongRow]
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
