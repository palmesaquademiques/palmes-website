const fromIsoDate = (isoDate: string) => new Date(`${isoDate}T00:00:00Z`)

const longFormat = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC'
})

const dayAndMonthFormat = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC'
})

const shortDayAndMonthFormat = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC'
})

const dayFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', timeZone: 'UTC' })

const parisDateFormat = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' })

const isSameDay = (startDate: string, endDate: string | null) => !endDate || endDate === startDate

const isSameMonth = (startDate: string, endDate: string) =>
  startDate.slice(0, 7) === endDate.slice(0, 7)

export const todayInParis = () => parisDateFormat.format(new Date())

export const formatDate = (isoDate: string) => longFormat.format(fromIsoDate(isoDate))

export const formatDateRange = (startDate: string, endDate: string | null) => {
  if (!endDate || isSameDay(startDate, endDate)) return `le ${formatDate(startDate)}`

  const start = fromIsoDate(startDate)
  if (isSameMonth(startDate, endDate)) {
    return `du ${dayFormat.format(start)} au ${formatDate(endDate)}`
  }

  const sameYear = startDate.slice(0, 4) === endDate.slice(0, 4)
  return `du ${sameYear ? dayAndMonthFormat.format(start) : formatDate(startDate)} au ${formatDate(endDate)}`
}

export const formatShortDateRange = (startDate: string, endDate: string | null) => {
  if (!endDate || isSameDay(startDate, endDate)) {
    return shortDayAndMonthFormat.format(fromIsoDate(startDate))
  }

  return isSameMonth(startDate, endDate)
    ? `${dayFormat.format(fromIsoDate(startDate))}–${shortDayAndMonthFormat.format(fromIsoDate(endDate))}`
    : `${shortDayAndMonthFormat.format(fromIsoDate(startDate))} – ${shortDayAndMonthFormat.format(fromIsoDate(endDate))}`
}

export const dayCount = (startDate: string, endDate: string | null) =>
  isSameDay(startDate, endDate)
    ? 1
    : Math.round(
        (fromIsoDate(endDate as string).getTime() - fromIsoDate(startDate).getTime()) / 86_400_000
      ) + 1

export const yearOf = (isoDate: string) => isoDate.slice(0, 4)
