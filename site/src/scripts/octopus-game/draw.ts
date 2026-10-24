import {
  MANTLE_RADIUS,
  OBSTACLE_WIDTH,
  type Obstacle,
  type Particle,
  SEABED_TOP,
  WORLD_HEIGHT,
  type World,
  octopusX
} from './world'

type Context = CanvasRenderingContext2D

const MARINE_SNOW = Array.from({ length: 45 }, (_, flakeIndex) => ({
  x: (flakeIndex * 0.618034) % 1,
  y: (flakeIndex * 0.414214) % 1,
  depth: 0.3 + ((flakeIndex * 0.732) % 1) * 0.7,
  radius: 0.8 + ((flakeIndex * 0.297) % 1) * 1.3
}))

const LIGHT_RAYS = [0.12, 0.34, 0.58, 0.8]

const seededValue = (seed: number, index: number) => {
  const value = Math.sin(seed * 9301 + index * 49297) * 233280
  return value - Math.floor(value)
}

const wrap = (value: number, length: number) => ((value % length) + length) % length

const indexes = (count: number) => Array.from({ length: count }, (_, index) => index)

const traceLine = (context: Context, points: [number, number][]) =>
  points.forEach(([x, y], pointIndex) =>
    pointIndex === 0 ? context.moveTo(x, y) : context.lineTo(x, y)
  )

const drawWater = (context: Context, world: World) => {
  const gradient = context.createLinearGradient(0, 0, 0, WORLD_HEIGHT)
  gradient.addColorStop(0, '#0d5580')
  gradient.addColorStop(0.45, '#073452')
  gradient.addColorStop(1, '#03192c')
  context.fillStyle = gradient
  context.fillRect(0, 0, world.width, WORLD_HEIGHT)

  context.fillStyle = 'rgba(170, 225, 255, 0.055)'
  LIGHT_RAYS.forEach((rayPosition, rayIndex) => {
    const topX = world.width * rayPosition + Math.sin(world.time * 0.25 + rayIndex * 1.7) * 40
    context.beginPath()
    context.moveTo(topX, 0)
    context.lineTo(topX + 70, 0)
    context.lineTo(topX - 60, WORLD_HEIGHT * 0.85)
    context.lineTo(topX - 230, WORLD_HEIGHT * 0.85)
    context.closePath()
    context.fill()
  })
}

const drawFarReef = (context: Context, world: World) => {
  const offset = world.distance * 0.2
  context.fillStyle = '#062944'
  const ridge = indexes(Math.ceil(world.width / 20) + 2).map((pointIndex): [number, number] => {
    const x = pointIndex * 20
    const height = 70 + Math.sin((x + offset) * 0.008) * 35 + Math.sin((x + offset) * 0.021) * 18
    return [x, SEABED_TOP - height]
  })
  context.beginPath()
  traceLine(context, [[0, SEABED_TOP], ...ridge, [world.width, SEABED_TOP]])
  context.closePath()
  context.fill()
}

const drawMarineSnow = (context: Context, world: World) => {
  MARINE_SNOW.forEach((flake) => {
    const x = wrap(flake.x * world.width * 1.3 - world.distance * 0.3 * flake.depth, world.width)
    const y = wrap(flake.y * WORLD_HEIGHT + world.time * 10 * flake.depth, SEABED_TOP)
    context.fillStyle = `rgba(220, 240, 255, ${0.12 + flake.depth * 0.3})`
    context.beginPath()
    context.arc(x, y, flake.radius, 0, Math.PI * 2)
    context.fill()
  })
}

const rockGradient = (context: Context, left: number) => {
  const gradient = context.createLinearGradient(left, 0, left + OBSTACLE_WIDTH, 0)
  gradient.addColorStop(0, '#2a6a8c')
  gradient.addColorStop(0.5, '#164a68')
  gradient.addColorStop(1, '#0c2f47')
  return gradient
}

const drawRock = (
  context: Context,
  left: number,
  top: number,
  bottom: number,
  seed: number,
  roundedEdge: 'top' | 'bottom'
) => {
  const radius = 30
  context.fillStyle = rockGradient(context, left)
  context.beginPath()
  context.roundRect(
    left,
    top,
    OBSTACLE_WIDTH,
    bottom - top,
    roundedEdge === 'top' ? [radius, radius, 0, 0] : [0, 0, radius, radius]
  )
  context.fill()

  const height = bottom - top
  indexes(6).forEach((bumpIndex) => {
    const isLeftSide = bumpIndex % 2 === 0
    const bumpY = top + 40 + seededValue(seed, bumpIndex) * Math.max(height - 80, 0)
    context.beginPath()
    context.arc(
      isLeftSide ? left + 4 : left + OBSTACLE_WIDTH - 4,
      bumpY,
      9 + seededValue(seed, bumpIndex + 10) * 8,
      0,
      Math.PI * 2
    )
    context.fill()
  })

  context.fillStyle = 'rgba(255, 255, 255, 0.06)'
  context.fillRect(left + 12, top + (roundedEdge === 'top' ? 24 : 0), 6, height - 24)
}

