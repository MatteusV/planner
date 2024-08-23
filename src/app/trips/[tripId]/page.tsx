'use client'

import { LoaderCircle, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/button'
import { Activities as ActivitiesComponent } from './activities'
import { CreateActivityModal } from './create-activity-modal'
import { CreateImportantLink } from './create-important-links-modal'
import { DestinationAndDateHeader } from './destination-and-date-header'
import { Guests } from './guests'
import { ImportantLinks } from './important-links'
import { ManageGuestsModal } from './manage-guests-modal'
import { UploadImage } from './upload-image'
import { useParams, useRouter } from 'next/navigation'
import { ModalGuest } from './modal-guest'
import { ModalChat } from './modal-chat'
import { getCookie } from '@/app/api/server-actions/get-cookie'
import { api } from '@/lib/axios'

interface Guest {
  name: string
  email: string
}

interface Activities {
  date: string
  activities: [
    {
      id: string
      title: string
      occurs_at: string
      has_occurred: false
    },
  ]
}

interface Link {
  id: string
  title: string
  url: string
  trip_id: string
  owner_email: string
  owner_name: string
}

interface Participant {
  id: string
  name: string | null
  email: string
  is_confirmed: boolean
}

interface Trip {
  id: string
  destination: string
  starts_at: Date | string
  ends_at: Date | string
  user_id: string
  image_url: string | null
  image_name: string | null
  is_confirmed: boolean
  created_at: Date | string

  participants?: Participant[]
  links?: Link[]
  activities?: Activities[]
}

export default function TripDetailsPage() {
  const { tripId } = useParams()

  const [activities, setActivities] = useState<Activities[]>()
  const [links, setLinks] = useState<Link[]>()
  const [participants, setParticipants] = useState<Participant[]>()
  const [trip, setTrip] = useState<Trip>()

  const [openModalGuest, setOpenModalGuest] = useState(false)
  const [guestPayload, setGuestPayload] = useState<Guest>()

  const router = useRouter()
  useEffect(() => {
    async function fetchData() {
      const { data, status } = await api.get(
        `http://localhost:3000/trips/${tripId}`,
      )

      if (status === 404) {
        toast.error('Viagem não foi encontrada.')
      }

      setTrip(data.trip)
      setActivities(data.trip.activities)
      setLinks(data.trip.links)
      setParticipants(data.trip.participants)
    }

    fetchData()

    getCookie({ title: '@planner:tokenJwt' }).then(({ tokenJwt }) => {
      const guestPayload = window.localStorage.getItem('guest')

      if (guestPayload) {
        setGuestPayload(JSON.parse(guestPayload))
      }

      if (guestPayload && tokenJwt) {
        setOpenModalGuest(false)
      }

      if (!tokenJwt && !guestPayload) {
        setOpenModalGuest(true)
      }
    })
  }, [tripId])

  if (typeof tripId === 'object') {
    throw new Error('trip not found')
  }

  const [isCreateActivityModalOpen, setIsCreateActivityModalOpen] =
    useState(false)
  const [isDeleteTripSending, setIsDeleteTripSending] = useState(false)

  const [isCreateImportantLinkModal, setIsCreateImportantLinkModal] =
    useState(false)

  const [isManageGuestsModal, setIsManageGuestsModal] = useState(false)

  function openCreateActivityModal() {
    setIsCreateActivityModalOpen(true)
  }

  function closeCreateActivityModal() {
    setIsCreateActivityModalOpen(false)
  }

  function openCreateImportantLinkModal() {
    setIsCreateImportantLinkModal(true)
  }

  function closeCreateImportantLinkModal() {
    setIsCreateImportantLinkModal(false)
  }

  function openManageGuestsModal() {
    setIsManageGuestsModal(true)
  }

  function closeManageGuestsModal() {
    setIsManageGuestsModal(false)
  }

  async function handleDeleteTrip() {
    setIsDeleteTripSending(true)

    const { status } = await api.delete(`trips/${tripId}`)

    switch (status) {
      case 200:
        toast.success('Viagem excluida com sucesso.')
        setIsDeleteTripSending(false)
        setTimeout(() => {
          router.push('/user/trips')
        }, 700)
        break

      case 500:
        toast.success('Erro ao excluir a viagem.')
        setIsDeleteTripSending(false)
        break

      case 401:
        toast.error('Você não tem autorização para excluir a viagem.')
        setIsDeleteTripSending(false)
        break
    }
  }

  return (
    <div className="max-w-6xl px-6 py-4 mx-auto space-y-8 ">
      <DestinationAndDateHeader
        destination={trip?.destination}
        ends_at={trip?.ends_at}
        starts_at={trip?.starts_at}
        key={trip?.id}
      />

      <main className="flex gap-16 px-4 max-md:flex-col">
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold max-md:text-xl">
              Atividades
            </h2>

            <button
              onClick={openCreateActivityModal}
              className="bg-lime-300 text-lime-950 rounded-lg px-5 py-2 font-medium flex items-center gap-2 hover:bg-lime-400 max-md:w-max max-md:px-3 max-md:py-2"
            >
              <Plus className="size-5 max-md:size-4" />
              Cadastrar atividade
            </button>
          </div>

          <ActivitiesComponent
            activities={activities!}
            guestPayload={guestPayload}
          />
        </div>

        <div className="w-80 space-y-6">
          <ImportantLinks
            links={links!}
            openCreateImportantLinkModal={openCreateImportantLinkModal}
          />

          <div className="w-full h-px bg-zinc-800" />

          <Guests
            participants={participants!}
            openManageGuestsModal={openManageGuestsModal}
          />

          <div
            data-hidden={!!guestPayload}
            className="w-full h-px bg-zinc-800 data-[hidden=true]:hidden"
          />
          {!guestPayload && (
            <>
              <UploadImage guestPayload={!!guestPayload} tripId={tripId!} />
              <div className="w-full h-px bg-zinc-800" />
            </>
          )}

          {isDeleteTripSending ? (
            <Button
              disabled
              onClick={handleDeleteTrip}
              size="full"
              variant="secondary"
            >
              <LoaderCircle className="size-5 text-zinc-400 animate-spin" />
            </Button>
          ) : (
            <Button
              onClick={handleDeleteTrip}
              size="full"
              variant={guestPayload ? 'disabled' : 'destructive'}
            >
              <Trash2 className="size-5 text-zinc-400" />
              Excluir viagem
            </Button>
          )}
        </div>
      </main>

      {isCreateActivityModalOpen && (
        <CreateActivityModal
          closeCreateActivityModal={closeCreateActivityModal}
        />
      )}

      {isCreateImportantLinkModal && (
        <CreateImportantLink
          guestPayload={guestPayload}
          closeCreateImportantLinkModal={closeCreateImportantLinkModal}
        />
      )}

      {isManageGuestsModal && (
        <ManageGuestsModal closeManageGuestsModal={closeManageGuestsModal} />
      )}

      {openModalGuest && <ModalGuest setOpenModalGuest={setOpenModalGuest} />}

      <ModalChat tripId={tripId} />
    </div>
  )
}
