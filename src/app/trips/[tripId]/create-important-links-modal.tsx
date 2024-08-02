import { Link2, Tag, X } from 'lucide-react'
import { FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { Button } from '@/components/button'
import { toast } from 'sonner'

interface CreateActivityModalProps {
  closeCreateImportantLinkModal: () => void
  guestPayload: { name: string; email: string } | undefined
}

export function CreateImportantLink({
  closeCreateImportantLinkModal,
  guestPayload,
}: CreateActivityModalProps) {
  const { tripId } = useParams()
  const router = useRouter()

  async function createImportantLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const data = new FormData(event.currentTarget)

    const url = data.get('url')?.toString()
    const title = data.get('title')?.toString()

    const payload = {
      title,
      url,
      guestPayload: guestPayload ?? null,
    }

    const { status } = await fetch(`/api/trips/${tripId}/links/create`, {
      method: 'post',
      body: JSON.stringify(payload),
    })

    switch (status) {
      case 201:
        toast.success('Link criado com sucesso.')

        setTimeout(() => {
          window.location.reload()
        }, 700)
        break

      case 500:
        toast.error('Erro ao criar o link, tente novamente mais tarde.')
        break

      case 400:
        toast.error('Erro ao encontrar a viagem.')
        router.push('/user/trips')
        break
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="w-[640px] rounded-xl py-5 px-6 shadow-shape bg-zinc-900 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-lg font-semibold">Cadastrar link importante</h2>
            <button>
              <X
                className="size-5 text-zinc-400"
                onClick={closeCreateImportantLinkModal}
              />
            </button>
          </div>

          <p className="text-sm text-zinc-400">
            Todos convidados podem visualizar os links.
          </p>
        </div>

        <form onSubmit={createImportantLink} className="space-y-3">
          <div className="h-14 px-4 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-2">
            <Tag className="text-zinc-400 size-5" />
            <input
              name="title"
              placeholder="Qual o nome do link?"
              className="bg-transparent text-lg placeholder-zinc-400 outline-none flex-1"
            />
          </div>

          <div className="h-14 flex-1 px-4 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-2">
            <Link2 className="text-zinc-400 size-5" />
            <input
              type="url"
              name="url"
              placeholder="Qual o endereço da url?"
              className="bg-transparent text-lg placeholder-zinc-400 outline-none flex-1"
            />
          </div>

          <Button size="full">Salvar link</Button>
        </form>
      </div>
    </div>
  )
}
