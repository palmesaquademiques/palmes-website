const fromIsoDate = (isoDate: string) => new Date(`${isoDate}T00:00:00Z`)

const NO_BREAK_SPACE = '\u00A0'

const monthFormat = new Intl.DateTimeFormat('fr-FR', { month: 'long', timeZone: 'UTC' })

const parisDateFormat = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' })

const isSameDay = (startDate: string, endDate: string | null) => !endDate || endDate === startDate

const isSameMonth = (startDate: string, endDate: string) =>
  startDate.slice(0, 7) === endDate.slice(0, 7)

const dayOf = (date: Date) => (date.getUTCDate() === 1 ? '1er' : String(date.getUTCDate()))

const dayAndMonthOf = (date: Date) => `${dayOf(date)} ${monthFormat.format(date)}`

export const todayInParis = () => parisDateFormat.format(new Date())

export const formatDate = (isoDate: string) => {
  const date = fromIsoDate(isoDate)
  return `${dayAndMonthOf(date)} ${date.getUTCFullYear()}`
}

export const formatDateRange = (startDate: string, endDate: string | null) => {
  if (!endDate || isSameDay(startDate, endDate)) return `le ${formatDate(startDate)}`

  const start = fromIsoDate(startDate)
  if (isSameMonth(startDate, endDate)) return `du ${dayOf(start)} au ${formatDate(endDate)}`

  const sameYear = startDate.slice(0, 4) === endDate.slice(0, 4)
  return `du ${sameYear ? dayAndMonthOf(start) : formatDate(startDate)} au ${formatDate(endDate)}`
}

export const formatShortDateRange = (startDate: string, endDate: string | null) => {
  const start = fromIsoDate(startDate)
  if (!endDate || isSameDay(startDate, endDate)) return dayAndMonthOf(start)

  const startLabel = isSameMonth(startDate, endDate) ? dayOf(start) : dayAndMonthOf(start)
  return `${startLabel}${NO_BREAK_SPACE}– ${dayAndMonthOf(fromIsoDate(endDate))}`
}

export const dayCount = (startDate: string, endDate: string | null) =>
  isSameDay(startDate, endDate)
    ? 1
    : Math.round(
        (fromIsoDate(endDate as string).getTime() - fromIsoDate(startDate).getTime()) / 86_400_000
      ) + 1

export const yearOf = (isoDate: string) => isoDate.slice(0, 4)
