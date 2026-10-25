type TeamMember = {
  slug: string
  name: string
  nickname?: string
  team: 'board' | 'committee' | 'none'
  role?: string
  title?: string
  emblem?: string
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
    secretTitle: 'Champion du vidage de masque',
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
    secretTitle: 'Ne remonte respirer que par politesse',
    instructorLevel: 'E1',
    order: 11
  },
  {
    slug: 'sophie-danguy',
    name: 'Sophie Danguy',
    team: 'committee',
    role: 'Secrétaire adjoint',
    title: 'Octopus de la Garde des Sceaux',
    emblem: 'tentacleQuill',
    order: 12
  },
  {
    slug: 'pascal-khair',
    name: 'Pascal Khair',
    team: 'committee',
    role: 'Secrétaire adjoint',
    title: 'Octopus de la Garde des Sceaux',
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
    title: 'Intendante des Banquets Royaux',
    emblem: 'champagne',
    order: 17
  },
  {
    slug: 'constance-gay',
    name: 'Constance Gay',
    team: 'committee',
    role: 'Responsable site internet',
    title: 'Hippocampe du Web',
    emblem: 'seahorse',
    order: 18
  },
  {
    slug: 'laurence-janin',
    name: 'Laurence Janin',
    team: 'none',
    secretTitle: 'Reine du canard',
    instructorLevel: 'E1',
    order: 20
  },
  {
    slug: 'arnaud-lenoir',
    name: 'Arnaud Lenoir',
    team: 'none',
    secretTitle: 'Paparazzo des nudibranches',
    instructorLevel: 'E1',
    order: 21
  },
  {
    slug: 'gerard-brefel',
    name: 'Gérard Brefel',
    nickname: 'GG',
    team: 'none',
    secretTitle: 'A donné le premier coup de palme du club',
    instructorLevel: 'E2',
    order: 22
  },
  {
    slug: 'jean-claude-meunier',
    name: 'Jean-Claude Meunier',
    nickname: 'JC',
    team: 'none',
    secretTitle: 'Schtroumpf grognon',
    instructorLevel: 'E2',
    order: 23
  }
]
