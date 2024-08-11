import { Calendar, LoaderCircle, Tag, X } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { env } from '@/env'

interface InviteNewGuestModalProps {
  closeInviteNewGuestModal: () => void
}

export function InviteNewGuestModal({
  closeInviteNewGuestModal,
}: InviteNewGuestModalProps) {
  const { tripId } = useParams()

  const [isDisabledButton, setIsDisabledButton] = useState(false)

  async function inviteNewGuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setIsDisabledButton(true)

    const data = new FormData(event.currentTarget)
    const email = data.get('email')?.toString()
    const name = data.get('name')?.toString()

    const payload = {
      email,
      name,
    }

    const { status } = await fetch(
      `${env.API_BASE_URL}/api/trips/${tripId}/invites`,
      {
        method: 'post',
        body: JSON.stringify(payload),
      },
    )

    switch (status) {
      case 201:
        toast.success('Convite enviado.')
        setTimeout(() => {
          window.location.reload()
        }, 700)
        break

      case 400:
        toast.error('Falha ao enviar o convite.')
        break

      case 401:
        toast.error('Você não tem autorização para convidar.')
        break
    }

    setIsDisabledButton(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="w-[640px] rounded-xl py-5 px-6 shadow-shape bg-zinc-900 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-lg font-semibold">Adicionar novo convidado</h2>
            <button>
              <X
                className="size-5 text-zinc-400"
                onClick={closeInviteNewGuestModal}
              />
            </button>
          </div>
        </div>

        <form onSubmit={inviteNewGuest} className="space-y-3">
          <div className="h-14 px-4 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-2">
            <Tag className="text-zinc-400 size-5" />
            <input
              name="name"
              id="email"
              placeholder="Qual é o nome?"
              className="bg-transparent text-lg placeholder-zinc-400 outline-none flex-1"
            />
          </div>

          <div className="h-14 flex-1 px-4 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-2">
            <Calendar className="text-zinc-400 size-5" />
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Qual é o email?"
              className="bg-transparent text-lg placeholder-zinc-400 outline-none flex-1"
            />
          </div>

          {isDisabledButton ? (
            <button
              disabled
              className="rounded-lg w-full h-11 bg-lime-300 text-lime-950 hover:bg-lime-400 px-5 font-medium flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:bg-lime-800"
            >
              <LoaderCircle className="size-5 text-white animate-spin" />
            </button>
          ) : (
            <button className="rounded-lg w-full h-11 bg-lime-300 text-lime-950 hover:bg-lime-400 px-5 font-medium flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:bg-lime-800">
              Convidar
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
