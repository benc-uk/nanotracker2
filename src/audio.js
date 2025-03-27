// ====================================================================================
// Module: audio.js
// An audio worklet processor that generates a simple sine wave.
// ====================================================================================
// @ts-check

export class TrackerProcessor extends AudioWorkletProcessor {
  /** @type {Float32Array | null} */
  sample

  constructor() {
    super()

    this.port.onmessage = this.onmessage.bind(this)
    this.offset = 0
    this.playing = false
  }

  onmessage(event) {
    if (event.data.type === 'addSample') {
      this.sample = event.data.sample
    }

    if (event.data.type === 'playStop') {
      this.playing = !this.playing
    }
  }

  process(inputs, outputs) {
    if (!this.playing) return true
    if (!this.sample) return true

    const channelL = outputs[0][0]
    const channelR = outputs[0][1]

    for (let i = 0; i < channelL.length; i++) {
      const sampleIndex = i + (this.offset % this.sample.length)
      // channelL[i] = this.sample[sampleIndex]
      channelR[i] = this.sample[sampleIndex]
    }

    this.offset += channelL.length

    return true
  }
}

registerProcessor('tracker-processor', TrackerProcessor)
