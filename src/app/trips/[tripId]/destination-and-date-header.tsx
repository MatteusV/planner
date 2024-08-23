import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import dayjs from 'dayjs'
import { ArrowLeftIcon, Calendar, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DestinationAndDateHeaderProps {
  destination?: string
  starts_at?: string | Date
  ends_at?: string | Date
}

export function DestinationAndDateHeader({
  destination,
  ends_at,
  starts_at,
}: DestinationAndDateHeaderProps) {
  const startsAt = dayjs(starts_at).toDate()
  const endsAt = dayjs(ends_at).toDate()

  const displayedDate = format(startsAt, "d' de 'LLL", { locale: ptBR })
    .concat(' até ')
    .concat(format(endsAt, "d' de 'LLL", { locale: ptBR }))
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
          <span className="text-zinc-100">{destination}</span>
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
