import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeftIcon, Calendar, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Trip {
  id: string
  destination: string
  starts_at: string
  ends_at: string
  is_confirmed: boolean
}

export function DestinationAndDateHeader() {
  const { tripId } = useParams()
  const [trip, setTrip] = useState<Trip | undefined>()

  useEffect(() => {
    fetch(`/api/trips/${tripId}/destination`, {
      method: 'GET',
      cache: 'force-cache',
    }).then(async (response) => {
      const responseJson = await response.json()
      setTrip(responseJson.trip)
    })
  }, [tripId])

  const displayedDate = trip
    ? format(trip.starts_at, "d' de 'LLL", { locale: ptBR })
        .concat(' até ')
        .concat(format(trip.ends_at, "d' de 'LLL", { locale: ptBR }))
    : null
  const router = useRouter()

  return (
    <div className="px-8 h-16 rounded-xl bg-zinc-900 shadow-shape flex items-center justify-between max-md:flex max-md:flex-col max-md:h-auto max-md:py-4 max-md:gap-5 max-md:items-center">
      <div className="flex items-center gap-5">
        <button
          onClick={() => {
            router.push('/user/trips')
          }}
        >
          <ArrowLeftIcon className="size-5 text-zinc-300" />
        </button>
        <div className="flex items-center gap-2">
          <MapPin className="size-5 text-zinc-400" />
          <span className="text-zinc-100">{trip?.destination}</span>
        </div>
      </div>

      <div className="flex items-center gap-5  max-md:flex max-md:flex-col max-md:h-auto">
        <div className="flex items-center gap-2">
          <Calendar className="size-5 text-zinc-400" />
          <span className="text-zinc-100">{displayedDate}</span>
        </div>
      </div>
    </div>
  )
}