const CORAL_COLORS = ['#ff7a9c', '#ff9f5a', '#ffd166', '#c792ff']

const drawCoral = (context: Context, centerX: number, baseY: number, seed: number) =>
  indexes(3).forEach((clumpIndex) => {
    const clumpX = centerX - 26 + clumpIndex * 26
    const size = 8 + seededValue(seed, clumpIndex + 30) * 6
    context.fillStyle =
      CORAL_COLORS[Math.floor(seededValue(seed, clumpIndex + 20) * CORAL_COLORS.length)]
    context.beginPath()
    context.arc(clumpX, baseY, size, Math.PI, 0)
    context.fill()
    indexes(5).forEach((polypIndex) => {
      const angle = Math.PI + (polypIndex / 4) * Math.PI
      context.beginPath()
      context.arc(
        clumpX + Math.cos(angle) * size,
        baseY + Math.sin(angle) * size,
        size * 0.5,
        0,
        Math.PI * 2
      )
      context.fill()
    })
    context.fillStyle = 'rgba(255, 255, 255, 0.35)'
    context.beginPath()
    context.arc(clumpX - size * 0.3, baseY - size * 0.9, size * 0.18, 0, Math.PI * 2)
    context.fill()
  })

const drawAnemones = (
  context: Context,
  centerX: number,
  baseY: number,
  seed: number,
  time: number
) => {
  indexes(4).forEach((anemoneIndex) => {
    const x = centerX - 30 + anemoneIndex * 20
    const length = 10 + seededValue(seed, anemoneIndex + 40) * 10
    const sway = Math.sin(time * 2 + anemoneIndex) * 3
    context.strokeStyle = anemoneIndex % 2 === 0 ? '#9b7bff' : '#5fd3c0'
    context.lineWidth = 4
    context.beginPath()
    context.moveTo(x, baseY)
    context.quadraticCurveTo(x + sway, baseY + length * 0.6, x + sway * 1.5, baseY + length)
    context.stroke()
  })
}

const drawObstacle = (context: Context, obstacle: Obstacle, time: number) => {
  const left = obstacle.x - OBSTACLE_WIDTH / 2
  const gapTop = obstacle.gapCenter - obstacle.gapHeight / 2
  const gapBottom = obstacle.gapCenter + obstacle.gapHeight / 2

  drawRock(context, left, -40, gapTop, obstacle.seed, 'bottom')
  drawRock(context, left, gapBottom, SEABED_TOP + 20, obstacle.seed + 1, 'top')
  drawAnemones(context, obstacle.x, gapTop - 2, obstacle.seed, time)
  drawCoral(context, obstacle.x, gapBottom + 4, obstacle.seed)
}

const drawSeabed = (context: Context, world: World) => {
  const gradient = context.createLinearGradient(0, SEABED_TOP, 0, WORLD_HEIGHT)
  gradient.addColorStop(0, '#7d7a68')
  gradient.addColorStop(1, '#3f4a4c')
  context.fillStyle = gradient
  context.fillRect(0, SEABED_TOP, world.width, WORLD_HEIGHT - SEABED_TOP)

  context.strokeStyle = 'rgba(255, 255, 255, 0.12)'
  context.lineWidth = 2
  indexes(3).forEach((rippleIndex) => {
    const y = SEABED_TOP + 16 + rippleIndex * 16
    context.beginPath()
    traceLine(
      context,
      indexes(Math.ceil(world.width / 12) + 1).map((pointIndex) => [
        pointIndex * 12,
        y + Math.sin((pointIndex * 12 + world.distance) * 0.05 + rippleIndex) * 3
      ])
    )
    context.stroke()
  })

  const kelpSpacing = 150
  context.strokeStyle = '#2f9e6e'
  context.lineWidth = 5
  context.lineCap = 'round'
  const firstKelpX = -wrap(world.distance, kelpSpacing)
  indexes(Math.ceil(world.width / kelpSpacing) + 2).forEach((clumpIndex) =>
    indexes(3).forEach((strandIndex) => {
      const baseX = firstKelpX + clumpIndex * kelpSpacing + strandIndex * 9
      const height = 34 + strandIndex * 10
      const sway = Math.sin(world.time * 1.8 + baseX * 0.05 + strandIndex) * 8
      context.beginPath()
      context.moveTo(baseX, SEABED_TOP + 6)
      context.quadraticCurveTo(
        baseX - sway,
        SEABED_TOP - height * 0.5,
        baseX + sway,
        SEABED_TOP - height
      )
      context.stroke()
    })
  )
}

