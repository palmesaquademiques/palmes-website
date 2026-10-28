export type Phase = 'ready' | 'playing' | 'over'

export type CrashCause = 'rock' | 'seabed'

export type Octopus = { y: number; velocity: number; secondsSinceJet: number }

export type Obstacle = {
  x: number
  gapCenter: number
  gapHeight: number
  seed: number
  isPassed: boolean
}

export type Particle = {
  kind: 'bubble' | 'ink'
  x: number
  y: number
  velocityX: number
  velocityY: number
  radius: number
  age: number
  lifetime: number
}

export type World = {
  width: number
  phase: Phase
  crashCause: CrashCause | null
  time: number
  distance: number
  octopus: Octopus
  obstacles: Obstacle[]
  particles: Particle[]
  score: number
}

type Random = () => number

export const WORLD_HEIGHT = 720
export const SEABED_HEIGHT = 70
export const SEABED_TOP = WORLD_HEIGHT - SEABED_HEIGHT
export const OBSTACLE_WIDTH = 92
export const MANTLE_RADIUS = 19

const TENTACLES_OFFSET = 24
const TENTACLES_RADIUS = 11
const GRAVITY = 820
const JET_VELOCITY = -340
const MAXIMUM_FALL_SPEED = 430
const GAP_MARGIN = 90
const MAXIMUM_GAP_SHIFT = 200
const IDLE_SPEED = 60

const DIVER_LEVELS = [
  { minimumScore: 50, label: 'Moniteur' },
  { minimumScore: 35, label: 'Niveau 4' },
  { minimumScore: 20, label: 'Niveau 3' },
  { minimumScore: 10, label: 'Niveau 2' },
  { minimumScore: 5, label: 'Niveau 1' },
  { minimumScore: 0, label: 'Baptême' }
] as const

export type DiverLevel = (typeof DIVER_LEVELS)[number]['label']

export const diverLevelFor = (score: number) =>
  DIVER_LEVELS.find((level) => score >= level.minimumScore)!.label

export const octopusX = (world: World) => Math.min(world.width * 0.3, 280)

const obstacleSpacingFor = (width: number) => Math.min(Math.max(width * 0.6, 270), 330)

const speedFor = (score: number) => Math.min(175 + score * 4, 300)

const gapHeightFor = (score: number) => Math.max(220 - score * 2.5, 168)

const createObstacle = (
  x: number,
  score: number,
  previousGapCenter: number,
  random: Random
): Obstacle => {
  const gapHeight = gapHeightFor(score)
  const lowestCenter = Math.max(GAP_MARGIN + gapHeight / 2, previousGapCenter - MAXIMUM_GAP_SHIFT)
  const highestCenter = Math.min(
    SEABED_TOP - GAP_MARGIN - gapHeight / 2,
    previousGapCenter + MAXIMUM_GAP_SHIFT
  )
  return {
    x,
    gapCenter: lowestCenter + random() * (highestCenter - lowestCenter),
    gapHeight,
    seed: random(),
    isPassed: false
  }
}

const restingY = WORLD_HEIGHT * 0.6

export const createWorld = (width: number): World => ({
  width,
  phase: 'ready',
  crashCause: null,
  time: 0,
  distance: 0,
  octopus: { y: restingY, velocity: 0, secondsSinceJet: 1 },
  obstacles: [],
  particles: [],
  score: 0
})

const jetBubbles = (world: World, random: Random): Particle[] =>
  Array.from({ length: 7 }, () => ({
    kind: 'bubble',
    x: octopusX(world) - 8 + random() * 16,
    y: world.octopus.y + TENTACLES_OFFSET + 8 + random() * 10,
    velocityX: -50 - random() * 70,
    velocityY: 90 + random() * 90,
    radius: 1.5 + random() * 4,
    age: 0,
    lifetime: 1 + random() * 0.8
  }))

const inkCloud = (world: World, random: Random): Particle[] =>
  Array.from({ length: 16 }, () => {
    const angle = random() * Math.PI * 2
    const speed = 30 + random() * 90
    return {
      kind: 'ink',
      x: octopusX(world),
      y: world.octopus.y + 10,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      radius: 8 + random() * 10,
      age: 0,
      lifetime: 1.6 + random() * 1.2
    }
  })

export const jet = (world: World, random: Random): World => {
  if (world.phase === 'over') return world

  const startedWorld: World =
    world.phase === 'ready'
      ? {
          ...world,
          phase: 'playing',
          obstacles: [createObstacle(world.width + OBSTACLE_WIDTH, 0, world.octopus.y, random)]
        }
      : world

  return {
    ...startedWorld,
    octopus: { ...startedWorld.octopus, velocity: JET_VELOCITY, secondsSinceJet: 0 },
    particles: [...startedWorld.particles, ...jetBubbles(startedWorld, random)]
  }
}

const ageParticle = (particle: Particle, deltaSeconds: number): Particle => {
  const drag = 1 - 1.6 * deltaSeconds
  const buoyancy = particle.kind === 'bubble' ? -320 * deltaSeconds : 0
  const velocityX = particle.velocityX * drag
  const velocityY = particle.velocityY * drag + buoyancy
  return {
    ...particle,
    x: particle.x + velocityX * deltaSeconds,
    y: particle.y + velocityY * deltaSeconds,
    velocityX,
    velocityY,
    radius: particle.kind === 'ink' ? particle.radius + 26 * deltaSeconds : particle.radius,
    age: particle.age + deltaSeconds
  }
}

