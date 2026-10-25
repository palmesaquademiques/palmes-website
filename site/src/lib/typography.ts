const NO_BREAK_SPACE = ' '

const isLink = (text: string) => /^(https?:|mailto:)/.test(text)

export const frenchSpacing = (text: string) =>
  isLink(text)
    ? text
    : text
        .replace(/(\S)[   ]?([?!;:]+)(?=\s|$)/gu, `$1${NO_BREAK_SPACE}$2`)
        .replace(/«[   ]?/gu, `«${NO_BREAK_SPACE}`)
        .replace(/[   ]?»/gu, `${NO_BREAK_SPACE}»`)

export const withFrenchSpacing = (value: unknown): unknown => {
  if (typeof value === 'string') return frenchSpacing(value)
  if (Array.isArray(value)) return value.map(withFrenchSpacing)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, withFrenchSpacing(nestedValue)])
    )
  }
  return value
}
