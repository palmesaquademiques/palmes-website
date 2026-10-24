import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type DepthAnchor = { position: number; depth: number; phase: string }

const MAXIMUM_DEPTH = 60

const readDepthAnchors = (): DepthAnchor[] => {
  const halfViewport = window.innerHeight / 2
  const anchors = [...document.querySelectorAll<HTMLElement>('[data-depth]')].map((element) => ({
    position: Math.max(element.getBoundingClientRect().top + window.scrollY, halfViewport),
    depth: Number(element.dataset.depth),
    phase: element.dataset.phase ?? ''
  }))
  const surface = {
    position: document.documentElement.scrollHeight - halfViewport,
    depth: 0,
    phase: 'Surface'
  }
  return [...anchors, surface].sort((first, second) => first.position - second.position)
}

const depthAt = (anchors: DepthAnchor[], position: number) => {
  const nextIndex = anchors.findIndex((anchor) => anchor.position > position)
  if (nextIndex <= 0) {
    const anchor = nextIndex === 0 ? anchors[0] : anchors[anchors.length - 1]
    return { depth: anchor.depth, phase: anchor.phase }
  }

  const previous = anchors[nextIndex - 1]
  const next = anchors[nextIndex]
  const progress = (position - previous.position) / (next.position - previous.position)
  return { depth: previous.depth + (next.depth - previous.depth) * progress, phase: previous.phase }
}

const trackDepth = () => {
  const gauge = document.querySelector<HTMLElement>('[data-depth-gauge]')
  if (!gauge) return

  const marker = gauge.querySelector<HTMLElement>('[data-depth-marker]')!
  const value = gauge.querySelector<HTMLElement>('[data-depth-value]')!
  const phase = gauge.querySelector<HTMLElement>('[data-depth-phase]')!
  let anchors = readDepthAnchors()

  const update = () => {
    const current = depthAt(anchors, window.scrollY + window.innerHeight / 2)
    marker.style.top = `${(current.depth / MAXIMUM_DEPTH) * 100}%`
    value.textContent = String(Math.round(current.depth))
    phase.textContent = current.phase
  }

  ScrollTrigger.addEventListener('refresh', () => {
    anchors = readDepthAnchors()
    update()
  })
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update })
  update()
}

const parallaxHero = () => {
  const scrollTrigger = { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true }
  gsap.to('[data-hero-content]', { yPercent: -30, opacity: 0, ease: 'none', scrollTrigger })
  gsap.to('[data-hero-media]', { yPercent: 18, scale: 1.08, ease: 'none', scrollTrigger })
}

const revealOnScroll = () => {
  gsap.set('[data-reveal]', { opacity: 0, y: 40 })
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%',
    once: true,
    onEnter: (elements) =>
      gsap.to(elements, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08 })
  })
}

const revealWords = () => {
  const paragraph = document.querySelector('[data-reveal-words]')
  if (!paragraph) return

  gsap.fromTo(
    paragraph.querySelectorAll('[data-word]'),
    { opacity: 0.14 },
    {
      opacity: 1,
      stagger: 0.1,
      ease: 'none',
      scrollTrigger: { trigger: paragraph, start: 'top 80%', end: 'bottom 45%', scrub: true }
    }
  )
}

const countKeyFigures = () =>
  gsap.utils.toArray<HTMLElement>('[data-count]').forEach((element) => {
    const match = element.textContent?.trim().match(/^(\d+)(.*)$/)
    if (!match) return

    const target = Number(match[1])
    const suffix = match[2]
    const counter = { value: target > 1000 ? target - 80 : 0 }
    const render = () => (element.textContent = `${Math.round(counter.value)}${suffix}`)

    render()
    gsap.to(counter, {
      value: target,
      duration: 2.2,
      ease: 'power3.out',
      onUpdate: render,
      scrollTrigger: { trigger: element, start: 'top 90%', once: true }
    })
  })

const stackChapters = () => {
  const cards = gsap.utils.toArray<HTMLElement>('[data-chapter-card]')
  cards.slice(0, -1).forEach((card, cardIndex) =>
    gsap.to(card, {
      scale: 0.94,
      ease: 'none',
      scrollTrigger: {
        trigger: cards[cardIndex + 1],
        start: 'top 75%',
        end: 'top top+=160',
        scrub: true
      }
    })
  )
}

const zoomChapterImages = () =>
  gsap.utils.toArray<HTMLElement>('[data-chapter-image]').forEach((image) =>
    gsap.fromTo(
      image,
      { scale: 1.3 },
      {
        scale: 1,
        ease: 'none',
        scrollTrigger: { trigger: image, start: 'top bottom', end: 'center center', scrub: true }
      }
    )
  )

const pinTrips = () => {
  const section = document.querySelector<HTMLElement>('[data-trips]')
  const track = section?.querySelector<HTMLElement>('[data-trips-track]')
  if (!section || !track) return

  const distance = () => track.scrollWidth - window.innerWidth
  if (distance() <= 0) return

  gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${distance()}`,
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true
    }
  })
}

const motionQueries = gsap.matchMedia()

motionQueries.add('(prefers-reduced-motion: no-preference)', () => {
  parallaxHero()
  revealOnScroll()
  revealWords()
  countKeyFigures()
  zoomChapterImages()
})

motionQueries.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
  stackChapters()
  pinTrips()
})

trackDepth()
