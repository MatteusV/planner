'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowRightIcon, PlaneIcon } from 'lucide-react'

import { UsersInTrips } from './users-in-trips'
import { useRouter } from 'next/navigation'

interface CardTripProps {
  id: string
  destination: string
  ends_at: Date
  starts_at: Date
  image_url?: string
  participants: {
    id: string
    name: string
  }[]
}

export function CardTrip({
  destination,
  ends_at,
  starts_at,
  participants,
  id,
  image_url,
}: CardTripProps) {
  const router = useRouter()
  const eventStartAndEndDates = {
    from: starts_at,
    to: ends_at,
  }
  const displayedDate =
    eventStartAndEndDates &&
    eventStartAndEndDates.from &&
    eventStartAndEndDates.to
      ? format(eventStartAndEndDates.from, "d' de 'LLL", { locale: ptBR })
          .concat(' até ')
          .concat(
            format(eventStartAndEndDates.to, "d' de 'LLL", { locale: ptBR }),
          )
      : null

  return (
    <div className="w-[380px] border rounded-lg border-zinc-700 shadow-shape ">
      <div className="bg-[#1c1c1c] space-y-14 rounded-lg overflow-hidden">
        <div className="h-40 bg-gradient-to-r from-[#a3e635] to-[#00b894] flex items-center justify-center">
          {image_url ? (
            <img src={image_url} alt="Imagem da viagem." />
          ) : (
            <PlaneIcon className="size-10" />
          )}
        </div>
        <div className="p-4">
          <h3 className="text-xl font-bold mb-2">Viagem para {destination}</h3>
          <p className="text-gray-400 mb-4">{displayedDate}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 r">
              {participants &&
                participants.length > 0 &&
                participants.map((participant) => (
                  <UsersInTrips key={participant.id} name={participant.name} />
                ))}
            </div>
            <button
              onClick={() => {
                router.push(`/trips/${id}`)
              }}
              className="bg-[#a3e635] text-black border-none rounded-md px-4 py-2"
            >
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
