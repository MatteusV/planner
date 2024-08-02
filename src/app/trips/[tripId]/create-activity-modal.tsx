import { Calendar, Tag, X } from 'lucide-react'
import { Button } from '@/components/button'
import { FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface CreateActivityModalProps {
  closeCreateActivityModal: () => void
}

export function CreateActivityModal({
  closeCreateActivityModal,
}: CreateActivityModalProps) {
  const { tripId } = useParams()
  const router = useRouter()

  async function createActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const data = new FormData(event.currentTarget)

    const title = data.get('title')?.toString()
    const occurs_at = data.get('occurs_at')?.toString()

    const payload = {
      title,
      occurs_at,
    }

    const { status } = await fetch(`/api/trips/${tripId}/activities/create`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    switch (status) {
      case 201:
        toast.success('Atividade criada.')

        setTimeout(() => {
          window.location.reload()
        }, 800)
        break

      case 400:
        toast.error('Não foi possivel achar a viagem no banco de dados.')

        setTimeout(() => {
          router.push(`/user/trips/`)
        }, 800)
        break

      case 500:
        toast.error('Erro no nosso servidor, tente novamente mais tarde.')
        break
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="w-[640px] rounded-xl py-5 px-6 shadow-shape bg-zinc-900 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-lg font-semibold">Cadastrar atividade</h2>
            <button>
              <X
                className="size-5 text-zinc-400"
                onClick={closeCreateActivityModal}
              />
            </button>
          </div>

          <p className="text-sm text-zinc-400">
            Todos convidados podem visualizar as atividades.
          </p>
        </div>

        <form onSubmit={createActivity} className="space-y-3">
          <div className="h-14 px-4 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-2">
            <Tag className="text-zinc-400 size-5" />
            <input
              name="title"
              placeholder="Qual a atividade?"
              className="bg-transparent text-lg placeholder-zinc-400 outline-none flex-1"
            />
          </div>

          <div className="h-14 flex-1 px-4 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-2">
            <Calendar className="text-zinc-400 size-5" />
            <input
              type="datetime-local"
              name="occurs_at"
              placeholder="Data e horário da atividade"
              className="bg-transparent text-lg placeholder-zinc-400 outline-none flex-1"
            />
          </div>

          <Button size="full">Salvar atividade</Button>
        </form>
      </div>
    </div>
  )
}
