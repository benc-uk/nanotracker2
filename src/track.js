export class Track {
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
      this.stopped = true
      this.sampleIndex = 0
    }

    // sampleIndex is a float, lets' antialias it
    const index = Math.floor(this.sampleIndex)
    const leftData = (sample.leftData[index] || 0) * this.activeNote.volume
    const rightData = (sample.rightData[index] || 0) * this.activeNote.volume

    // Move the sample index forward, but it might be a fractional va lue
    this.sampleIndex += this.sampleInc

    return [leftData, rightData]
  }
}
