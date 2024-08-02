'use client'

import { Button } from '@/components/button'
import { AtSign, User } from 'lucide-react'
import { useParams } from 'next/navigation'
import { FormEvent } from 'react'
import { toast } from 'sonner'

interface ModalGuest {
  setIsGuest: (isGuest: boolean) => void
}

export function ModalGuest({ setIsGuest }: ModalGuest) {
  const { tripId } = useParams()

  async function handleSaveGuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const data = new FormData(event.currentTarget)
    const name = data.get('name')?.toString()
    const email = data.get('email')?.toString()

    const payload = {
      name,
      email,
    }

    const { status } = await fetch(`/api/trips/${tripId}/verify`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (status === 200) {
      toast.success('Fique por dentro das atividades.')
      window.localStorage.setItem('guest', JSON.stringify(payload))
    } else {
      toast.error('Você não foi convidado para a viagem.')
      setTimeout(() => {
        window.location.href = '/'
      }, 700)
    }

    setIsGuest(false)
  }
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="w-[640px] rounded-xl py-5 px-6 shadow-shape bg-zinc-900 space-y-5">
        <div className="space-y-1.5">
          <h2 className="text-zinc-300">
            Digite seu <span className="text-zinc-100">nome</span> e{' '}
            <span className="text-zinc-100">email</span>
          </h2>

          <p className="text-zinc-400">
            Precisamos do nome e email para confirmar se você é o participante
          </p>
        </div>

        <div>
          <form className="space-y-3" onSubmit={handleSaveGuest}>
            <div className="h-14 px-4 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-2">
              <User className="text-zinc-400 size-5" />
              <input
                name="name"
                id="email"
                placeholder="Qual é o seu nome?"
                className="bg-transparent text-lg placeholder-zinc-400 outline-none flex-1"
              />
            </div>

            <div className="h-14 flex-1 px-4 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-2">
              <AtSign className="text-zinc-400 size-5" />
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Qual é o seu email?"
                className="bg-transparent text-lg placeholder-zinc-400 outline-none flex-1"
              />
            </div>

            <Button size="full">Salvar</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
