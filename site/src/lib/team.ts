import type { InstructorLevel, Member } from './queries'

type LevelDetails = { label: string; title: string; isAtSea: boolean; rank: number }

export const instructorLevels: Record<InstructorLevel, LevelDetails> = {
  E1: { label: 'Initiateur', title: 'Sentinelle des Bassins', isAtSea: false, rank: 1 },
  E2: {
    label: 'Initiateur et guide de palanquée',
    title: 'Sentinelle des Mers',
    isAtSea: true,
    rank: 2
  },
  N4: { label: 'Guide de palanquée', title: 'Guide des Profondeurs', isAtSea: true, rank: 3 },
  MF1: {
    label: 'Moniteur fédéral 1er degré',
    title: 'Capitaine des Profondeurs',
    isAtSea: true,
    rank: 4
  },
  MF2: {
    label: 'Moniteur fédéral 2e degré',
    title: 'Capitaine des Abysses',
    isAtSea: true,
    rank: 5
  }
}

export type Instructor = Member & { instructorLevel: InstructorLevel }

const isInstructor = (member: Member): member is Instructor => member.instructorLevel !== null

const byLevelDescending = (first: Instructor, second: Instructor) =>
  instructorLevels[second.instructorLevel].rank - instructorLevels[first.instructorLevel].rank

export const groupTeam = (members: Member[]) => {
  const instructors = members.filter(isInstructor).toSorted(byLevelDescending)
  return {
    board: members.filter((member) => member.team === 'board'),
    committee: members.filter((member) => member.team === 'committee'),
    poolInstructors: instructors.filter(
      (member) => !instructorLevels[member.instructorLevel].isAtSea
    ),
    seaInstructors: instructors.filter((member) => instructorLevels[member.instructorLevel].isAtSea)
  }
}

export const displayName = ({ name, nickname }: Member) => {
  if (!nickname) return name
  const [firstName, ...lastNames] = name.split(' ')
  return [firstName, `«\u00a0${nickname}\u00a0»`, ...lastNames].join(' ')
}
