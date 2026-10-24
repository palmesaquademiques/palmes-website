import type { TripStatus, TripSummary } from './queries'

export type DisplayStatus = TripStatus | 'past'

export const statusLabels: Record<DisplayStatus, string> = {
  'to-confirm': 'À confirmer',
  confirmed: 'Confirmée',
  'registration-open': 'Inscriptions ouvertes',
  full: 'Complet',
  cancelled: 'Annulée',
  past: 'Sortie passée'
}

const endOf = (trip: TripSummary) => trip.endDate ?? trip.startDate

export const isUpcoming = (trip: TripSummary, today: string) => endOf(trip) >= today

export const displayStatus = (trip: TripSummary, today: string): DisplayStatus =>
  isUpcoming(trip, today) ? trip.status : 'past'

export const showsRegistrationForm = (trip: TripSummary, today: string) =>
  Boolean(trip.helloAssoUrl) &&
  isUpcoming(trip, today) &&
  trip.status !== 'cancelled' &&
  trip.status !== 'full'

export const splitTrips = <Trip extends TripSummary>(trips: Trip[], today: string) => ({
  upcoming: trips.filter((trip) => isUpcoming(trip, today)),
  past: trips.filter((trip) => !isUpcoming(trip, today)).toReversed()
})