const ageParticles = (particles: Particle[], deltaSeconds: number) =>
  particles
    .map((particle) => ageParticle(particle, deltaSeconds))
    .filter((particle) => particle.age < particle.lifetime)

const circleTouchesRectangle = (
  circleX: number,
  circleY: number,
  radius: number,
  left: number,
  top: number,
  right: number,
  bottom: number
) => {
  const closestX = Math.max(left, Math.min(circleX, right))
  const closestY = Math.max(top, Math.min(circleY, bottom))
  return (circleX - closestX) ** 2 + (circleY - closestY) ** 2 < radius ** 2
}

const touchesObstacle = (world: World, obstacle: Obstacle) => {
  const left = obstacle.x - OBSTACLE_WIDTH / 2
  const right = obstacle.x + OBSTACLE_WIDTH / 2
  const gapTop = obstacle.gapCenter - obstacle.gapHeight / 2
  const gapBottom = obstacle.gapCenter + obstacle.gapHeight / 2
  const bodyParts = [
    { y: world.octopus.y, radius: MANTLE_RADIUS },
    { y: world.octopus.y + TENTACLES_OFFSET, radius: TENTACLES_RADIUS }
  ]

  return bodyParts.some(
    (bodyPart) =>
      circleTouchesRectangle(
        octopusX(world),
        bodyPart.y,
        bodyPart.radius,
        left,
        -100,
        right,
        gapTop
      ) ||
      circleTouchesRectangle(
        octopusX(world),
        bodyPart.y,
        bodyPart.radius,
        left,
        gapBottom,
        right,
        SEABED_TOP
      )
  )
}

const crashCauseOf = (world: World): CrashCause | null => {
  if (world.octopus.y + TENTACLES_OFFSET + TENTACLES_RADIUS > SEABED_TOP) return 'seabed'
  return world.obstacles.some((obstacle) => touchesObstacle(world, obstacle)) ? 'rock' : null
}

const withNextObstacle = (obstacles: Obstacle[], world: World, score: number, random: Random) => {
  const spacing = obstacleSpacingFor(world.width)
  const lastObstacle = obstacles[obstacles.length - 1]
  const needsObstacle = !lastObstacle || lastObstacle.x < world.width - spacing + OBSTACLE_WIDTH
  return needsObstacle
    ? [
        ...obstacles,
        createObstacle(
          (lastObstacle?.x ?? world.width) + spacing,
          score,
          lastObstacle?.gapCenter ?? world.octopus.y,
          random
        )
      ]
    : obstacles
}

const stepReady = (world: World, deltaSeconds: number): World => ({
  ...world,
  time: world.time + deltaSeconds,
  distance: world.distance + IDLE_SPEED * deltaSeconds,
  octopus: {
    ...world.octopus,
    y: restingY + Math.sin(world.time * 2.4) * 14,
    secondsSinceJet: world.octopus.secondsSinceJet + deltaSeconds
  },
  particles: ageParticles(world.particles, deltaSeconds)
})

const stepOver = (world: World, deltaSeconds: number): World => {
  const velocity = Math.min(world.octopus.velocity + 300 * deltaSeconds, 70)
  return {
    ...world,
    time: world.time + deltaSeconds,
    octopus: {
      ...world.octopus,
      velocity,
      y: Math.min(world.octopus.y + velocity * deltaSeconds, SEABED_TOP - TENTACLES_OFFSET - 6),
      secondsSinceJet: world.octopus.secondsSinceJet + deltaSeconds
    },
    particles: ageParticles(world.particles, deltaSeconds)
  }
}

const stepPlaying = (world: World, deltaSeconds: number, random: Random): World => {
  const speed = speedFor(world.score)
  const velocity = Math.min(world.octopus.velocity + GRAVITY * deltaSeconds, MAXIMUM_FALL_SPEED)
  const y = Math.max(world.octopus.y + velocity * deltaSeconds, MANTLE_RADIUS)

  const movedObstacles = world.obstacles
    .map((obstacle) => ({ ...obstacle, x: obstacle.x - speed * deltaSeconds }))
    .filter((obstacle) => obstacle.x > -OBSTACLE_WIDTH)

  const isNewlyPassed = (obstacle: Obstacle) =>
    !obstacle.isPassed && obstacle.x + OBSTACLE_WIDTH / 2 < octopusX(world)

  const score = world.score + movedObstacles.filter(isNewlyPassed).length
  const passedObstacles = movedObstacles.map((obstacle) =>
    isNewlyPassed(obstacle) ? { ...obstacle, isPassed: true } : obstacle
  )

  const nextWorld: World = {
    ...world,
    time: world.time + deltaSeconds,
    distance: world.distance + speed * deltaSeconds,
    octopus: { y, velocity, secondsSinceJet: world.octopus.secondsSinceJet + deltaSeconds },
    obstacles: withNextObstacle(passedObstacles, world, score, random),
    particles: ageParticles(world.particles, deltaSeconds),
    score
  }

  const crashCause = crashCauseOf(nextWorld)
  return crashCause
    ? {
        ...nextWorld,
        phase: 'over',
        crashCause,
        octopus: { ...nextWorld.octopus, velocity: 0 },
        particles: [...nextWorld.particles, ...inkCloud(nextWorld, random)]
      }
    : nextWorld
}

export const step = (world: World, deltaSeconds: number, random: Random): World => {
  if (world.phase === 'ready') return stepReady(world, deltaSeconds)
  if (world.phase === 'over') return stepOver(world, deltaSeconds)
  return stepPlaying(world, deltaSeconds, random)
}
