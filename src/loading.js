// @ts-check

import { Project, Sample } from './data'

export async function loadProject(url) {
  console.log(`Loading project from ${url}`)

  const project = new Project()

  // HACK: This is a temporary fix for the project loading
  // until we have a proper project format

  return project
}

/**
 * Loads a sample from a URL and decodes it into an AudioBuffer.
 * @param {string} url - The URL of the sample to load.
 */
export async function loadSample(url, audioContext) {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

  console.log(
    `Loaded sample: ${url}, length: ${audioBuffer.length}, channels: ${audioBuffer.numberOfChannels} sample rate: ${audioBuffer.sampleRate}`,
  )

  return new Sample(audioBuffer)
}
