import { createImageUrlBuilder } from '@sanity/image-url'
import type { SanityImage } from './queries'
import { withFrenchSpacing } from './typography'

const projectId = import.meta.env.SANITY_PROJECT_ID
const dataset = import.meta.env.SANITY_DATASET ?? 'production'
const API_VERSION = '2025-02-19'

if (!projectId) {
  throw new Error(
    'SANITY_PROJECT_ID is missing: copy site/.env.example to site/.env and fill it in'
  )
}

export const sanityQuery = async <Result>(
  query: string,
  parameters: Record<string, unknown> = {}
): Promise<Result> => {
  const searchParameters = new URLSearchParams([
    ['query', query],
    ['perspective', 'published'],
    ...Object.entries(parameters).map(([name, value]) => [`$${name}`, JSON.stringify(value)])
  ])

  const response = await fetch(
    `https://${projectId}.api.sanity.io/v${API_VERSION}/data/query/${dataset}?${searchParameters}`
  )
  if (!response.ok) {
    throw new Error(`Sanity query failed with ${response.status}: ${await response.text()}`)
  }

  const { result } = await response.json()
  return withFrenchSpacing(result) as Result
}

const imageBuilder = createImageUrlBuilder({ projectId, dataset })

export const imageUrl = (image: SanityImage) => imageBuilder.image(image).auto('format').quality(78)
