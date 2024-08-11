'use client'
import { CheckCircle2, CircleDashed, Plus, UserCog } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

import { Button } from '@/components/button'
import { InviteNewGuestModal } from './invite-new-guest-modal'

interface Participant {
  id: string
  name: string | null
  email: string
  is_confirmed: boolean
}

interface GuestsProps {
  openManageGuestsModal: () => void
}

export function Guests({ openManageGuestsModal }: GuestsProps) {
  const { tripId } = useParams()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isInviteNewGuestModal, setIsInviteNewGuestModal] = useState(false)

  useEffect(() => {
    fetch(`/api/trips/${tripId}/participants`, {
      method: 'GET',
    }).then(async (response) => {
      const responseJson = await response.json()
      setParticipants(responseJson.participants)
    })
  }, [tripId])

  function openInviteNewGuestModal() {
    setIsInviteNewGuestModal(true)
  }

  function closeInviteNewGuestModal() {
    setIsInviteNewGuestModal(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-xl">Convidados</h2>
        <button
          title="Adicionar novo convidado"
          onClick={openInviteNewGuestModal}
          className="font-semibold text-xl"
        >
          <Plus className="size-5" />
        </button>
      </div>

      <div className="space-y-5">
        {participants.map((participant, index) => (
          <div
            key={participant.id}
            className="flex items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <span className="block font-medium text-zinc-100">
                {participant.name ?? `Convidado ${index}`}
              </span>
              <span className="block text-sm text-zinc-400 truncate">
                {participant.email}
              </span>
            </div>

            {participant.is_confirmed ? (
              <CheckCircle2 className="text-green-400 size-5 shrink-0" />
            ) : (
              <CircleDashed className="text-zinc-400 size-5 shrink-0" />
            )}
          </div>
        ))}
      </div>

      <Button onClick={openManageGuestsModal} variant="secondary" size="full">
        <UserCog className="size-5" />
        Gerenciar convidados
      </Button>

      {isInviteNewGuestModal && (
        <InviteNewGuestModal
          closeInviteNewGuestModal={closeInviteNewGuestModal}
        />
      )}
    </div>
  )
}
