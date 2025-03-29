// ====================================================================================
// Module: audio.js
// An audio worklet processor that generates a simple sine wave.
// ====================================================================================
// @ts-check

/** @import { Project } from "./data.js" */

export class TrackerProcessor extends AudioWorkletProcessor {
  /** @type {number} */
  samplesOffset
  /** @type {boolean} */
  playing
  /** @type {Project | null} */
  project

  constructor() {
    super()

    this.port.onmessage = this.messageHandler.bind(this)
    this.playing = false
    this.samplesOffset = 0
    this.ticks = 0
    this.activeSample = null

    this.bpm = 128
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
      this.activeSample = this.project?.instruments[0].sample
      this.activeInst = this.project?.instruments[0]
    }

    if (event.data.type === 'playStop') {
      this.playing = !this.playing
      if (this.playing && this.activeSample) {
        this.activeSample.offset = 0
      }
    }
  }

  nextTick() {
    this.ticks++
    if (this.ticks >= this.ticksPerRow) {
      this.ticks = 0
      this.nextRow()
    }

    console.log('nextTick was called')
  }

  nextRow() {
    console.log('nextRow was called')

    this.port.postMessage({ type: 'nextRow' })
  }

  /**
   * Audio processing loop
   */
  process(inputs, outputs) {
    if (!this.playing) return true
    if (!this.project) return true
    if (!this.activeSample) return true

    const channelL = outputs[0][0]
    const channelR = outputs[0][1]
    const bufferLen = channelL.length

    for (let i = 0; i < bufferLen; i++) {
      const sampleIndex = i + this.activeSample.offset
      channelL[i] = this.activeSample.leftData[sampleIndex]
      channelR[i] = this.activeSample.rightData[sampleIndex]

      this.samplesOffset++
      if (this.samplesOffset >= this.samplesPerTick) {
        this.samplesOffset = 0
        this.nextTick()
      }
    }

    this.activeSample.offset += bufferLen

    if (this.activeInst?.loop) {
      if (this.activeSample.offset >= this.activeSample.length) {
        this.activeSample.offset = 0 //this.activeSample.offset - this.activeSample.length
      }
    }

    return true
  }
}

registerProcessor('tracker-processor', TrackerProcessor)
