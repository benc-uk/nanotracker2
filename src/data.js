// @ts-check

export class Sample {
  /** @type {Float32Array} */
  leftData = new Float32Array(0)

  /** @type {Float32Array} */
  rightData = new Float32Array(0)

  /** @type {number} */
  length = 0

  /** @type {number} */
  sampleRate = 0

  offset = 0

  constructor(audioBuffer) {
    this.leftData = audioBuffer.getChannelData(0)

    // Mono samples are duplicated to both channels
    if (audioBuffer.numberOfChannels === 1) {
      this.rightData = audioBuffer.getChannelData(0)
    }

    if (audioBuffer.numberOfChannels === 2) {
      this.rightData = audioBuffer.getChannelData(1)
    }

    this.length = audioBuffer.length
    this.sampleRate = audioBuffer.sampleRate
  }
}

export class Instrument {
  /** @type {Sample} */
  sample

  loop = false

  /**
   * @param {Sample} sample - The sample to use for this instrument.
   */
  constructor(sample) {
    this.sample = sample
  }
}

export class Note {
  /** @type {number} */
  note = 60

  /** @type {Instrument} */
  inst

  /** @type {number} */
  volume = 1.0

  /**
   * @param {number} num - The note number (MIDI note number).
   * @param {Instrument} inst - The instrument to use for this note.
   * @param {number} vol - The volume of the note (0.0 to 1.0).
   */
  constructor(num, inst, vol) {
    this.note = num
    this.inst = inst
    this.volume = vol
  }
}

export class Row {
  /** @type {Note | null} */
  note
}

export class Pattern {
  /** @type {number} */
  id = 0

  /** @type {Row[]} */
  rows = []

  /** @type {number} */
  length = 16

  constructor() {
    for (let i = 0; i < this.length; i++) {
      this.rows.push(new Row())
    }
  }
}

export class Project {
  /** @type {Instrument[]} */
  instruments = []

  /** @type {Record<number, Pattern>} */
  patterns = {}
}
