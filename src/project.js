// @ts-check

export class Project {
  /** @type {AudioBuffer[]} */
  samples = []

  /** @type {AudioContext} */
  audioContext

  /**
   * Creates a new Project instance.
   * @param {AudioContext} audioContext - The AudioContext to use for audio processing.
   */
  constructor(audioContext) {
    this.audioContext = audioContext
  }

  /**
   * Loads a sample from a URL and decodes it into an AudioBuffer.
   * @param {string} url - The URL of the sample to load.
   * @returns {Promise<void>}
   */
  async loadSample(url) {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
    this.samples.push(audioBuffer)
    console.log(`Loaded sample: ${url}, length: ${audioBuffer.length}, channels: ${audioBuffer.numberOfChannels}`)
  }
}
