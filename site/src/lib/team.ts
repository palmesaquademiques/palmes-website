import type { InstructorLevel, Member } from './queries'

type LevelDetails = { label: string; title: string; isAtSea: boolean; displayOrder: number }

export const instructorLevels: Record<InstructorLevel, LevelDetails> = {
  E1: { label: 'Initiateur', title: 'Précepteur des bassins', isAtSea: false, displayOrder: 1 },
  N4: {
    label: 'Guide de palanquée',
    title: 'Éclaireur des profondeurs',
    isAtSea: true,
    displayOrder: 2
  },
  E2: {
    label: 'Initiateur et guide de palanquée',
    title: 'Précepteur des mers',
    isAtSea: true,
    displayOrder: 3
  },
  MF1: {
    label: 'Moniteur fédéral 1er degré',
    title: 'Maître précepteur',
    isAtSea: true,
    displayOrder: 4
  },
  MF2: {
    label: 'Moniteur fédéral 2e degré',
    title: 'Grand précepteur',
    isAtSea: true,
    displayOrder: 5
  }
}

export const instructorTitleOf = (member: Instructor) =>
  member.instructorTitle ?? instructorLevels[member.instructorLevel].title

export type Instructor = Member & { instructorLevel: InstructorLevel }

const isInstructor = (member: Member): member is Instructor => member.instructorLevel !== null

const byDisplayOrder = (first: Instructor, second: Instructor) =>
  instructorLevels[second.instructorLevel].displayOrder -
  instructorLevels[first.instructorLevel].displayOrder

export const groupTeam = (members: Member[]) => {
  const instructors = members.filter(isInstructor).toSorted(byDisplayOrder)
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
