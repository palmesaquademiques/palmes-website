type TeamMember = {
  slug: string
  name: string
  nickname?: string
  team: 'board' | 'committee' | 'none'
  role: string
  title: string
  instructorLevel?: 'E1' | 'E2' | 'N4' | 'MF1' | 'MF2'
  order: number
}

export const TEAM_2025_2026: TeamMember[] = [
  {
    slug: 'marion-cabrol',
    name: 'Marion Cabrol',
    team: 'board',
    role: 'Présidente · Co-référente harcèlement',
    title: 'Grande Amirale des Abysses',
    order: 1
  },
  {
    slug: 'jules-clero',
    name: 'Jules Cléro',
    team: 'board',
    role: 'Trésorier',
    title: 'Grand Argentier des Trésors Engloutis',
    instructorLevel: 'E1',
    order: 2
  },
  {
    slug: 'muriel-piwowarczyk',
    name: 'Muriel Piwowarczyk',
    team: 'board',
    role: 'Secrétaire',
    title: 'Garde des Sceaux Étanches',
    order: 3
  },
  {
    slug: 'elie-trognon',
    name: 'Elie Trognon',
    team: 'committee',
    role: 'Vice-président et adjoint matériel',
    title: 'Connétable des Mers',
    instructorLevel: 'N4',
    order: 10
  },
  {
    slug: 'nicolas-scotto-di-rinaldi',
    name: 'Nicolas Scotto di Rinaldi',
    team: 'committee',
    role: 'Trésorier adjoint',
    title: 'Gardien du Coffre Corallien',
    instructorLevel: 'E1',
    order: 11
  },
  {
    slug: 'sophie-danguy',
    name: 'Sophie Danguy',
    team: 'committee',
    role: 'Secrétaire adjoint',
    title: 'Scribe des Marées',
    order: 12
  },
  {
    slug: 'pascal-khair',
    name: 'Pascal Khair',
    team: 'committee',
    role: 'Secrétaire adjoint',
    title: 'Scribe des Courants',
    order: 13
  },
  {
    slug: 'dominique-ponrouch',
    name: 'Dominique Ponrouch',
    nickname: 'Doumé',
    team: 'committee',
    role: 'Responsable formations',
    title: 'Oracle de l’Ordre des Palmes',
    instructorLevel: 'MF1',
    order: 14
  },
  {
    slug: 'anne-villeneuve',
    name: 'Anne Villeneuve',
    team: 'committee',
    role: 'Responsable sorties · Co-référente harcèlement',
    title: 'Grande Navigatrice des Expéditions',
    order: 15
  },
  {
    slug: 'hakima-el-ouakiri',
    name: 'Hakima El Ouakiri',
    team: 'committee',
    role: 'Responsable matériel',
    title: 'Garde de l’Armurerie',
    order: 16
  },
  {
    slug: 'lena-maury',
    name: 'Léna Maury',
    team: 'committee',
    role: 'Responsable événementiel',
    title: 'Capitaine des Festins',
    order: 17
  },
  {
    slug: 'constance-gay',
    name: 'Constance Gay',
    team: 'committee',
    role: 'Responsable site internet',
    title: 'Mage du Grimoire Numérique',
    order: 18
  },
  {
    slug: 'miryam-quintero',
    name: 'Miryam Quintero',
    team: 'committee',
    role: 'Membre du comité directeur',
    title: 'Sentinelle des Profondeurs',
    order: 19
  }
]
