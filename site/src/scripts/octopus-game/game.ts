import { drawWorld } from './draw'
import { type LeaderboardEntry, fetchLeaderboard, rankOf, submitScore } from './leaderboard'
import { MAXIMUM_FRAME_MILLISECONDS, type Run, randomSeed, seededRandom } from './run'
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
const PSEUDONYM_KEY = 'poulpalmes-pseudonym'
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
const submitForm = element<HTMLFormElement>('submit')
const pseudonymInput = element<HTMLInputElement>('pseudonym')
const submitStatus = element('submit-status')

const leaderboard = document.querySelector<HTMLElement>('[data-leaderboard]')!
const leaderboardList = leaderboard.querySelector<HTMLOListElement>('[data-leaderboard-list]')!
const leaderboardEntry = document.querySelector<HTMLTemplateElement>('[data-leaderboard-entry]')!

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

const readPseudonym = () => {
  try {
    return localStorage.getItem(PSEUDONYM_KEY) ?? ''
  } catch {
    return ''
  }
}

const savePseudonym = (pseudonym: string) => {
  try {
    localStorage.setItem(PSEUDONYM_KEY, pseudonym)
  } catch {
    return
  }
}

const pickOne = (messages: string[]) => messages[Math.floor(Math.random() * messages.length)]

const ordinal = (rank: number) => (rank === 1 ? '1er' : `${rank}e`)

const runStartingFrom = (startingWorld: World): Run => ({
  seed: randomSeed(),
  width: startingWorld.width,
  startY: startingWorld.octopus.y,
  frameMilliseconds: [],
  jetSteps: []
})

let world: World = createWorld(1)
let run = runStartingFrom(world)
let random = seededRandom(run.seed)
let displayedPhase: Phase = 'ready'
let crashedAt = 0
let record = readRecord()
let pseudonym = readPseudonym()
let scale = 1
let previousTimestamp = performance.now()

const showRecord = () => {
  element('personal-record').hidden = record === 0
  element('personal-record-score').textContent = String(record)
}

const leaderboardEntryElement = (entry: LeaderboardEntry, position: number) => {
  const entryElement = leaderboardEntry.content.firstElementChild!.cloneNode(true) as HTMLElement
  entryElement.querySelector('[data-rank]')!.textContent = String(position + 1)
  entryElement.querySelector('[data-pseudonym]')!.textContent = entry.pseudonym
  entryElement.querySelector('[data-score]')!.textContent = String(entry.score)
  entryElement.toggleAttribute('data-current-player', entry.pseudonym === pseudonym)
  return entryElement
}

const showLeaderboard = (entries: LeaderboardEntry[]) => {
  const [bestEntry] = entries
  leaderboardList.replaceChildren(...entries.map(leaderboardEntryElement))
  leaderboard.hidden = !bestEntry
  element('leaderboard-link').hidden = !bestEntry
  element('club-record').hidden = !bestEntry
  element('club-record-score').textContent = String(bestEntry?.score ?? '')
  element('club-record-holder').textContent = bestEntry?.pseudonym ?? ''
}

const showSubmitStatus = (message: string) => {
  submitStatus.textContent = message
  submitStatus.hidden = false
}

const submitStatusFor = (entries: LeaderboardEntry[]) => {
  const rank = rankOf(pseudonym, entries)
  return rank > 0
    ? `Enregistré au nom de ${pseudonym} : ${ordinal(rank)} du tableau d’honneur !`
    : `Enregistré au nom de ${pseudonym}, pas encore dans le top 10.`
}

const submitCurrentScore = async (event: SubmitEvent) => {
  event.preventDefault()
  pseudonym = pseudonymInput.value.trim()
  savePseudonym(pseudonym)
  submitForm.hidden = true
  showSubmitStatus('Enregistrement…')
  try {
    const entries = await submitScore(pseudonym, world.score, run)
    showLeaderboard(entries)
    showSubmitStatus(submitStatusFor(entries))
  } catch (error) {
    submitForm.hidden = false
    showSubmitStatus((error as Error).message)
  }
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
  submitForm.hidden = world.score === 0
  pseudonymInput.value = pseudonym
  submitStatus.hidden = true
  if (world.score === 0) {
    showSubmitStatus('Passez au moins un rocher pour entrer au tableau d’honneur.')
  }
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
  if (world.phase === 'playing' && run.jetSteps.at(-1) === run.frameMilliseconds.length) return
  if (world.phase === 'ready') {
    run = runStartingFrom(world)
    random = seededRandom(run.seed)
  } else {
    run.jetSteps.push(run.frameMilliseconds.length)
  }
  world = jet(world, random)
}

const frame = (timestamp: number) => {
  const frameMilliseconds = Math.min(
    Math.round(timestamp) - Math.round(previousTimestamp),
    MAXIMUM_FRAME_MILLISECONDS
  )
  previousTimestamp = timestamp
  if (world.phase === 'playing') run.frameMilliseconds.push(frameMilliseconds)
  world = step(world, frameMilliseconds / 1000, random)

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
  if ((event.target as Element).closest('button, a, form')) return
  event.preventDefault()
  act()
})

element('play').addEventListener('click', act)
element('replay').addEventListener('click', act)
submitForm.addEventListener('submit', submitCurrentScore)

window.addEventListener('keydown', (event) => {
  if (event.code !== 'Space' && event.code !== 'ArrowUp') return
  if (event.target instanceof HTMLInputElement) return
  event.preventDefault()
  if (!event.repeat) act()
})

new ResizeObserver(resizeCanvas).observe(canvas)
resizeCanvas()
showRecord()
showScreenFor('ready')
requestAnimationFrame(frame)
fetchLeaderboard()
  .then(showLeaderboard)
  .catch(() => {})
