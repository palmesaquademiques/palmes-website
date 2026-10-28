import type { Run } from './run'

export type LeaderboardEntry = { pseudonym: string; score: number }

const LEADERBOARD_URL = '/api/scores'
const UNAVAILABLE_MESSAGE = 'Le classement ne répond pas, réessayez dans un instant.'

const leaderboardFrom = async (response: Response): Promise<LeaderboardEntry[]> => {
  if (response.status === 422) throw new Error(await response.text())
  if (!response.ok) throw new Error(UNAVAILABLE_MESSAGE)
  return response.json()
}

export const fetchLeaderboard = () => fetch(LEADERBOARD_URL).then(leaderboardFrom)

export const submitScore = (pseudonym: string, score: number, run: Run) =>
  fetch(LEADERBOARD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pseudonym, score, run })
  })
    .catch(() => {
      throw new Error(UNAVAILABLE_MESSAGE)
    })
    .then(leaderboardFrom)

export const rankOf = (pseudonym: string, entries: LeaderboardEntry[]) =>
  entries.findIndex((entry) => entry.pseudonym === pseudonym) + 1
