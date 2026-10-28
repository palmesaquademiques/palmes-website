type LeaderboardEntry = { pseudonym: string; score: number }

const KEY_PREFIX = `poulpalmes:${process.env.VERCEL_ENV ?? 'development'}`
const LEADERBOARD_KEY = `${KEY_PREFIX}:leaderboard`
const LEADERBOARD_SIZE = 10
const MAXIMUM_SCORE = 999
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

const validSubmission = (body: unknown): LeaderboardEntry | null => {
  const { pseudonym, score } = (body ?? {}) as Partial<Record<keyof LeaderboardEntry, unknown>>
  const trimmedPseudonym = typeof pseudonym === 'string' ? pseudonym.trim() : ''
  return PSEUDONYM_PATTERN.test(trimmedPseudonym) && isIntegerBetween(score, 1, MAXIMUM_SCORE)
    ? { pseudonym: trimmedPseudonym, score }
    : null
}

const refusal = (message: string) => new Response(message, { status: 422 })

export const GET = async () => Response.json(await readLeaderboard())

export const POST = async (request: Request) => {
  const submission = validSubmission(await request.json().catch(() => null))
  if (!submission) return refusal('Pseudo ou score invalide.')

  await runRedisCommand(['ZADD', LEADERBOARD_KEY, 'GT', submission.score, submission.pseudonym])
  return Response.json(await readLeaderboard())
}
