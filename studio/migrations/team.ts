type TeamMember = {
  slug: string
  name: string
  nickname?: string
  team: 'board' | 'committee' | 'none'
  role: string
  title: string
  emblem: string
  secretTitle?: string
  instructorLevel?: 'E1' | 'E2' | 'N4' | 'MF1' | 'MF2'
  order: number
}

export const TEAM_2025_2026: TeamMember[] = [
  {
    slug: 'marion-cabrol',
    name: 'Marion Cabrol',
    team: 'board',
    role: 'Présidente · Co-référente harcèlement',
    title: 'Reine des Palmes',
    emblem: 'crown',
    order: 1
  },
  {
    slug: 'jules-clero',
    name: 'Jules Cléro',
    team: 'board',
    role: 'Trésorier',
    title: 'Grand Argentier',
    emblem: 'coins',
    secretTitle: 'Expert ès vidage de masque',
    instructorLevel: 'E1',
    order: 2
  },
  {
    slug: 'muriel-piwowarczyk',
    name: 'Muriel Piwowarczyk',
    team: 'board',
    role: 'Secrétaire',
    title: 'Garde des Sceaux Étanches',
    emblem: 'seal',
    order: 3
  },
  {
    slug: 'elie-trognon',
    name: 'Elie Trognon',
    team: 'committee',
    role: 'Vice-président et adjoint matériel',
    title: 'Dauphin de la Reine',
    emblem: 'dolphin',
    secretTitle: 'Ne perd jamais sa palanquée',
    instructorLevel: 'N4',
    order: 10
  },
  {
    slug: 'nicolas-scotto-di-rinaldi',
    name: 'Nicolas Scotto di Rinaldi',
    team: 'committee',
    role: 'Trésorier adjoint',
    title: 'Octopus du Grand Argentier',
    emblem: 'tentacleCoin',
    secretTitle: 'As du canard',
    instructorLevel: 'E1',
    order: 11
  },
  {
    slug: 'sophie-danguy',
    name: 'Sophie Danguy',
    team: 'committee',
    role: 'Secrétaire adjoint',
    title: 'Octopus de la Plume',
    emblem: 'tentacleQuill',
    order: 12
  },
  {
    slug: 'pascal-khair',
    name: 'Pascal Khair',
    team: 'committee',
    role: 'Secrétaire adjoint',
    title: 'Octopus de l’Encrier',
    emblem: 'tentacleInkwell',
    order: 13
  },
  {
    slug: 'dominique-ponrouch',
    name: 'Dominique Ponrouch',
    nickname: 'Doumé',
    team: 'committee',
    role: 'Responsable formations',
    title: 'Grand Sage des Profondeurs',
    emblem: 'certificates',
    secretTitle: 'A formé des générations de plongeurs',
    instructorLevel: 'MF1',
    order: 14
  },
  {
    slug: 'anne-villeneuve',
    name: 'Anne Villeneuve',
    team: 'committee',
    role: 'Responsable sorties · Co-référente harcèlement',
    title: 'Grande Navigatrice des Expéditions',
    emblem: 'compass',
    order: 15
  },
  {
    slug: 'hakima-el-ouakiri',
    name: 'Hakima El Ouakiri',
    team: 'committee',
    role: 'Responsable matériel',
    title: 'Quartier-maître des stabs',
    emblem: 'loanTag',
    order: 16
  },
  {
    slug: 'lena-maury',
    name: 'Léna Maury',
    team: 'committee',
    role: 'Responsable événementiel',
    title: 'Bulle de Champagne de la Cour',
    emblem: 'champagne',
    order: 17
  },
  {
    slug: 'constance-gay',
    name: 'Constance Gay',
    team: 'committee',
    role: 'Responsable site internet',
    title: 'Araignée de mer du Web',
    emblem: 'spiderCrab',
    order: 18
  }
]
