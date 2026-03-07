import { BookingLayout } from '@/modules/calendar/components/booking/booking-layout'

interface BookingPageProps {
  params: Promise<{ token: string }>
}

export default async function BookingPage({ params }: BookingPageProps) {
  // En MVP: el token se ignora. En Fase 2: resolver contra DB para cargar datos reales.
  const { token } = await params

  return <BookingLayout token={token} />
}

export const metadata = {
  title: 'Agendar Reunión — NellaSales',
  description: 'Elige el horario que mejor te funcione para tu reunión.',
}