const drawParticle = (context: Context, particle: Particle) => {
  const remaining = 1 - particle.age / particle.lifetime
  context.beginPath()
  context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
  if (particle.kind === 'ink') {
    context.fillStyle = `rgba(18, 10, 32, ${0.75 * remaining})`
    context.fill()
    return
  }
  context.strokeStyle = `rgba(230, 248, 255, ${0.8 * remaining})`
  context.lineWidth = 1.2
  context.stroke()
  context.fillStyle = `rgba(230, 248, 255, ${0.15 * remaining})`
  context.fill()
}

const drawTentacles = (context: Context, world: World) => {
  const jetStrength = Math.max(0, 1 - world.octopus.secondsSinceJet / 0.35)
  const spread = 1 - jetStrength * 0.6
  const length = 30 + jetStrength * 12

  context.lineCap = 'round'
  indexes(6).forEach((tentacleIndex) => {
    const baseX = (tentacleIndex - 2.5) * 6.5
    const sway = Math.sin(world.time * 7 + tentacleIndex * 1.3) * 6 * spread
    const tipX = baseX * 1.9 * spread + sway
    const tipY = 12 + length

    context.strokeStyle = '#e4583a'
    context.lineWidth = 6.5
    context.beginPath()
    context.moveTo(baseX, 8)
    context.quadraticCurveTo(baseX * 1.4 - sway, 12 + length * 0.55, tipX, tipY)
    context.stroke()

    context.strokeStyle = '#ff6f4e'
    context.lineWidth = 2.5
    context.beginPath()
    context.moveTo(tipX, tipY)
    context.quadraticCurveTo(tipX + 4, tipY + 3, tipX + 6, tipY - 2)
    context.stroke()
  })
}

const drawEyes = (context: Context, world: World) => {
  const lookY = Math.max(-1.5, Math.min(world.octopus.velocity / 200, 1.5))
  ;[-8, 8].forEach((eyeX) => {
    context.fillStyle = '#ffffff'
    context.beginPath()
    context.arc(eyeX, 4, 6.5, 0, Math.PI * 2)
    context.fill()

    context.strokeStyle = '#1b1030'
    context.fillStyle = '#1b1030'
    if (world.phase === 'over') {
      context.lineWidth = 2
      context.beginPath()
      context.moveTo(eyeX - 3, 1)
      context.lineTo(eyeX + 3, 7)
      context.moveTo(eyeX + 3, 1)
      context.lineTo(eyeX - 3, 7)
      context.stroke()
      return
    }
    context.beginPath()
    context.roundRect(eyeX - 1.5, 2.5 + lookY, 6, 3.2, 1.6)
    context.fill()
  })
}

const drawMantle = (context: Context) => {
  const gradient = context.createRadialGradient(-8, -18, 4, 0, -6, MANTLE_RADIUS + 10)
  gradient.addColorStop(0, '#ffb39a')
  gradient.addColorStop(0.55, '#ff7a59')
  gradient.addColorStop(1, '#de4f31')
  context.fillStyle = gradient
  context.beginPath()
  context.ellipse(0, -6, MANTLE_RADIUS + 2, MANTLE_RADIUS + 7, 0, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = 'rgba(200, 60, 35, 0.45)'
  ;[
    [-7, -20, 3],
    [6, -24, 2.4],
    [9, -12, 2]
  ].forEach(([spotX, spotY, spotRadius]) => {
    context.beginPath()
    context.arc(spotX, spotY, spotRadius, 0, Math.PI * 2)
    context.fill()
  })
}

const drawOctopus = (context: Context, world: World) => {
  const tilt =
    world.phase === 'over' ? 0.5 : Math.max(-0.3, Math.min(world.octopus.velocity / 1100, 0.35))

  context.save()
  context.translate(octopusX(world), world.octopus.y)
  context.rotate(tilt)
  drawTentacles(context, world)
  drawMantle(context)
  drawEyes(context, world)
  context.restore()
}

export const drawWorld = (context: Context, world: World) => {
  drawWater(context, world)
  drawFarReef(context, world)
  drawMarineSnow(context, world)
  world.obstacles.forEach((obstacle) => drawObstacle(context, obstacle, world.time))
  drawSeabed(context, world)
  world.particles
    .filter((particle) => particle.kind === 'bubble')
    .forEach((particle) => drawParticle(context, particle))
  drawOctopus(context, world)
  world.particles
    .filter((particle) => particle.kind === 'ink')
    .forEach((particle) => drawParticle(context, particle))
}
