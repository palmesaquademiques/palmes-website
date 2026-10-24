import { drawWorld } from './draw'
import {
  type CrashCause,
  type Phase,
  WORLD_HEIGHT,
  type World,
  createWorld,
  diverLevelFor,
  jet,
  step
} from './world'

const RECORD_KEY = 'poulpalmes-record'
const RESTART_DELAY_SECONDS = 0.7

const CRASH_MESSAGES: Record<CrashCause, string[]> = {
  rock: ['Le poulpe s’est cogné !', 'Encre partout !', 'Oups, un rocher…'],
  seabed: ['Le poulpe a touché le fond !', 'Pensez à gonfler la stab !']
}

const container = document.querySelector<HTMLElement>('[data-game]')!
const canvas = container.querySelector<HTMLCanvasElement>('[data-game-canvas]')!
const context = canvas.getContext('2d')!
const element = <Element extends HTMLElement>(name: string) =>
  container.querySelector<Element>(`[data-game-${name}]`)!

const scoreDisplay = element('score')
const startScreen = element('start')
const overScreen = element('over')

const readRecord = () => {
  try {
    return Number(localStorage.getItem(RECORD_KEY)) || 0
  } catch {
    return 0
  }
}

const saveRecord = (score: number) => {
  try {
    localStorage.setItem(RECORD_KEY, String(score))
  } catch {
    return
  }
}

const pickOne = (messages: string[]) => messages[Math.floor(Math.random() * messages.length)]

let world: World = createWorld(1)
let displayedPhase: Phase = 'ready'
let crashedAt = 0
let record = readRecord()
let scale = 1
let previousTimestamp = performance.now()

const showRecord = () => {
  element('record-start').textContent = record > 0 ? `Record sur cet appareil : ${record}` : ''
}

const showScreenFor = (phase: Phase) => {
  startScreen.hidden = phase !== 'ready'
  overScreen.hidden = phase !== 'over'
  scoreDisplay.hidden = phase !== 'playing'
}

const showResults = () => {
  const isNewRecord = world.score > record
  if (isNewRecord) {
    record = world.score
    saveRecord(record)
  }
  element('message').textContent = pickOne(CRASH_MESSAGES[world.crashCause ?? 'rock'])
  element('final-score').textContent = String(world.score)
  element('record').textContent = String(record)
  element('level').textContent = diverLevelFor(world.score)
  element('new-record').hidden = !isNewRecord
  showRecord()
}

const resizeCanvas = () => {
  const { width, height } = canvas.getBoundingClientRect()
  const pixelRatio = Math.min(window.devicePixelRatio, 2)
  canvas.width = Math.round(width * pixelRatio)
  canvas.height = Math.round(height * pixelRatio)
  scale = canvas.height / WORLD_HEIGHT
  world = { ...world, width: (width / height) * WORLD_HEIGHT }
}

const act = () => {
  if (world.phase === 'over') {
    if (world.time - crashedAt < RESTART_DELAY_SECONDS) return
    world = createWorld(world.width)
  }
  world = jet(world, Math.random)
}

const frame = (timestamp: number) => {
  const deltaSeconds = Math.min((timestamp - previousTimestamp) / 1000, 1 / 30)
  previousTimestamp = timestamp
  world = step(world, deltaSeconds, Math.random)

  if (world.phase !== displayedPhase) {
    if (world.phase === 'over') {
      crashedAt = world.time
      showResults()
    }
    showScreenFor(world.phase)
    displayedPhase = world.phase
  }

  scoreDisplay.textContent = String(world.score)
  context.setTransform(scale, 0, 0, scale, 0, 0)
  drawWorld(context, world)
  requestAnimationFrame(frame)
}

container.addEventListener('pointerdown', (event) => {
  if ((event.target as Element).closest('button, a')) return
  event.preventDefault()
  act()
})

element('play').addEventListener('click', act)
element('replay').addEventListener('click', act)

window.addEventListener('keydown', (event) => {
  if (event.code !== 'Space' && event.code !== 'ArrowUp') return
  event.preventDefault()
  if (!event.repeat) act()
})

new ResizeObserver(resizeCanvas).observe(canvas)
resizeCanvas()
showRecord()
showScreenFor('ready')
requestAnimationFrame(frame)
