// ====================================================================================
// Module: audio.js
// An audio worklet processor that generates a simple sine wave.
// ====================================================================================
// @ts-check

export class TrackerProcessor extends AudioWorkletProcessor {
  #prevFreq = 440
  #d = 0

  constructor() {
    super()
  }

  static get parameterDescriptors() {
    return [
      {
        name: 'frequency',
        defaultValue: 440,
        minValue: 0,
        maxValue: 0.5 * sampleRate,
        automationRate: 'a-rate',
      },

      {
        name: 'volume',
        defaultValue: 1,
        minValue: 0,
        maxValue: 1,
        automationRate: 'a-rate',
      },
    ]
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0]
    const freqs = parameters.frequency
    const vols = parameters.volume

    output.forEach((channel) => {
      for (let i = 0; i < channel.length; i++) {
        const freq = freqs.length > 1 ? freqs[i] : freqs[0]
        const vol = vols.length > 1 ? vols[i] : vols[0]

        const globTime = currentTime + i / sampleRate
        this.#d += globTime * (this.#prevFreq - freq)
        this.#prevFreq = freq

        channel[i] = Math.sin(2 * Math.PI * globTime * freq + this.#d) * vol * 0.5
      }
    })

    return true
  }
}

registerProcessor('tracker-processor', TrackerProcessor)
