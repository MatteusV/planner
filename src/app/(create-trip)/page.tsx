'use client'
import { UserCogIcon } from 'lucide-react'
import { FormEvent, useEffect, useState } from 'react'
import { DateRange } from 'react-day-picker'
import { toast } from 'sonner'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmTripModal } from './confirm-trip-modal'
import { InviteGuestsModal } from './invite-guests-modal'
import { LoginModal } from './login-modal'
import { DestinationAndDateStep } from './steps/destination-and-date-step'
import { InviteGuestsStep } from './steps/invite-guests-step'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface UsersToInvite {
  name: string
  email: string
}

export default function CreateTripPage() {
  const [isGuestsInputOpen, setIsGuestsInputOpen] = useState(false)
  const [isGuestsModalOpen, setIsGuestsModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [createTripIsSubmitting, setCreateTripIsSubmitting] = useState(false)
  const [isConfirmTripModalOpen, setIsConfirmTripModalOpen] = useState(false)
  const [refreshToken, setRefreshToken] = useState('')
  const [usersToInvite, setUsersToInvite] = useState<UsersToInvite[]>([])

  const [destination, setDestination] = useState('')

  const [eventStartAndEndDates, setEventStartAndEndDates] = useState<
    DateRange | undefined
  >()

  const router = useRouter()

  useEffect(() => {
    const token = window.localStorage.getItem('token')

    if (token) {
      setRefreshToken(token)
      setIsLoginModalOpen(false)
    } else {
      setIsLoginModalOpen(true)
    }
  }, [])

  function openGuestsInput() {
    setIsGuestsInputOpen(true)
  }

  function closeGuestsInput() {
    setIsGuestsInputOpen(false)
  }

  function openGuestsModal() {
    setIsGuestsModalOpen(true)
  }

  function closeGuestsModal() {
    setIsGuestsModalOpen(false)
  }

  function openConfirmTripModal() {
    setIsConfirmTripModalOpen(true)
  }

  function closeConfirmTripModal() {
    setIsConfirmTripModalOpen(false)
  }

  function addNewEmailToInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = data.get('email')?.toString()
    const name = data.get('name')?.toString()

    if (!email) {
      toast.error('Digite o email do(a) participante')
      return
    }

    if (!name) {
      toast.error('Digite o nome do(a) participante')
      return
    }

    const userAlreadyInvited = usersToInvite.find(
      (user) => user.email === email,
    )

    if (userAlreadyInvited) {
      toast.error(`Você ja convidou o(a) ${userAlreadyInvited.name}`)
      return
    }

    setUsersToInvite([...usersToInvite, { email, name }])

    event.currentTarget.reset()
  }

  function removeEmailFromInvites(emailToRemove: string) {
    const newEmailList = usersToInvite.filter(
      (user) => user.email !== emailToRemove,
    )

    setUsersToInvite(newEmailList)
  }

  async function createTrip() {
    if (!destination) {
      toast.error('Mencione o lugar da viagem!')
      return
    }

    if (!eventStartAndEndDates?.from || !eventStartAndEndDates?.to) {
      toast.error('Mencione a data corretamente!')
      return
    }

    if (usersToInvite.length === 0) {
      toast.error('Você não convidou ninguém para a viagem.')
      return
    }

    setCreateTripIsSubmitting(true)

    const payload = {
      destination,
      starts_at: eventStartAndEndDates.from,
      ends_at: eventStartAndEndDates.to,
      emails_to_invite: usersToInvite,
    }

    const response = await fetch(`/api/trips/create`, {
      body: JSON.stringify(payload),
      method: 'POST',
    })

    const responseJson = await response.json()

    switch (response.status) {
      case 201:
        router.push(`/trips/${responseJson.tripId}`)
        break

      case 400:
        toast.error('Erro ao criar a sua viagem.')
        setCreateTripIsSubmitting(false)
        break
    }

    setCreateTripIsSubmitting(false)
  }

  function closeLoginModal() {
    setIsLoginModalOpen(false)
  }

  return (
    <div className="h-screen flex items-center justify-center bg-pattern bg-no-repeat bg-center">
      <div className="max-w-3xl w-full px-6 text-center space-y-10">
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/logo.svg"
            alt="plann.er"
            width={300}
            height={300}
            className="w-auto h-auto"
          />
          <p className="text-zinc-300 text-lg">
            Convide seus amigos e planeje sua próxima viagem!
          </p>
        </div>

        <div className="space-y-4">
          <DestinationAndDateStep
            closeGuestsInput={closeGuestsInput}
            isGuestsInputOpen={isGuestsInputOpen}
            openGuestsInput={openGuestsInput}
            setDestination={setDestination}
            setEventStartAndEndDates={setEventStartAndEndDates}
            eventStartAndEndDates={eventStartAndEndDates}
          />

          {isGuestsInputOpen && (
            <InviteGuestsStep
              createTripIsSubmitting={createTripIsSubmitting}
              usersToInvite={usersToInvite}
              openConfirmTripModal={openConfirmTripModal}
              openGuestsModal={openGuestsModal}
              createTrip={createTrip}
            />
          )}
        </div>

        <p className="text-sm text-zinc-500">
          Ao planejar sua viagem pela plann.er você automaticamente concorda{' '}
          <br />
          com nossos{' '}
          <a className="text-zinc-300 underline" href="#">
            termos de uso
          </a>{' '}
          e{' '}
          <a className="text-zinc-300 underline" href="#">
            políticas de privacidade
          </a>
          .
        </p>
        <div className="flex w-full justify-center gap-10">
          {refreshToken ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <UserCogIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black border-zinc-500">
                <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
                <DropdownMenuSeparator className="border border-zinc-700" />
                <DropdownMenuItem
                  onClick={() => {
                    router.push('user/trips')
                    console.log('navigate')
                  }}
                >
                  Viagens
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    console.log('Configuração do usuario')
                  }}
                >
                  Configuração
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              className="text-sm underline text-zinc-400"
              onClick={() => {
                setIsLoginModalOpen(true)
              }}
            >
              Login / Registrar
            </button>
          )}
        </div>
      </div>

      {isGuestsModalOpen && (
        <InviteGuestsModal
          usersToInvite={usersToInvite}
          addNewEmailToInvite={addNewEmailToInvite}
          closeGuestsModal={closeGuestsModal}
          removeEmailFromInvites={removeEmailFromInvites}
        />
      )}

      {isConfirmTripModalOpen && (
        <ConfirmTripModal
          closeConfirmTripModal={closeConfirmTripModal}
          createTrip={createTrip}
        />
      )}

      {isLoginModalOpen && <LoginModal closeLoginModal={closeLoginModal} />}
    </div>
  )
}
