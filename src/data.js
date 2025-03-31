// ====================================================================================
// Module: data.js
// Core data structures for the tracker
// ====================================================================================
// @ts-check

import decodeAudio from 'audio-decode'

/**
 * The project is the main data structure for the tracker.
 * It contains all the instruments, patterns, and song data.
 */
export class Project {
  /** @type {Instrument[]} */
  instruments = []

  /** @type {number} */
  nextFreeInstrumentId = 0

  /** @type {Record<number, Pattern>} */
  patterns = {}

  // Song data [row, track] = patternId
  /** @type {number[][]} */
  song = []

  /** @type {number} */
  trackCount = 8

  /** @type {string} */
  name = 'Untitled'

  addSongRow() {
    this.song.push(new Array(this.trackCount).fill(-1))
  }

  /**
   * Loads a project from a URL and returns a Project object.
   * @param {string} url - The URL of the project to load.
   */
  static async load(url) {
    console.log(`Loading project from ${url}`)

    const project = new Project()

    const resp = await fetch(url)
    if (!resp.ok) {
      throw new Error(`Failed to load project: ${resp.statusText}`)
    }

    const data = await resp.json()
    if (!data) {
      throw new Error('Failed to parse project data, JSON is invalid')
    }

    for (const instData of data.instruments) {
      const sample = await Sample.load(instData.sampleUrl)
      const instrument = new Instrument(instData.id, sample)
      project.instruments[instData.id] = instrument
    }

    for (const patData of data.patterns) {
      if (patData.rows.length !== patData.length) {
        console.warn(`💩 Pattern ${patData.id} has ${patData.rows.length} rows, expected ${patData.length}`)
      }

      const pattern = new Pattern(patData.id, patData.length, patData.name)
      project.patterns[patData.id] = pattern

      let row = 0
      for (const rowData of patData.rows) {
        if (rowData) {
          const noteData = rowData.note
          const note = new Note(noteData.value, project.instruments[noteData.instrumentId], noteData.volume)
          pattern.rows[row].note = note
        }

        row++
      }
    }

    for (const songRow of data.song) {
      project.song.push(songRow)
    }

    project.name = data.name || 'Untitled'

    return project
  }
}

/**
 * A thin wrapper around an AudioBuffer which exposes the left and right channel data.
 * This is used to load samples into the tracker.
 */
export class Sample {
  /** @type {Float32Array} */
  leftData = new Float32Array(0)

  /** @type {Float32Array} */
  rightData = new Float32Array(0)

  /** @type {number} */
  length = 0

  /** @type {number} */
  sampleRate = 48000

  /**
   * Creates a new Sample instance.
   * @param {AudioBuffer} audioBuffer - The AudioBuffer to use to create the sample.
   */
  constructor(audioBuffer) {
    this.leftData = audioBuffer.getChannelData(0)

    // Mono samples are duplicated to both channels, I guess this the best way to do it
    if (audioBuffer.numberOfChannels === 1) {
      this.rightData = audioBuffer.getChannelData(0)
    }

    if (audioBuffer.numberOfChannels === 2) {
      this.rightData = audioBuffer.getChannelData(1)
    }

    this.length = audioBuffer.length
    this.sampleRate = audioBuffer.sampleRate

    console.log(`Sample loaded: ${this.length} samples, ${this.sampleRate} Hz`)
  }

  /**
   * Loads a sample from a URL and decodes it into an AudioBuffer.
   * @param {string} url - The URL of the sample to load.
   */
  static async load(url) {
    console.log(`Loading sample from ${url}`)

    const resp = await fetch(url)
    if (!resp.ok) {
      throw new Error(`Failed to load sample: ${resp.statusText}`)
    }

    const arrayBuffer = await resp.arrayBuffer()
    const audioBuffer = await decodeAudio(arrayBuffer)

    return new Sample(audioBuffer)
  }
}

/**
 * An instrument wraps a sample and provides many other properties.
 */
export class Instrument {
  /** @type {number} */
  id

  /** @type {Sample} */
  sample

  /** @type {boolean} */
  loop = false

  /**
   * @param {number} id - The id of the instrument.
   * @param {Sample} sample - The sample to use for this instrument.
   */
  constructor(id, sample) {
    this.id = id
    this.sample = sample
  }

  /**
   * Returns a string representation of the instrument in hexadecimal format.
   * @returns {string}
   */
  toString() {
    return this.id.toString(16).padStart(2, '0')
  }
}

/**
 * A note is a single note in the tracker. It contains a note number, an instrument, and a volume.
 * The note number is a MIDI note number (0-127).
 */
export class Note {
  /** @type {number} */
  value = 60

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
    this.value = num
    this.inst = inst
    this.volume = vol
  }

  /**
   * Returns a string representation of the note in the format "C-4", "D#5", etc.
   */
  noteString() {
    const noteNames = ['C-', 'C#', 'D-', 'D#', 'E-', 'F-', 'F#', 'G-', 'G#', 'A-', 'A#', 'B-']
    const octave = Math.floor(this.value / 12) - 1
    const noteName = noteNames[this.value % 12]
    return `${noteName}${octave}`
  }

  /**
   * Returns a string representation of the note in hexadecimal format.
   * @returns {string}
   */
  volumeString() {
    return Math.floor(this.volume * 127)
      .toString(16)
      .padStart(2, '0')
  }
}

/**
 * A row in a pattern. Contains a note and other properties.
 */
export class Row {
  /** @type {Note | null} */
  note
}

/**
 * A pattern is a collection of rows (and thus notes)
 * It is referenced by the song data by its id.
 */
export class Pattern {
  /** @type {number} */
  id = 0

  /** @type {Row[]} */
  rows = []

  /** @type {number} */
  length = 0

  /** @type {string} */
  name = ''

  constructor(id, length = 16, name = '') {
    this.id = id
    this.length = length
    this.name = name === '' ? `Pattern ${id}` : name

    for (let i = 0; i < this.length; i++) {
      this.rows.push(new Row())
    }
  }
}
