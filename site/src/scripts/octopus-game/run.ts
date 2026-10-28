export type Run = {
  seed: number
  width: number
  startY: number
  frameMilliseconds: number[]
  jetSteps: number[]
}

export const MAXIMUM_FRAME_MILLISECONDS = 33

export const randomSeed = () => Math.floor(Math.random() * 2 ** 32)

export const seededRandom = (seed: number) => {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    const mixed = Math.imul(state ^ (state >>> 15), state | 1)
    const remixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61)) ^ mixed
    return ((remixed ^ (remixed >>> 14)) >>> 0) / 2 ** 32
  }
}
