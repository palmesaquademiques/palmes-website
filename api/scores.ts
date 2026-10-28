import {
  MAXIMUM_FRAME_MILLISECONDS,
  type Run,
  seededRandom
} from '../site/src/scripts/octopus-game/run.js'
import {
  WORLD_HEIGHT,
  type World,
  createWorld,
  jet,
  step
} from '../site/src/scripts/octopus-game/world.js'

type LeaderboardEntry = { pseudonym: string; score: number }
type Submission = LeaderboardEntry & { run: Run }

const KEY_PREFIX = `poulpalmes:${process.env.VERCEL_ENV ?? 'development'}`
const LEADERBOARD_KEY = `${KEY_PREFIX}:leaderboard`
const SUBMITTED_RUNS_KEY = `${KEY_PREFIX}:submitted-runs`
const LEADERBOARD_SIZE = 10
const MAXIMUM_STEPS = 100_000
const MAXIMUM_WORLD_WIDTH = 6000
const PSEUDONYM_PATTERN = /^[\p{L}\p{N} '’._-]{2,20}$/u

const runRedisCommand = async (command: (string | number)[]) => {
  const response = await fetch(process.env.KV_REST_API_URL!, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(command)
  })
  if (!response.ok)
    throw new Error(`Upstash a répondu ${response.status} : ${await response.text()}`)
  const { result } = await response.json()
  return result
}

const readLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const pseudonymsAndScores: string[] = await runRedisCommand([
    'ZRANGE',
    LEADERBOARD_KEY,
    0,
    LEADERBOARD_SIZE - 1,
    'REV',
    'WITHSCORES'
  ])
  return Array.from({ length: pseudonymsAndScores.length / 2 }, (_entry, entryIndex) => ({
    pseudonym: pseudonymsAndScores[entryIndex * 2],
    score: Number(pseudonymsAndScores[entryIndex * 2 + 1])
  }))
}

const isNumberBetween = (value: unknown, minimum: number, maximum: number): value is number =>
  typeof value === 'number' && value >= minimum && value <= maximum

const isIntegerBetween = (value: unknown, minimum: number, maximum: number): value is number =>
  Number.isInteger(value) && isNumberBetween(value, minimum, maximum)

const isValidRun = (run: unknown): run is Run => {
  const { seed, width, startY, frameMilliseconds, jetSteps } = (run ?? {}) as Partial<Run>
  return (
    isIntegerBetween(seed, 0, 2 ** 32 - 1) &&
    isNumberBetween(width, 1, MAXIMUM_WORLD_WIDTH) &&
    isNumberBetween(startY, 0, WORLD_HEIGHT) &&
    Array.isArray(frameMilliseconds) &&
    frameMilliseconds.length <= MAXIMUM_STEPS &&
    frameMilliseconds.every((milliseconds) =>
      isIntegerBetween(milliseconds, 1, MAXIMUM_FRAME_MILLISECONDS)
    ) &&
    Array.isArray(jetSteps) &&
    jetSteps.every((jetStep, jetIndex) =>
      isIntegerBetween(jetStep, (jetSteps[jetIndex - 1] ?? -1) + 1, frameMilliseconds.length - 1)
    )
  )
}

const validSubmission = (body: unknown): Submission | null => {
  const { pseudonym, score, run } = (body ?? {}) as Partial<Record<keyof Submission, unknown>>
  const trimmedPseudonym = typeof pseudonym === 'string' ? pseudonym.trim() : ''
  return PSEUDONYM_PATTERN.test(trimmedPseudonym) &&
    isIntegerBetween(score, 1, Number.MAX_SAFE_INTEGER) &&
    isValidRun(run)
    ? { pseudonym: trimmedPseudonym, score, run }
    : null
}

const replayedWorld = (run: Run): World => {
  const random = seededRandom(run.seed)
  const jetStepSet = new Set(run.jetSteps)
  const startingWorld = createWorld(run.width)
  const firstJetWorld = jet(
    { ...startingWorld, octopus: { ...startingWorld.octopus, y: run.startY } },
    random
  )
  return run.frameMilliseconds.reduce((world, milliseconds, stepIndex) => {
    if (world.phase === 'over') return world
    const jettedWorld = jetStepSet.has(stepIndex) ? jet(world, random) : world
    // Particles never change the outcome, and dropping them keeps a flood of jets cheap to replay.
    return step({ ...jettedWorld, particles: [] }, milliseconds / 1000, random)
  }, firstJetWorld)
}

const refusal = (message: string) => new Response(message, { status: 422 })

export const GET = async () => Response.json(await readLeaderboard())

export const POST = async (request: Request) => {
  const submission = validSubmission(await request.json().catch(() => null))
  if (!submission) return refusal('Pseudo ou partie invalide.')

  const replayed = replayedWorld(submission.run)
  if (replayed.phase !== 'over' || replayed.score !== submission.score)
    return refusal('Score refusé : cette partie n’a pas pu être vérifiée.')

  const isNewRun = (await runRedisCommand(['SADD', SUBMITTED_RUNS_KEY, submission.run.seed])) === 1
  if (!isNewRun) return refusal('Cette partie est déjà enregistrée.')

  await runRedisCommand(['ZADD', LEADERBOARD_KEY, 'GT', submission.score, submission.pseudonym])
  return Response.json(await readLeaderboard())
}
