import { Resvg } from '@resvg/resvg-js'
import { readFile } from 'node:fs/promises'
import satori from 'satori'
import type { SanityImage } from './queries'
import { imageUrl } from './sanity'

const WIDTH = 1200
const HEIGHT = 630

const fontFile = (weight: number) =>
  readFile(
    `node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-${weight}-normal.woff`
  )

const [boldFont, mediumFont, logo] = await Promise.all([
  fontFile(700),
  fontFile(500),
  readFile('public/logo.png')
])

const logoDataUri = `data:image/png;base64,${logo.toString('base64')}`

const backgroundDataUri = async (image: SanityImage) => {
  const response = await fetch(
    imageUrl(image).width(WIDTH).height(HEIGHT).fit('crop').format('jpg').url()
  )
  const buffer = Buffer.from(await response.arrayBuffer())
  return `data:image/jpeg;base64,${buffer.toString('base64')}`
}

const element = (
  type: string,
  style: Record<string, unknown>,
  children?: unknown,
  attributes = {}
) => ({
  type,
  props: { style, children, ...attributes }
})

const titleFontSize = (title: string) => (title.length > 40 ? 60 : title.length > 22 ? 76 : 96)

const fill = { position: 'absolute', top: 0, left: 0, width: WIDTH, height: HEIGHT }

const template = (title: string, subtitle: string, background: string | null) =>
  element(
    'div',
    { ...fill, display: 'flex', backgroundColor: '#020c16', fontFamily: 'Bricolage' },
    [
      background
        ? element('img', fill, undefined, { src: background, width: WIDTH, height: HEIGHT })
        : element('div', {
            ...fill,
            backgroundImage: 'radial-gradient(circle at 25% 20%, #0772b9, #020c16 70%)'
          }),
      element('div', {
        ...fill,
        backgroundImage:
          'linear-gradient(90deg, rgba(2,12,22,0.94) 0%, rgba(2,12,22,0.6) 55%, rgba(2,12,22,0.15) 100%)'
      }),
      element(
        'div',
        {
          position: 'absolute',
          top: 60,
          left: 72,
          width: WIDTH - 144,
          height: HEIGHT - 120,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        },
        [
          element('div', { display: 'flex', alignItems: 'center', gap: 18 }, [
            element('img', {}, undefined, { src: logoDataUri, width: 76, height: 76 }),
            element(
              'div',
              {
                display: 'flex',
                flexDirection: 'column',
                fontSize: 30,
                lineHeight: 1.05,
                color: 'white'
              },
              [
                element('span', {}, 'Les Palmes'),
                element('span', { color: '#2ba7de' }, 'Aquadémiques')
              ]
            )
          ]),
          element('div', { display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 860 }, [
            element('div', { width: 84, height: 7, borderRadius: 4, backgroundColor: '#ff7a59' }),
            element(
              'div',
              {
                fontSize: titleFontSize(title),
                lineHeight: 0.95,
                letterSpacing: '-0.03em',
                color: 'white',
                fontWeight: 700
              },
              title
            ),
            element(
              'div',
              { fontSize: 32, color: 'rgba(255,255,255,0.82)', fontWeight: 500 },
              subtitle
            )
          ])
        ]
      )
    ]
  )

export const renderShareImage = async ({
  title,
  subtitle,
  image
}: {
  title: string
  subtitle: string
  image: SanityImage | null
}) => {
  const background = image ? await backgroundDataUri(image) : null
  const svg = await satori(template(title, subtitle, background) as never, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      { name: 'Bricolage', data: boldFont, weight: 700, style: 'normal' },
      { name: 'Bricolage', data: mediumFont, weight: 500, style: 'normal' }
    ]
  })

  return new Uint8Array(new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng())
}
